'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ScoreGauge from '@/components/ScoreGauge';
import useWalletStore from '@/store/walletStore';
import { usersAPI, scoreAPI, stellarAPI, loansAPI } from '@/lib/api';
import { Network, History, LineChart, ChevronRight, RefreshCw, Lock, Link2, ScanSearch, CheckCircle2, ShieldCheck, UserCheck, Droplets } from 'lucide-react';

const QUICK_ACTIONS = [
  { href: '/circles',     icon: Network,  label: 'Trust Circles',     desc: 'Join circles & vouch for peers',       color: 'var(--c-primary)' },
  { href: '/loans',       icon: History,  label: 'Loan Center',       desc: 'Request or repay micro-loans',         color: 'var(--c-secondary)' },
  { href: '/leaderboard', icon: LineChart,label: 'Leaderboard',       desc: 'See top-ranked users',                 color: 'var(--c-accent)' },
];

export default function DashboardPage() {
  const { pubKey, score, token, setScore, setUser, disconnect, isConnected } = useWalletStore();
  const router = useRouter();
  const [stellarAccount, setStellarAccount] = useState<any>(null);
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem('tc_token');
    const savedPubKey = localStorage.getItem('tc_pubkey');
    if (!savedToken || !savedPubKey) {
      setLoading(false);
      return;
    }
    load(savedPubKey);
  }, [isConnected]);

  async function load(pk?: string) {
    setLoading(true);
    const pubKeyToUse = pk || pubKey || localStorage.getItem('tc_pubkey') || '';
    
    try {
      // 1. Fetch fast internal API data first
      const [userData, userScore, userLoans] = await Promise.all([
        usersAPI.me(),
        scoreAPI.me(),
        loansAPI.list(),
      ]);
      
      setUser(userData);
      setScore(userScore);
      setLoans(userLoans);
      
      // Stop the global loading screen immediately so the user sees the dashboard
      setLoading(false);

      // 2. Fetch the slower Stellar blockchain data in the background
      try {
        const stellar = await stellarAPI.account(pubKeyToUse);
        setStellarAccount(stellar);
      } catch (err) {
        console.error('Failed to load Stellar account data', err);
        // We can set a fallback or leave it null. The UI handles null gracefully.
      }

    } catch (err: any) {
      if (err.message?.includes('token') || err.message?.includes('401')) {
        // We're silently letting it fail. `isConnected` remains whatever.
        disconnect();
      }
      setLoading(false);
    }
  }

  async function recalculate() {
    setRecalculating(true);
    try {
      const s = await scoreAPI.recalculate();
      setScore(s);
    } catch (e) {}
    setRecalculating(false);
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh' }}>
        <Navbar />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh', flexDirection: 'column', gap: 32 }}>
          <div style={{ position: 'relative', width: 64, height: 64, display: 'flex', justifyContent: 'center' }}>
            {/* Bouncing Coin */}
            <div style={{ animation: 'coinBounce 1.5s cubic-bezier(0.28, 0.84, 0.42, 1) infinite' }}>
              <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Coin Base */}
                <circle cx="30" cy="30" r="28" fill="var(--c-bg-alt)" stroke="var(--c-secondary)" strokeWidth="3" />
                {/* Inner Ring */}
                <circle cx="30" cy="30" r="22" stroke="var(--c-secondary)" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
                {/* Stellar-inspired / Crypto Icon */}
                <path d="M22 24L38 36M22 36L38 24M30 16V44" stroke="var(--c-secondary)" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </div>
            {/* Shadow Floor */}
            <div style={{
              position: 'absolute', bottom: -12, width: 48, height: 8,
              background: 'var(--c-secondary)', borderRadius: '50%',
              animation: 'pulseGlow 1.5s cubic-bezier(0.28, 0.84, 0.42, 1) infinite',
              filter: 'blur(4px)', opacity: 0.6
            }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <p style={{ color: 'var(--c-secondary)', fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              Synchronizing Chain Data
            </p>
            <div style={{ display: 'flex', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--c-secondary)', animation: 'pulseGlow 1.5s infinite 0s' }} />
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--c-secondary)', animation: 'pulseGlow 1.5s infinite 0.2s' }} />
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--c-secondary)', animation: 'pulseGlow 1.5s infinite 0.4s' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not connected UI
  if (!isConnected) {
    return (
      <div style={{ minHeight: '100vh' }}>
        <Navbar />
        <div className="container page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
          <div className="glass-card animate-scale-in" style={{ padding: '48px 36px', textAlign: 'center', maxWidth: 500, width: '100%' }}>
            <div style={{
              width: 72, height: 72, margin: '0 auto 24px',
              background: 'var(--c-surface-2)', borderRadius: 20,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid var(--c-border)'
            }}>
              <Lock size={32} color="var(--c-text-3)" />
            </div>
            <h2 style={{ fontSize: '1.6rem', marginBottom: 16, color: 'var(--c-text)' }}>Endpoint Secured</h2>
            <p style={{ color: 'var(--c-text-2)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: 32 }}>
              Your dashboard profile is currently encrypted and locked. Connect a registered multi-chain wallet to decrypt and load your verified credit parameters.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button onClick={() => {
                const navBtn = document.querySelector('.desktop-nav + div .btn') as HTMLButtonElement;
                if (navBtn) navBtn.click();
              }} className="btn btn-primary">
                <Link2 size={16} /> Connect Web3 Wallet
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const activeLoan = loans.find(l => ['APPROVED', 'DISBURSED', 'REPAYING'].includes(l.status));
  const totalRepaid = loans.filter(l => l.status === 'REPAID').length;
  const shortKey = pubKey ? `${pubKey.slice(0, 6)}...${pubKey.slice(-6)}` : '';
  const explorerUrl = `https://stellar.expert/explorer/testnet/account/${pubKey}`;

  const tierColors: Record<string, string> = {
    platinum: 'var(--c-primary)', gold: 'var(--c-accent)', silver: 'var(--c-secondary)',
    bronze: 'var(--c-accent)', building: '#F97316', establishing: '#EF4444',
  };
  const tierColor = score ? (tierColors[score.tier] || 'var(--c-primary)') : 'var(--c-primary)';

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <div className="container page-content">

        {/* ── WELCOME HEADER ── */}
        <div className="animate-fade-in-up" style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div className="badge badge-live" style={{ marginBottom: 12, fontSize: '0.72rem' }}>
                <span className="glow-dot" style={{ width: 6, height: 6 }} /> Active Session
              </div>
              <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 6, color: 'var(--c-text)' }}>
                Credit Architecture
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <a href={explorerUrl} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--c-text-3)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
                  <Link2 size={12} /> <span style={{ color: 'var(--c-primary)', textDecoration: 'underline' }}>{shortKey}</span>
                </a>
                <span className="badge badge-muted" style={{ fontSize: '0.67rem' }}>NETWORK: TESTNET</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {pubKey === 'GAXY2BE75O3RAWQI3JJBDSNARQZTZE2C32IMGGNJFMZAUARTDVNTMGMT' && (
                <button 
                  onClick={async () => {
                    setRecalculating(true);
                    try {
                      const res = await scoreAPI.devBoost();
                      setScore(res.score);
                    } catch(e){}
                    setRecalculating(false);
                  }} 
                  className="btn btn-ghost" style={{ fontSize: '0.82rem', color: 'var(--c-primary)', border: '1px solid var(--c-primary)' }}>
                  [DEV] Boost to 800
                </button>
              )}
              <button onClick={recalculate} disabled={recalculating} className="btn btn-ghost" style={{ fontSize: '0.82rem', gap: 8 }}>
                <RefreshCw size={14} className={recalculating ? 'animate-spin' : ''} />
                {recalculating ? 'Syncing...' : 'Sync Score'}
              </button>
            </div>
          </div>
        </div>

        {/* ── MAIN GRID ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>

          {/* Credit Score Card */}
          <div className="glass-card animate-fade-in-up" style={{ padding: 32, gridColumn: 'span 1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--c-text-3)', marginBottom: 4 }}>GLOBAL RATING</div>
                <h3 style={{ fontSize: '0.95rem', color: 'var(--c-text-2)', fontWeight: 500 }}>T · B · A Aggregation</h3>
              </div>
              {score && (
                <div style={{
                  padding: '6px 14px', borderRadius: 'var(--radius-full)',
                  background: `${tierColor}18`,
                  border: `1px solid ${tierColor}40`,
                  color: tierColor, fontSize: '0.78rem', fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  {score.tier}
                </div>
              )}
            </div>

            {score ? (
              <ScoreGauge
                totalScore={score.totalScore}
                trustScore={score.trustScore}
                behaviorScore={score.behaviorScore}
                activityScore={score.activityScore}
                tier={score.tier}
                size="lg"
              />
            ) : (
              <div className="skeleton" style={{ height: 280 }} />
            )}

            {score && (
              <div style={{ marginTop: 20, padding: '12px 16px', background: 'var(--c-surface-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--c-border)', fontSize: '0.78rem', color: 'var(--c-text-2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Next tier target</span>
                  <span style={{ color: 'var(--c-text)', fontWeight: 600 }}>
                    {score.tier === 'platinum' ? 'MAX' :
                     score.tier === 'gold' ? '900' :
                     score.tier === 'silver' ? '750' :
                     score.tier === 'bronze' ? '600' :
                     score.tier === 'building' ? '450' : '300'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Stellar Account */}
            <div className="glass-card card-glow-green animate-fade-in-up" style={{ padding: 26 }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--c-text-3)', marginBottom: 16 }}>
                LIQUIDITY POOLS
              </div>
              {stellarAccount ? (
                <div style={{ display: 'flex', gap: 12 }}>
                  {/* XLM */}
                  <div style={{ flex: 1, padding: 16, background: 'rgba(0,217,166,0.06)', border: '1px solid rgba(0,217,166,0.15)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--c-text-3)', marginBottom: 6 }}>Network Gas</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--c-secondary)', fontFamily: 'var(--font-heading)' }}>
                      {(stellarAccount.xlmBalance || 0).toFixed(2)}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--c-text-3)', marginTop: 2, fontWeight: 700 }}>XLM</div>
                  </div>
                  {/* TRUST */}
                  <div style={{ flex: 1, padding: 16, background: 'rgba(255,179,71,0.06)', border: '1px solid rgba(255,179,71,0.15)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--c-text-3)', marginBottom: 6 }}>Social Capital</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--c-accent)', fontFamily: 'var(--font-heading)' }}>
                      {stellarAccount.trustBalance || 0}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--c-text-3)', marginTop: 2, fontWeight: 700 }}>TRUST</div>
                  </div>
                </div>
              ) : (
                <div className="skeleton" style={{ height: 80 }} />
              )}

              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                <a href={explorerUrl} target="_blank" rel="noopener noreferrer"
                  className="btn btn-ghost" style={{ flex: 1, fontSize: '0.78rem', padding: '8px', gap: 4 }}>
                  <ScanSearch size={14} /> View On-Chain
                </a>
                {stellarAccount && !stellarAccount.exists && (
                  <a href={`https://friendbot.stellar.org?addr=${pubKey}`} target="_blank" rel="noopener noreferrer"
                    className="btn btn-secondary" style={{ flex: 1, fontSize: '0.78rem', padding: '8px', gap: 4 }}>
                    <Droplets size={14} /> Request Gas
                  </a>
                )}
              </div>

              {stellarAccount && !stellarAccount.exists && (
                <div className="alert alert-warning" style={{ marginTop: 12, fontSize: '0.78rem', padding: '10px 14px' }}>
                  Account uninitialized. Request Gas to activate network interactions.
                </div>
              )}
            </div>

            {/* Active Loan / CTA */}
            <div className="glass-card card-glow-gold animate-fade-in-up" style={{ padding: 26 }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--c-text-3)', marginBottom: 16 }}>
                CREDIT UTILIZATION
              </div>

              {activeLoan ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div>
                      <div style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'var(--font-heading)', lineHeight: 1, color: 'var(--c-text)' }}>${activeLoan.amount}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--c-text-3)', marginTop: 4, textTransform: 'capitalize' }}>{activeLoan.purpose.replace(/_/g, ' ')}</div>
                    </div>
                    <span className={`badge badge-${activeLoan.status === 'REPAID' ? 'success' : 'warning'}`}>
                      {activeLoan.status}
                    </span>
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--c-text-3)', marginBottom: 6 }}>
                      <span>Repaid ${activeLoan.repaidAmount} of ${activeLoan.amount}</span>
                      <span style={{ color: 'var(--c-secondary)', fontWeight: 600 }}>{Math.round((activeLoan.repaidAmount / activeLoan.amount) * 100)}%</span>
                    </div>
                    <div className="progress-bar"><div className="progress-fill" style={{ width: `${(activeLoan.repaidAmount / activeLoan.amount) * 100}%` }} /></div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 16 }}>
                    <span style={{ color: 'var(--c-text-3)' }}>Maturity Term</span>
                    <span style={{ color: 'var(--c-text)', fontWeight: 600 }}>{new Date(activeLoan.dueDate).toLocaleDateString()}</span>
                  </div>

                  <a href="/loans" className="btn btn-primary" style={{ display: 'flex', textAlign: 'center', fontSize: '0.85rem' }}>
                    Execute Repayment <ChevronRight size={14} />
                  </a>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                    {score && score.totalScore >= 450 ? (
                       <div style={{ background: 'rgba(0,217,166,0.1)', padding: 12, borderRadius: '50%' }}>
                         <CheckCircle2 size={32} color="var(--c-secondary)" />
                       </div>
                    ) : (
                       <div style={{ background: 'rgba(255,179,71,0.1)', padding: 12, borderRadius: '50%' }}>
                         <Lock size={32} color="var(--c-accent)" />
                       </div>
                    )}
                  </div>
                  <p style={{ color: 'var(--c-text-2)', fontSize: '0.875rem', lineHeight: 1.65, marginBottom: 16 }}>
                    {score && score.totalScore >= 450
                      ? 'Liquidity gateway unlocked. Initialize capital draw.'
                      : `Rating < 450. Build trust to unlock drawdowns.`}
                  </p>
                  <a href="/loans" className={`btn ${score && score.totalScore >= 450 ? 'btn-primary' : 'btn-ghost'}`}
                    style={{ display: 'inline-flex', fontSize: '0.85rem', gap: 6 }}>
                    {score && score.totalScore >= 450 ? 'Initialize Drawdown' : 'View Requirements'} 
                    <ChevronRight size={14} />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── QUICK ACTIONS ── */}
        <div className="animate-fade-in-up" style={{ marginTop: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
            {QUICK_ACTIONS.map(action => {
              const Icon = action.icon;
              return (
                <a key={action.href} href={action.href} style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '18px 22px',
                  background: 'var(--c-surface)',
                  border: '1px solid var(--c-border)',
                  borderRadius: 'var(--radius-md)',
                  textDecoration: 'none',
                  color: 'var(--c-text)',
                  transition: 'var(--transition)',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = `${action.color}40`;
                  (e.currentTarget as HTMLElement).style.background = `${action.color}08`;
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 32px ${action.color}10`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--c-border)';
                  (e.currentTarget as HTMLElement).style.background = 'var(--c-surface)';
                  (e.currentTarget as HTMLElement).style.transform = '';
                  (e.currentTarget as HTMLElement).style.boxShadow = '';
                }}
                >
                  <div style={{
                    width: 42, height: 42, flexShrink: 0,
                    background: `${action.color}15`,
                    border: `1px solid ${action.color}30`,
                    borderRadius: 12,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={20} color={action.color} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 3 }}>{action.label}</div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--c-text-3)' }}>{action.desc}</div>
                  </div>
                  <div style={{ marginLeft: 'auto', color: 'var(--c-text-3)' }}><ChevronRight size={16} /></div>
                </a>
              );
            })}

            {/* Stellar Explorer external link */}
            <a href={explorerUrl} target="_blank" rel="noopener noreferrer" style={{
              display: 'flex', alignItems: 'center', gap: 16,
              padding: '18px 22px',
              background: 'var(--c-surface)',
              border: '1px solid var(--c-border)',
              borderRadius: 'var(--radius-md)',
              textDecoration: 'none',
              color: 'var(--c-text)',
              transition: 'var(--transition)',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,217,166,0.3)'; (e.currentTarget as HTMLElement).style.background = 'rgba(0,217,166,0.05)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--c-border)'; (e.currentTarget as HTMLElement).style.background = 'var(--c-surface)'; (e.currentTarget as HTMLElement).style.transform = ''; }}
            >
              <div style={{ width: 42, height: 42, flexShrink: 0, background: 'rgba(0,217,166,0.1)', border: '1px solid rgba(0,217,166,0.25)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ScanSearch size={20} color="var(--c-secondary)" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 3 }}>On-Chain Explorer</div>
                <div style={{ fontSize: '0.76rem', color: 'var(--c-text-3)' }}>Verify global state</div>
              </div>
              <div style={{ marginLeft: 'auto', color: 'var(--c-text-3)' }}><ChevronRight size={16} /></div>
            </a>
          </div>
        </div>

        {/* ── LOAN HISTORY ── */}
        {loans.length > 0 && (
          <div className="glass-card animate-fade-in-up" style={{ padding: 28, marginTop: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--c-text-3)', marginBottom: 4 }}>CONTRACT HISTORY</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--c-text-2)' }}>{loans.length} executions · {totalRepaid} settled</div>
              </div>
              <a href="/loans" className="btn btn-ghost" style={{ fontSize: '0.78rem', padding: '7px 16px', gap: 6 }}>View Registry <ChevronRight size={12}/></a>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Capital</th><th>Vector</th><th>State</th><th>Conclusion</th><th>Recovery</th>
                  </tr>
                </thead>
                <tbody>
                  {loans.slice(0, 5).map(loan => (
                    <tr key={loan._id}>
                      <td style={{ fontWeight: 700, color: 'var(--c-text)' }}>${loan.amount}</td>
                      <td style={{ textTransform: 'capitalize' }}>{loan.purpose.replace(/_/g, ' ')}</td>
                      <td>
                        <span className={`badge ${loan.status === 'REPAID' ? 'badge-success' : loan.status === 'DEFAULTED' ? 'badge-danger' : 'badge-primary'}`}>
                          {loan.status}
                        </span>
                      </td>
                      <td>{new Date(loan.dueDate).toLocaleDateString()}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className="progress-bar" style={{ width: 60, height: 4 }}>
                            <div className="progress-fill" style={{ width: `${(loan.repaidAmount / loan.amount) * 100}%` }} />
                          </div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--c-text-2)' }}>${loan.repaidAmount}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── GUIDE SECTION ── */}
        <div className="glass-card animate-fade-in-up" style={{ padding: 28, marginTop: 24, background: 'var(--c-surface-2)', borderColor: 'var(--c-border)' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--c-primary)', marginBottom: 16 }}>
            SYSTEM DOCUMENTATION
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
            {[
              { step: '1', title: 'Network Consensus', desc: 'Join established Trust Circles. Begin accumulating Base Trust (T) metrics.', color: 'var(--c-primary)', icon: Network },
              { step: '2', title: 'Peer Attestation', desc: 'Submit verifiable attestations for external entities. Bidirectional enhancement.', color: 'var(--c-secondary)', icon: UserCheck },
              { step: '3', title: 'Capital Release',   desc: 'Exceed threshold (450+). Initialize drawdown procedures and verify recovery.', color: 'var(--c-secondary)', icon: ShieldCheck },
            ].map(g => {
              const Icon = g.icon;
              return (
                <div key={g.step} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '8px', background: `${g.color}10`, border: `1px solid ${g.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: g.color, flexShrink: 0 }}>
                    <Icon size={16} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 4, color: 'var(--c-text)' }}>{g.title}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--c-text-2)', lineHeight: 1.55 }}>{g.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
