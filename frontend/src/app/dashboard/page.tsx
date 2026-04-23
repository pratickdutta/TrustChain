'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ScoreGauge from '@/components/ScoreGauge';
import useWalletStore from '@/store/walletStore';
import { usersAPI, scoreAPI, stellarAPI, loansAPI } from '@/lib/api';

export default function DashboardPage() {
  const { pubKey, user, score, token, setScore, setUser, disconnect } = useWalletStore();
  const router = useRouter();
  const [stellarAccount, setStellarAccount] = useState<any>(null);
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('tc_token');
    const savedPubKey = localStorage.getItem('tc_pubkey');
    if (!savedToken || !savedPubKey) {
      router.push('/');
      return;
    }
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);
    try {
      const [userData, userScore, stellar, userLoans] = await Promise.all([
        usersAPI.me(),
        scoreAPI.me(),
        stellarAPI.account(localStorage.getItem('tc_pubkey') || ''),
        loansAPI.list(),
      ]);
      setUser(userData);
      setScore(userScore);
      setStellarAccount(stellar);
      setLoans(userLoans);
    } catch (err: any) {
      if (err.message?.includes('token')) disconnect();
    } finally {
      setLoading(false);
    }
  }

  const activeLoan = loans.find(l => ['APPROVED', 'DISBURSED', 'REPAYING'].includes(l.status));
  const pubKeyDisplay = pubKey ? `${pubKey.slice(0, 8)}...${pubKey.slice(-6)}` : '';

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-surface)' }}>
        <Navbar />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 64px)' }}>
          <div>
            <div className="animate-spin" style={{ width: 40, height: 40, border: '3px solid rgba(108,99,255,0.3)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', margin: '0 auto 16px' }} />
            <p style={{ color: 'var(--color-muted)', textAlign: 'center' }}>Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface)' }}>
      <Navbar />
      <div className="container page-content">
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: '1.8rem', marginBottom: 4 }}>
            Welcome back, <span className="gradient-text">{user?.displayName || pubKeyDisplay}</span>
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
            🌐 Stellar Testnet ·{' '}
            <a
              href={`https://stellar.expert/explorer/testnet/account/${pubKey}`}
              target="_blank" rel="noopener noreferrer"
              style={{ color: 'var(--color-primary-light)' }}
            >
              {pubKeyDisplay}
            </a>
          </p>
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          {/* Credit Score Card */}
          <div className="glass-card" style={{ padding: 28, gridColumn: 'span 1' }}>
            <h3 style={{ marginBottom: 20, fontSize: '1rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
              📊 Credit Score
            </h3>
            {score ? (
              <ScoreGauge
                totalScore={score.totalScore}
                trustScore={score.trustScore}
                behaviorScore={score.behaviorScore}
                activityScore={score.activityScore}
                tier={score.tier}
              />
            ) : (
              <div className="skeleton" style={{ height: 200 }} />
            )}
            <button
              onClick={async () => { const s = await scoreAPI.recalculate(); setScore(s); }}
              className="btn btn-ghost"
              style={{ width: '100%', marginTop: 20, fontSize: '0.82rem' }}
            >
              🔄 Recalculate Score
            </button>
          </div>

          {/* Stellar Account Card */}
          <div className="glass-card" style={{ padding: 28 }}>
            <h3 style={{ marginBottom: 20, fontSize: '1rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
              ⛓️ Stellar Account
            </h3>
            {stellarAccount ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '16px', background: 'rgba(255,255,255,0.03)',
                  borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)',
                }}>
                  <span style={{ color: 'var(--color-muted)', fontSize: '0.85rem' }}>XLM Balance</span>
                  <span style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--color-secondary)' }}>
                    {stellarAccount.xlmBalance?.toFixed(2) || '0.00'} <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>XLM</span>
                  </span>
                </div>
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '16px', background: 'rgba(255,255,255,0.03)',
                  borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)',
                }}>
                  <span style={{ color: 'var(--color-muted)', fontSize: '0.85rem' }}>TRUST Tokens</span>
                  <span style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--color-accent)' }}>
                    {user?.trustTokens || 0} <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>TRUST</span>
                  </span>
                </div>
                {!stellarAccount.exists && (
                  <div style={{
                    padding: 14, borderRadius: 'var(--radius-md)',
                    background: 'rgba(255,183,71,0.1)', border: '1px solid rgba(255,183,71,0.3)',
                    fontSize: '0.8rem', color: 'var(--color-accent)',
                  }}>
                    ⚠️ Account not funded. Use Stellar Friendbot to fund your testnet account.
                  </div>
                )}
                <a
                  href={`https://stellar.expert/explorer/testnet/account/${pubKey}`}
                  target="_blank" rel="noopener noreferrer"
                  className="btn btn-secondary"
                  style={{ textAlign: 'center', fontSize: '0.82rem' }}
                >
                  View on Stellar Explorer →
                </a>
                {!stellarAccount.exists && (
                  <a
                    href={`https://friendbot.stellar.org?addr=${pubKey}`}
                    target="_blank" rel="noopener noreferrer"
                    className="btn btn-ghost"
                    style={{ textAlign: 'center', fontSize: '0.82rem' }}
                  >
                    💧 Fund with Friendbot
                  </a>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[100, 80, 60].map(h => <div key={h} className="skeleton" style={{ height: h }} />)}
              </div>
            )}
          </div>

          {/* Active Loan Card */}
          <div className="glass-card" style={{ padding: 28 }}>
            <h3 style={{ marginBottom: 20, fontSize: '1rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
              💸 Active Loan
            </h3>
            {activeLoan ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-text)' }}>
                      ${activeLoan.amount}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>{activeLoan.currency}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      padding: '4px 12px', borderRadius: 'var(--radius-full)',
                      background: 'rgba(0,217,166,0.1)', border: '1px solid rgba(0,217,166,0.3)',
                      color: 'var(--color-secondary)', fontSize: '0.75rem', fontWeight: 600,
                    }}>{activeLoan.status}</div>
                  </div>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--color-muted)' }}>Repaid</span>
                    <span style={{ color: 'var(--color-text)' }}>${activeLoan.repaidAmount} / ${activeLoan.amount}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${(activeLoan.repaidAmount / activeLoan.amount) * 100}%` }} />
                  </div>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginBottom: 16 }}>
                  Due: {new Date(activeLoan.dueDate).toLocaleDateString()}
                </div>
                <a href="/loans" className="btn btn-primary" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', fontSize: '0.85rem' }}>
                  Manage Loan →
                </a>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>💳</div>
                <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem', marginBottom: 16 }}>
                  {score && score.totalScore >= 450
                    ? 'You\'re eligible for a loan!'
                    : `Need 450+ score to borrow. Current: ${score?.totalScore || 0}`}
                </p>
                <a href="/loans" className="btn btn-primary" style={{ display: 'inline-block', textDecoration: 'none', fontSize: '0.85rem' }}>
                  {score && score.totalScore >= 450 ? 'Request Loan →' : 'View Loan Info →'}
                </a>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="glass-card" style={{ padding: 28 }}>
            <h3 style={{ marginBottom: 20, fontSize: '1rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
              ⚡ Quick Actions
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { href: '/circles', label: '🤝 Manage Trust Circles', desc: 'View and join circles' },
                { href: '/loans', label: '💸 Loan Center', desc: 'Request or repay loans' },
                { href: '/leaderboard', label: '🏆 Leaderboard', desc: 'See top users' },
                { href: `https://stellar.expert/explorer/testnet/account/${pubKey}`, label: '🔍 Stellar Explorer', desc: 'View on-chain activity', external: true },
              ].map(action => (
                <a
                  key={action.href}
                  href={action.href}
                  target={action.external ? '_blank' : undefined}
                  rel={action.external ? 'noopener noreferrer' : undefined}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '12px 16px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    textDecoration: 'none',
                    color: 'var(--color-text)',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(108,99,255,0.4)'; (e.currentTarget as HTMLElement).style.background = 'rgba(108,99,255,0.06)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; }}
                >
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{action.label}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>{action.desc}</div>
                  </div>
                  <span style={{ color: 'var(--color-muted)' }}>→</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Loan History */}
        {loans.length > 0 && (
          <div className="glass-card" style={{ padding: 28, marginTop: 20 }}>
            <h3 style={{ marginBottom: 20, fontSize: '1rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
              📋 Loan History
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr>
                    {['Amount', 'Purpose', 'Status', 'Due Date', 'Repaid'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--color-muted)', fontWeight: 500, borderBottom: '1px solid var(--color-border)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loans.map(loan => (
                    <tr key={loan.id}>
                      <td style={{ padding: '12px', fontWeight: 600 }}>${loan.amount}</td>
                      <td style={{ padding: '12px', color: 'var(--color-text-secondary)', textTransform: 'capitalize' }}>{loan.purpose.replace(/_/g, ' ')}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          padding: '2px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600,
                          background: loan.status === 'REPAID' ? 'rgba(0,217,166,0.1)' : loan.status === 'DEFAULTED' ? 'rgba(255,71,87,0.1)' : 'rgba(108,99,255,0.1)',
                          color: loan.status === 'REPAID' ? 'var(--color-secondary)' : loan.status === 'DEFAULTED' ? '#FF4757' : 'var(--color-primary-light)',
                        }}>{loan.status}</span>
                      </td>
                      <td style={{ padding: '12px', color: 'var(--color-text-secondary)' }}>{new Date(loan.dueDate).toLocaleDateString()}</td>
                      <td style={{ padding: '12px' }}>${loan.repaidAmount} / ${loan.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
