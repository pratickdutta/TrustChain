'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ScoreGauge from '@/components/ScoreGauge';
import useWalletStore from '@/store/walletStore';
import { usersAPI, scoreAPI, stellarAPI, loansAPI } from '@/lib/api';

const QUICK_ACTIONS = [
  { href: '/circles',     emoji: '🤝', label: 'Trust Circles',     desc: 'Join circles & vouch for peers',       color: '#6C63FF' },
  { href: '/loans',       emoji: '💸', label: 'Loan Center',        desc: 'Request or repay micro-loans',         color: '#00D9A6' },
  { href: '/leaderboard', emoji: '🏆', label: 'Leaderboard',        desc: 'See top-ranked users',                 color: '#FFB347' },
];

export default function DashboardPage() {
  const { pubKey, score, token, setScore, setUser, disconnect } = useWalletStore();
  const router = useRouter();
  const [stellarAccount, setStellarAccount] = useState<any>(null);
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem('tc_token');
    const savedPubKey = localStorage.getItem('tc_pubkey');
    if (!savedToken || !savedPubKey) { router.push('/'); return; }
    load(savedPubKey);
  }, []);

  async function load(pk?: string) {
    setLoading(true);
    try {
      const pubKeyToUse = pk || pubKey || localStorage.getItem('tc_pubkey') || '';
      const [userData, userScore, stellar, userLoans] = await Promise.all([
        usersAPI.me(),
        scoreAPI.me(),
        stellarAPI.account(pubKeyToUse),
        loansAPI.list(),
      ]);
      setUser(userData);
      setScore(userScore);
      setStellarAccount(stellar);
      setLoans(userLoans);
    } catch (err: any) {
      if (err.message?.includes('token') || err.message?.includes('401')) disconnect();
    } finally {
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

  const activeLoan = loans.find(l => ['APPROVED', 'DISBURSED', 'REPAYING'].includes(l.status));
  const totalRepaid = loans.filter(l => l.status === 'REPAID').length;
  const shortKey = pubKey ? `${pubKey.slice(0, 6)}...${pubKey.slice(-6)}` : '';
  const explorerUrl = `https://stellar.expert/explorer/testnet/account/${pubKey}`;

  const tierColors: Record<string, string> = {
    platinum: '#A78BFA', gold: '#F59E0B', silver: '#94A3B8',
    bronze: '#D97706', building: '#F97316', establishing: '#EF4444',
  };
  const tierColor = score ? (tierColors[score.tier] || '#6C63FF') : '#6C63FF';

  if (loading) return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 20 }}>
        <div style={{ width: 48, height: 48, border: '3px solid rgba(108,99,255,0.2)', borderTopColor: 'var(--c-primary)', borderRadius: '50%', animation: 'spin 0.9s linear infinite' }} />
        <p style={{ color: 'var(--c-text-2)', fontSize: '0.9rem' }}>Loading your dashboard...</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <div className="container page-content">

        {/* ── WELCOME HEADER ── */}
        <div className="animate-fade-in-up" style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div className="badge badge-live" style={{ marginBottom: 12, fontSize: '0.72rem' }}>
                <span className="glow-dot" style={{ width: 6, height: 6 }} /> Live Dashboard
              </div>
              <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 6 }}>
                Your Credit Profile
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <a href={explorerUrl} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--c-text-3)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
                  ⛓️ <span style={{ color: 'var(--c-primary)', textDecoration: 'underline' }}>{shortKey}</span>
                </a>
                <span className="badge badge-muted" style={{ fontSize: '0.67rem' }}>TESTNET</span>
              </div>
            </div>
            <button onClick={recalculate} disabled={recalculating} className="btn btn-ghost" style={{ fontSize: '0.82rem', gap: 8 }}>
              <span style={{ display: 'inline-block', animation: recalculating ? 'spin 1s linear infinite' : 'none' }}>↻</span>
              {recalculating ? 'Recalculating...' : 'Refresh Score'}
            </button>
          </div>
        </div>

        {/* ── MAIN GRID ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>

          {/* Credit Score Card */}
          <div className="glass-card animate-fade-in-up" style={{ padding: 32, gridColumn: 'span 1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--c-text-3)', marginBottom: 4 }}>CREDIT SCORE</div>
                <h3 style={{ fontSize: '0.95rem', color: 'var(--c-text-2)', fontWeight: 500 }}>T · B · A Composite</h3>
              </div>
              {score && (
                <div style={{
                  padding: '6px 14px', borderRadius: 'var(--radius-full)',
                  background: `${tierColor}18`,
                  border: `1px solid ${tierColor}40`,
                  color: tierColor, fontSize: '0.78rem', fontWeight: 700,
                  textTransform: 'capitalize',
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
              <div style={{ marginTop: 20, padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--c-border)', fontSize: '0.78rem', color: 'var(--c-text-2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Next tier at</span>
                  <span style={{ color: 'var(--c-text)', fontWeight: 600 }}>
                    {score.tier === 'platinum' ? '—' :
                     score.tier === 'gold' ? '900 pts' :
                     score.tier === 'silver' ? '750 pts' :
                     score.tier === 'bronze' ? '600 pts' :
                     score.tier === 'building' ? '450 pts' : '300 pts'}
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
                STELLAR ACCOUNT
              </div>
              {stellarAccount ? (
                <div style={{ display: 'flex', gap: 12 }}>
                  {/* XLM */}
                  <div style={{ flex: 1, padding: 16, background: 'rgba(0,217,166,0.06)', border: '1px solid rgba(0,217,166,0.15)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--c-text-3)', marginBottom: 6 }}>XLM Balance</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#00D9A6', fontFamily: 'var(--font-heading)' }}>
                      {(stellarAccount.xlmBalance || 0).toFixed(2)}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--c-text-3)', marginTop: 2 }}>XLM</div>
                  </div>
                  {/* TRUST */}
                  <div style={{ flex: 1, padding: 16, background: 'rgba(255,179,71,0.06)', border: '1px solid rgba(255,179,71,0.15)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--c-text-3)', marginBottom: 6 }}>TRUST Tokens</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#FFB347', fontFamily: 'var(--font-heading)' }}>
                      {stellarAccount.trustBalance || 0}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--c-text-3)', marginTop: 2 }}>TRUST</div>
                  </div>
                </div>
              ) : (
                <div className="skeleton" style={{ height: 80 }} />
              )}

              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                <a href={explorerUrl} target="_blank" rel="noopener noreferrer"
                  className="btn btn-ghost" style={{ flex: 1, fontSize: '0.78rem', padding: '8px' }}>
                  🔍 Explorer
                </a>
                {stellarAccount && !stellarAccount.exists && (
                  <a href={`https://friendbot.stellar.org?addr=${pubKey}`} target="_blank" rel="noopener noreferrer"
                    className="btn btn-secondary" style={{ flex: 1, fontSize: '0.78rem', padding: '8px' }}>
                    💧 Friendbot
                  </a>
                )}
              </div>

              {stellarAccount && !stellarAccount.exists && (
                <div className="alert alert-warning" style={{ marginTop: 12, fontSize: '0.78rem', padding: '10px 14px' }}>
                  Account not funded. Click Friendbot to get 10,000 XLM.
                </div>
              )}
            </div>

            {/* Active Loan / CTA */}
            <div className="glass-card card-glow-gold animate-fade-in-up" style={{ padding: 26 }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--c-text-3)', marginBottom: 16 }}>
                ACTIVE LOAN
              </div>

              {activeLoan ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div>
                      <div style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'var(--font-heading)', lineHeight: 1 }}>${activeLoan.amount}</div>
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
                    <span style={{ color: 'var(--c-text-3)' }}>Due date</span>
                    <span style={{ color: 'var(--c-text)', fontWeight: 600 }}>{new Date(activeLoan.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>

                  <a href="/loans" className="btn btn-primary" style={{ display: 'block', textAlign: 'center', fontSize: '0.85rem' }}>
                    💳 Make Repayment →
                  </a>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>
                    {score && score.totalScore >= 450 ? '🎉' : '🔒'}
                  </div>
                  <p style={{ color: 'var(--c-text-2)', fontSize: '0.875rem', lineHeight: 1.65, marginBottom: 16 }}>
                    {score && score.totalScore >= 450
                      ? 'You\'re eligible! Request a micro-loan now.'
                      : `Need score ≥ 450 to borrow. Current: ${score?.totalScore || 0}`}
                  </p>
                  <a href="/loans" className={`btn ${score && score.totalScore >= 450 ? 'btn-primary' : 'btn-ghost'}`}
                    style={{ display: 'inline-block', fontSize: '0.85rem' }}>
                    {score && score.totalScore >= 450 ? '🚀 Request Loan →' : 'View Loan Info →'}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── QUICK ACTIONS ── */}
        <div className="animate-fade-in-up" style={{ marginTop: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
            {QUICK_ACTIONS.map(action => (
              <a key={action.href} href={action.href} style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '18px 22px',
                background: 'rgba(10,12,28,0.6)',
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
                (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 32px ${action.color}15`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--c-border)';
                (e.currentTarget as HTMLElement).style.background = 'rgba(10,12,28,0.6)';
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
                  fontSize: '1.2rem',
                }}>{action.emoji}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 3 }}>{action.label}</div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--c-text-3)' }}>{action.desc}</div>
                </div>
                <div style={{ marginLeft: 'auto', color: 'var(--c-text-3)', fontSize: '1rem' }}>→</div>
              </a>
            ))}

            {/* Stellar Explorer external link */}
            <a href={explorerUrl} target="_blank" rel="noopener noreferrer" style={{
              display: 'flex', alignItems: 'center', gap: 16,
              padding: '18px 22px',
              background: 'rgba(10,12,28,0.6)',
              border: '1px solid var(--c-border)',
              borderRadius: 'var(--radius-md)',
              textDecoration: 'none',
              color: 'var(--c-text)',
              transition: 'var(--transition)',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,217,166,0.3)'; (e.currentTarget as HTMLElement).style.background = 'rgba(0,217,166,0.05)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--c-border)'; (e.currentTarget as HTMLElement).style.background = 'rgba(10,12,28,0.6)'; (e.currentTarget as HTMLElement).style.transform = ''; }}
            >
              <div style={{ width: 42, height: 42, flexShrink: 0, background: 'rgba(0,217,166,0.1)', border: '1px solid rgba(0,217,166,0.25)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🔍</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 3 }}>Stellar Explorer</div>
                <div style={{ fontSize: '0.76rem', color: 'var(--c-text-3)' }}>View on-chain activity</div>
              </div>
              <div style={{ marginLeft: 'auto', color: 'var(--c-text-3)', fontSize: '0.75rem' }}>↗</div>
            </a>
          </div>
        </div>

        {/* ── LOAN HISTORY ── */}
        {loans.length > 0 && (
          <div className="glass-card animate-fade-in-up" style={{ padding: 28, marginTop: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--c-text-3)', marginBottom: 4 }}>LOAN HISTORY</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--c-text-2)' }}>{loans.length} total · {totalRepaid} repaid</div>
              </div>
              <a href="/loans" className="btn btn-ghost" style={{ fontSize: '0.78rem', padding: '7px 16px' }}>View All →</a>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Amount</th><th>Purpose</th><th>Status</th><th>Due Date</th><th>Repaid</th>
                  </tr>
                </thead>
                <tbody>
                  {loans.slice(0, 5).map(loan => (
                    <tr key={loan.id}>
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
        <div className="glass-card animate-fade-in-up" style={{ padding: 28, marginTop: 24, background: 'rgba(108,99,255,0.04)', borderColor: 'rgba(108,99,255,0.2)' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--c-primary)', marginBottom: 16 }}>
            💡 QUICK GUIDE
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
            {[
              { step: '1', title: 'Join a Circle', desc: 'Go to Circles → Join a public circle. This starts your Trust (T) score.', color: '#6C63FF' },
              { step: '2', title: 'Vouch for Peers', desc: 'Attest circle members with a weight (0.1–1.0). Both your scores improve.', color: '#A855F7' },
              { step: '3', title: 'Score ≥ 450?',   desc: 'Go to Loan Center → Request a micro-loan. Repay on time for bonus TRUST.' , color: '#00D9A6' },
            ].map(g => (
              <div key={g.step} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: `${g.color}20`, border: `1px solid ${g.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 800, color: g.color, flexShrink: 0 }}>{g.step}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 4, color: 'var(--c-text)' }}>{g.title}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--c-text-2)', lineHeight: 1.55 }}>{g.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
