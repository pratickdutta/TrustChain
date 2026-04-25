'use client';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import {
  Users, Activity, Coins, ShieldCheck, TrendingUp, TrendingDown,
  AlertTriangle, CheckCircle2, Zap, Circle, Database, Server, Clock,
  BarChart3, Globe
} from 'lucide-react';

async function fetchMetrics() {
  const res = await fetch('/api/metrics');
  if (!res.ok) throw new Error('Failed to fetch metrics');
  return res.json();
}

async function fetchHealth() {
  const res = await fetch('/api/health');
  return res.json();
}

function StatCard({ label, value, sub, icon: Icon, color, delay = 0 }: any) {
  return (
    <div className="glass-card animate-fade-in-up" style={{
      padding: '24px 20px', animationDelay: `${delay}ms`,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: `${color}18`, border: `1px solid ${color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={22} color={color} />
        </div>
      </div>
      <div style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'var(--font-heading)', color: 'var(--c-text)', lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: '0.8rem', color: 'var(--c-text-2)', marginTop: 6, fontWeight: 600 }}>{label}</div>
      {sub && <div style={{ fontSize: '0.72rem', color: 'var(--c-text-3)', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function TierBar({ tier, count, total }: { tier: string; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  const colors: Record<string, string> = {
    platinum: '#c084fc', gold: '#fbbf24', silver: '#94a3b8',
    bronze: '#fb923c', building: '#60a5fa', establishing: '#6b7280',
  };
  const color = colors[tier] || 'var(--c-primary)';
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 6 }}>
        <span style={{ color: 'var(--c-text)', fontWeight: 600, textTransform: 'capitalize' }}>{tier}</span>
        <span style={{ color: 'var(--c-text-3)' }}>{count} ({pct}%)</span>
      </div>
      <div style={{ height: 6, background: 'var(--c-surface-2)', borderRadius: 99 }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 99, transition: 'width 1s ease' }} />
      </div>
    </div>
  );
}

export default function MetricsDashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  async function load() {
    setLoading(true);
    try {
      const [m, h] = await Promise.all([fetchMetrics(), fetchHealth()]);
      setMetrics(m);
      setHealth(h);
      setLastRefresh(new Date());
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const tierTotal = metrics?.network?.tierDistribution?.reduce((s: number, t: any) => s + t.count, 0) || 0;

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <div className="container page-content">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 8 }}>
          <div>
            <h1 className="section-title" style={{ marginBottom: 4 }}>Protocol Metrics</h1>
            <p className="section-subtitle">Live performance dashboard — auto-refreshes every 30s</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 10, height: 10, borderRadius: '50%',
              background: health?.status === 'operational' ? '#00C878' : '#ff4757',
              boxShadow: health?.status === 'operational' ? '0 0 6px #00C87860' : '0 0 6px #ff475760',
              animation: 'pulse 2s infinite',
            }} />
            <span style={{ fontSize: '0.8rem', color: 'var(--c-text-2)', fontWeight: 600 }}>
              {health?.status === 'operational' ? 'All Systems Operational' : 'System Degraded'}
            </span>
            <button onClick={load} className="btn btn-ghost" style={{ padding: '6px 14px', fontSize: '0.78rem' }}>
              ↻ Refresh
            </button>
          </div>
        </div>

        <div style={{ fontSize: '0.72rem', color: 'var(--c-text-3)', marginBottom: 32 }}>
          Last updated: {lastRefresh.toLocaleTimeString()}
        </div>

        {loading && !metrics ? (
          <div style={{ textAlign: 'center', padding: 80, color: 'var(--c-text-3)' }}>
            <Activity size={32} style={{ margin: '0 auto 16px' }} />
            <div>Loading metrics...</div>
          </div>
        ) : metrics ? (
          <>
            {/* ─── USER METRICS ──────────────────────────────────── */}
            <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--c-text-3)', marginBottom: 16 }}>USER METRICS</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
              <StatCard label="Total Users" value={metrics.users.total} sub="All-time registered" icon={Users} color="var(--c-primary)" delay={0} />
              <StatCard label="Daily Active (DAU)" value={metrics.users.dau} sub="Active in last 24h" icon={Activity} color="var(--c-secondary)" delay={60} />
              <StatCard label="Weekly Active (WAU)" value={metrics.users.wau} sub="Active in last 7 days" icon={TrendingUp} color="var(--c-accent)" delay={120} />
              <StatCard label="Monthly Active (MAU)" value={metrics.users.mau} sub="Active in last 30 days" icon={Globe} color="var(--c-primary)" delay={180} />
              <StatCard label="New Today" value={metrics.users.newToday} sub="Registered in last 24h" icon={Zap} color="var(--c-secondary)" delay={240} />
              <StatCard label="Retention Rate" value={`${metrics.users.retentionRate}%`} sub="MAU / Total users" icon={ShieldCheck} color="#00C878" delay={300} />
            </div>

            {/* ─── LOAN METRICS ──────────────────────────────────── */}
            <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--c-text-3)', marginBottom: 16 }}>LOAN PROTOCOL METRICS</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
              <StatCard label="Total Loans" value={metrics.loans.total} sub="All-time contracts" icon={BarChart3} color="var(--c-primary)" delay={0} />
              <StatCard label="Active Loans" value={metrics.loans.active} sub="Currently running" icon={Clock} color="var(--c-accent)" delay={60} />
              <StatCard label="Repaid Loans" value={metrics.loans.repaid} sub="Successfully settled" icon={CheckCircle2} color="#00C878" delay={120} />
              <StatCard label="Defaulted" value={metrics.loans.defaulted} sub="Failed contracts" icon={AlertTriangle} color="#ff4757" delay={180} />
              <StatCard label="Repayment Rate" value={`${metrics.loans.repaymentRate}%`} sub="Repaid / total loans" icon={TrendingUp} color="var(--c-secondary)" delay={240} />
              <StatCard label="Total Disbursed" value={`$${metrics.loans.totalDisbursed}`} sub="XLM-equivalent capital" icon={Coins} color="var(--c-primary)" delay={300} />
            </div>

            {/* ─── NETWORK METRICS & TIER DISTRIBUTION ───────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
              <div className="glass-card" style={{ padding: 28 }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--c-text-3)', marginBottom: 20 }}>NETWORK HEALTH</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {[
                    { label: 'Trust Circles', value: metrics.network.circles, icon: Circle, color: 'var(--c-primary)' },
                    { label: 'Total Attestations', value: metrics.network.attestations, icon: ShieldCheck, color: 'var(--c-secondary)' },
                    { label: 'Total Value Locked', value: `$${metrics.loans.tvl}`, icon: Coins, color: 'var(--c-accent)' },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <item.icon size={16} color={item.color} />
                        <span style={{ fontSize: '0.85rem', color: 'var(--c-text-2)' }}>{item.label}</span>
                      </div>
                      <span style={{ fontWeight: 700, color: 'var(--c-text)', fontFamily: 'var(--font-heading)' }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card" style={{ padding: 28 }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--c-text-3)', marginBottom: 20 }}>CREDIT TIER DISTRIBUTION</div>
                {metrics.network.tierDistribution.map((t: any) => (
                  <TierBar key={t._id} tier={t._id} count={t.count} total={tierTotal} />
                ))}
              </div>
            </div>

            {/* ─── MONITORING / HEALTH STATUS ────────────────────── */}
            <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--c-text-3)', marginBottom: 16 }}>SYSTEM MONITORING</div>
            {health && (
              <div className="glass-card" style={{ padding: 28, marginBottom: 32 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
                  {Object.entries(health.checks).map(([name, check]: any) => (
                    <div key={name} style={{
                      padding: '16px 20px', borderRadius: 'var(--radius-md)',
                      background: check.status === 'healthy' ? 'rgba(0,200,120,0.06)' : 'rgba(255,71,87,0.06)',
                      border: `1px solid ${check.status === 'healthy' ? 'rgba(0,200,120,0.25)' : 'rgba(255,71,87,0.25)'}`,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <div style={{
                          width: 8, height: 8, borderRadius: '50%',
                          background: check.status === 'healthy' ? '#00C878' : '#ff4757',
                        }} />
                        <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--c-text)', textTransform: 'capitalize' }}>
                          {name === 'mongodb' ? 'MongoDB Database' : 'Stellar Horizon API'}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--c-text-3)' }}>
                        Status: <span style={{ color: check.status === 'healthy' ? '#00C878' : '#ff4757', fontWeight: 600 }}>{check.status}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--c-text-3)' }}>Latency: {check.latencyMs}ms</div>
                    </div>
                  ))}
                  <div style={{ padding: '16px 20px', borderRadius: 'var(--radius-md)', background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <Server size={14} color="var(--c-primary)" />
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--c-text)' }}>API Server</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--c-text-3)' }}>Environment: {health.environment}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--c-text-3)' }}>Version: {health.version}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--c-text-3)' }}>Uptime: {health.uptimeSeconds}s</div>
                  </div>
                </div>
              </div>
            )}

            {/* ─── DATA INDEXING INFO ─────────────────────────────── */}
            <div className="glass-card" style={{ padding: 28, border: '1px solid var(--c-primary)', background: 'rgba(106,76,219,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <Database size={20} color="var(--c-primary)" />
                <span style={{ fontWeight: 700, color: 'var(--c-text)', fontSize: '0.95rem' }}>Data Indexing Architecture</span>
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--c-text-2)', lineHeight: 1.8 }}>
                <strong style={{ color: 'var(--c-text)' }}>Approach:</strong> TrustChain uses a write-time indexing pattern. Every on-chain event (loan creation, repayment, attestation) is simultaneously recorded in MongoDB via our API routes, creating a queryable, structured index over raw Stellar blockchain data.
              </div>
              <div style={{ marginTop: 12, fontSize: '0.82rem', color: 'var(--c-text-2)', lineHeight: 1.8 }}>
                <strong style={{ color: 'var(--c-text)' }}>Source of Truth:</strong> The Stellar Horizon API is the immutable ledger for all XLM balances and transaction hashes. MongoDB provides the application-layer index for complex queries (DAU, tier distribution, loan history) that would be impossible to compute on-chain.
              </div>
              <div style={{ marginTop: 12, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.72rem', padding: '4px 12px', borderRadius: 99, background: 'rgba(106,76,219,0.12)', color: 'var(--c-primary)', border: '1px solid rgba(106,76,219,0.25)' }}>
                  Index Endpoint: /api/metrics
                </span>
                <span style={{ fontSize: '0.72rem', padding: '4px 12px', borderRadius: 99, background: 'rgba(0,200,120,0.08)', color: '#00C878', border: '1px solid rgba(0,200,120,0.25)' }}>
                  Health Endpoint: /api/health
                </span>
                <span style={{ fontSize: '0.72rem', padding: '4px 12px', borderRadius: 99, background: 'rgba(255,179,71,0.08)', color: 'var(--c-accent)', border: '1px solid rgba(255,179,71,0.25)' }}>
                  Freshness: {metrics.system.dataFreshness}
                </span>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
