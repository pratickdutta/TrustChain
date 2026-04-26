import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import mongoose from 'mongoose';

// Force dynamic rendering — prevents Vercel from caching this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/health
 * 
 * Phase 2 (Black Belt): Production Monitoring & Health Check endpoint.
 * Used by monitoring dashboards to track system uptime and DB connectivity.
 */
export async function GET(req: NextRequest) {
  const checks: Record<string, { status: string; latencyMs?: number; error?: string }> = {};
  
  // 1. Check MongoDB connectivity
  const dbStart = Date.now();
  try {
    const db = await connectDB();
    const readyState = mongoose.connection.readyState;
    
    // readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    checks.mongodb = { 
      status: readyState === 1 ? 'healthy' : 'unhealthy',
      latencyMs: Date.now() - dbStart 
    };
    
    if (readyState !== 1) {
      checks.mongodb.error = `Invalid connection state: ${readyState}`;
    }
  } catch (err: any) {
    checks.mongodb = { status: 'unhealthy', latencyMs: Date.now() - dbStart, error: err.message };
  }

  // 2. Check Stellar Horizon connectivity
  const horizonStart = Date.now();
  const horizonUrl = process.env.STELLAR_HORIZON_URL || 'https://horizon-testnet.stellar.org';
  try {
    const horizonRes = await fetch(horizonUrl, {
      signal: AbortSignal.timeout(3000), // Reduced timeout for faster health check
      cache: 'no-store',
    });
    
    checks.stellarHorizon = {
      status: horizonRes.ok ? 'healthy' : 'degraded',
      latencyMs: Date.now() - horizonStart,
    };
    
    if (!horizonRes.ok) {
      checks.stellarHorizon.error = `HTTP ${horizonRes.status}`;
    }
  } catch (err: any) {
    checks.stellarHorizon = { 
      status: 'unhealthy', 
      latencyMs: Date.now() - horizonStart, 
      error: 'Timeout or unreachable' 
    };
  }

  // 3. System Metrics
  const mem = process.memoryUsage();
  const system = {
    memory: {
      heapUsedMB: Math.round(mem.heapUsed / 1024 / 1024),
      heapTotalMB: Math.round(mem.heapTotal / 1024 / 1024),
      rssMB: Math.round(mem.rss / 1024 / 1024),
    },
    uptimeSeconds: Math.floor(process.uptime()),
  };

  const allHealthy = Object.values(checks).every(c => c.status === 'healthy');
  const anyUnhealthy = Object.values(checks).some(c => c.status === 'unhealthy');

  const responseBody = {
    status: allHealthy ? 'operational' : (anyUnhealthy ? 'unhealthy' : 'degraded'),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptimeSeconds: system.uptimeSeconds,
    checks,
    system,
    timestamp: new Date().toISOString(),
  };

  return new NextResponse(JSON.stringify(responseBody), {
    status: anyUnhealthy ? 503 : 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store',
    },
  });
}
