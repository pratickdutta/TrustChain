import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';

// Force dynamic rendering — prevents Vercel from caching this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const startTime = Date.now();

/**
 * GET /api/health
 *
 * Phase 2 (Black Belt): Production Monitoring & Health Check endpoint.
 * Used by monitoring dashboards to track system uptime and DB connectivity.
 */
export async function GET(req: NextRequest) {
  const checks: Record<string, { status: string; latencyMs?: number; error?: string }> = {};

  // Check MongoDB connectivity
  const dbStart = Date.now();
  try {
    await connectDB();
    checks.mongodb = { status: 'healthy', latencyMs: Date.now() - dbStart };
  } catch (err: any) {
    checks.mongodb = { status: 'unhealthy', latencyMs: Date.now() - dbStart, error: err.message };
  }

  // Check Stellar Horizon connectivity
  const horizonStart = Date.now();
  try {
    const horizonRes = await fetch('https://horizon-testnet.stellar.org/', {
      signal: AbortSignal.timeout(4000),
      cache: 'no-store',
    });
    checks.stellarHorizon = {
      status: horizonRes.ok ? 'healthy' : 'degraded',
      latencyMs: Date.now() - horizonStart,
    };
  } catch (err: any) {
    checks.stellarHorizon = { status: 'unhealthy', latencyMs: Date.now() - horizonStart, error: 'Timeout or unreachable' };
  }

  const allHealthy = Object.values(checks).every(c => c.status === 'healthy');
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);

  return NextResponse.json(
    {
      status: allHealthy ? 'operational' : 'degraded',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptimeSeconds,
      checks,
      timestamp: new Date().toISOString(),
    },
    { status: allHealthy ? 200 : 503 }
  );
}
