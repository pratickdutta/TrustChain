'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import useWalletStore from '@/store/walletStore';
import { loansAPI, scoreAPI } from '@/lib/api';

const LOAN_TIERS = [
  { tier: 'Bronze', minScore: 450, maxAmount: 50, duration: '14 days', fee: '2%', color: '#D97706' },
  { tier: 'Silver', minScore: 600, maxAmount: 200, duration: '30 days', fee: '1.5%', color: '#94A3B8' },
  { tier: 'Gold', minScore: 750, maxAmount: 1000, duration: '90 days', fee: '1%', color: '#F59E0B' },
  { tier: 'Platinum', minScore: 900, maxAmount: 5000, duration: '180 days', fee: '0.5%', color: '#818CF8' },
];

const PURPOSES = [
  { value: 'working_capital', label: '🏪 Working Capital' },
  { value: 'education', label: '📚 Education' },
  { value: 'medical', label: '🏥 Medical' },
  { value: 'agriculture', label: '🌾 Agriculture' },
  { value: 'equipment', label: '🔧 Equipment' },
  { value: 'other', label: '📦 Other' },
];

export default function LoansPage() {
  const { score } = useWalletStore();
  const router = useRouter();
  const [loans, setLoans] = useState<any[]>([]);
  const [form, setForm] = useState({ amount: '', purpose: 'working_capital', durationDays: 14 });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [repayingId, setRepayingId] = useState<string | null>(null);
  const [repayAmount, setRepayAmount] = useState('');
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [tab, setTab] = useState<'request' | 'history'>('request');

  useEffect(() => {
    if (!localStorage.getItem('tc_token')) { router.push('/'); return; }
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const [userLoans, globalStats] = await Promise.all([loansAPI.list(), loansAPI.globalStats()]);
      setLoans(userLoans);
      setStats(globalStats);
    } catch (err) {}
    setLoading(false);
  }

  async function requestLoan() {
    if (!form.amount || !form.purpose) return;
    setSubmitting(true);
    try {
      const result = await loansAPI.request({
        amount: parseFloat(form.amount),
        purpose: form.purpose,
        durationDays: form.durationDays,
      });
      setMsg({ text: result.message, type: 'success' });
      setForm({ amount: '', purpose: 'working_capital', durationDays: 14 });
      load();
      setTab('history');
    } catch (err: any) {
      setMsg({ text: err.message, type: 'error' });
    }
    setSubmitting(false);
  }

  async function repayLoan(loanId: string) {
    if (!repayAmount) return;
    try {
      const result = await loansAPI.repay(loanId, parseFloat(repayAmount));
      setMsg({ text: result.message, type: 'success' });
      setRepayingId(null);
      setRepayAmount('');
      load();
    } catch (err: any) {
      setMsg({ text: err.message, type: 'error' });
    }
  }

  const userScore = score?.totalScore || 0;
  const eligibleTier = LOAN_TIERS.filter(t => userScore >= t.minScore).pop();
  const activeLoan = loans.find(l => ['APPROVED', 'DISBURSED', 'REPAYING'].includes(l.status));

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface)' }}>
      <Navbar />
      <div className="container page-content">
        <h1 className="section-title">💸 Loan Center</h1>
        <p className="section-subtitle">Request micro-loans based on your TrustChain credit score</p>

        {msg && (
          <div style={{
            marginBottom: 20, padding: 16, borderRadius: 'var(--radius-md)',
            background: msg.type === 'success' ? 'rgba(0,217,166,0.1)' : 'rgba(255,71,87,0.1)',
            border: `1px solid ${msg.type === 'success' ? 'rgba(0,217,166,0.3)' : 'rgba(255,71,87,0.3)'}`,
            color: msg.type === 'success' ? 'var(--color-secondary)' : '#FF4757',
            fontSize: '0.875rem', lineHeight: 1.5,
          }}>
            {msg.text}
            <button onClick={() => setMsg(null)} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: '1.1rem' }}>×</button>
          </div>
        )}

        {/* Protocol Stats */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14, marginBottom: 28 }}>
            {[
              { label: 'Total Loans', value: stats.totalLoans, icon: '📋' },
              { label: 'Total Disbursed', value: `$${parseFloat(stats.totalDisbursed).toFixed(0)}`, icon: '💸' },
              { label: 'Repaid', value: stats.totalRepaid, icon: '✅' },
              { label: 'Repayment Rate', value: `${stats.repaymentRate}%`, icon: '📊' },
            ].map(s => (
              <div key={s.label} className="stat-card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.2rem', marginBottom: 4 }}>{s.icon}</div>
                <div style={{ fontWeight: 700, fontSize: '1.2rem', fontFamily: 'Space Grotesk' }}>{s.value}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-muted)', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tier Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 28 }}>
          {LOAN_TIERS.map(t => {
            const eligible = userScore >= t.minScore;
            return (
              <div key={t.tier} style={{
                padding: 18,
                background: eligible ? `rgba(${t.color === '#D97706' ? '217,119,6' : t.color === '#94A3B8' ? '148,163,184' : t.color === '#F59E0B' ? '245,158,11' : '129,140,248'},0.08)` : 'rgba(255,255,255,0.02)',
                border: `1px solid ${eligible ? t.color + '40' : 'var(--color-border)'}`,
                borderRadius: 'var(--radius-md)',
                opacity: eligible ? 1 : 0.5,
              }}>
                <div style={{ color: t.color, fontWeight: 700, marginBottom: 8, fontSize: '0.9rem' }}>{eligible ? '✓' : '🔒'} {t.tier}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', lineHeight: 1.6 }}>
                  Up to <strong style={{ color: 'var(--color-text)' }}>${t.maxAmount}</strong><br />
                  Duration: {t.duration}<br />
                  Fee: {t.fee} TRUST<br />
                  Min score: {t.minScore}
                </div>
              </div>
            );
          })}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {(['request', 'history'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '8px 20px', borderRadius: 'var(--radius-full)',
              background: tab === t ? 'rgba(108,99,255,0.15)' : 'transparent',
              border: `1px solid ${tab === t ? 'rgba(108,99,255,0.4)' : 'var(--color-border)'}`,
              color: tab === t ? 'var(--color-primary-light)' : 'var(--color-muted)',
              cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, transition: 'all 0.2s',
            }}>
              {t === 'request' ? '➕ Request Loan' : `📋 My Loans (${loans.length})`}
            </button>
          ))}
        </div>

        {tab === 'request' ? (
          <div style={{ maxWidth: 500 }}>
            <div className="glass-card" style={{ padding: 28 }}>
              {!eligibleTier ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{ fontSize: '2rem', marginBottom: 12 }}>🔒</div>
                  <h3 style={{ marginBottom: 8 }}>Score Too Low</h3>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                    Your current score is <strong style={{ color: '#F97316' }}>{userScore}</strong>.<br />
                    You need at least <strong>450</strong> (Bronze tier) to access loans.<br />
                    Join trust circles and get attestations to boost your score!
                  </p>
                  <a href="/circles" className="btn btn-primary" style={{ display: 'inline-block', marginTop: 20, textDecoration: 'none' }}>
                    Join Trust Circles →
                  </a>
                </div>
              ) : activeLoan ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{ fontSize: '2rem', marginBottom: 12 }}>⚠️</div>
                  <h3 style={{ marginBottom: 8 }}>Active Loan Exists</h3>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                    Please repay your current loan before requesting a new one.
                  </p>
                  <button onClick={() => setTab('history')} className="btn btn-secondary" style={{ marginTop: 16 }}>
                    View Active Loan →
                  </button>
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: 16, padding: 14, borderRadius: 'var(--radius-md)', background: 'rgba(0,217,166,0.08)', border: '1px solid rgba(0,217,166,0.2)', fontSize: '0.82rem', color: 'var(--color-secondary)' }}>
                    ✅ Eligible for <strong>{eligibleTier.tier} tier</strong> — up to ${eligibleTier.maxAmount}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>Amount (USD) *</label>
                      <input
                        type="number" className="input"
                        placeholder={`1 – ${eligibleTier.maxAmount}`}
                        value={form.amount}
                        onChange={e => setForm({ ...form, amount: e.target.value })}
                        min="1" max={eligibleTier.maxAmount}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>Purpose *</label>
                      <select className="input" value={form.purpose} onChange={e => setForm({ ...form, purpose: e.target.value })}>
                        {PURPOSES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>
                        Duration: <strong style={{ color: 'var(--color-primary-light)' }}>{form.durationDays} days</strong>
                      </label>
                      <input
                        type="range" min="7" max={eligibleTier.duration.split(' ')[0]}
                        value={form.durationDays}
                        onChange={e => setForm({ ...form, durationDays: parseInt(e.target.value) })}
                        style={{ width: '100%', accentColor: 'var(--color-primary)' }}
                      />
                    </div>
                    {form.amount && (
                      <div style={{ padding: 14, borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border)', fontSize: '0.82rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ color: 'var(--color-muted)' }}>Loan Amount</span>
                          <span>${form.amount}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ color: 'var(--color-muted)' }}>TRUST Fee ({eligibleTier.fee})</span>
                          <span style={{ color: 'var(--color-accent)' }}>{(parseFloat(form.amount || '0') * parseFloat(eligibleTier.fee) / 100).toFixed(2)} TRUST</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                          <span style={{ color: 'var(--color-muted)' }}>Due Date</span>
                          <span>{new Date(Date.now() + form.durationDays * 86400000).toLocaleDateString()}</span>
                        </div>
                      </div>
                    )}
                    <button onClick={requestLoan} disabled={submitting || !form.amount} className="btn btn-primary">
                      {submitting ? 'Processing...' : '🚀 Request Loan'}
                    </button>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)', textAlign: 'center' }}>
                      On mainnet, disbursement executes via Stellar payment within 60s
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {loans.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 60, color: 'var(--color-muted)' }}>No loans yet.</div>
            ) : loans.map(loan => (
              <div key={loan.id} className="glass-card" style={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 2 }}>${loan.amount} <span style={{ fontSize: '0.8rem', color: 'var(--color-muted)', fontWeight: 400 }}>{loan.currency}</span></div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)', textTransform: 'capitalize' }}>{loan.purpose.replace(/_/g, ' ')} · Due {new Date(loan.dueDate).toLocaleDateString()}</div>
                  </div>
                  <span style={{
                    padding: '6px 14px', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: 600,
                    background: loan.status === 'REPAID' ? 'rgba(0,217,166,0.12)' : loan.status === 'DEFAULTED' ? 'rgba(255,71,87,0.12)' : 'rgba(108,99,255,0.12)',
                    color: loan.status === 'REPAID' ? 'var(--color-secondary)' : loan.status === 'DEFAULTED' ? '#FF4757' : 'var(--color-primary-light)',
                  }}>{loan.status}</span>
                </div>
                <div style={{ margin: '16px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.78rem', color: 'var(--color-muted)' }}>
                    <span>Repaid</span>
                    <span>${loan.repaidAmount} / ${loan.amount} ({Math.round((loan.repaidAmount / loan.amount) * 100)}%)</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${(loan.repaidAmount / loan.amount) * 100}%` }} />
                  </div>
                </div>
                {['APPROVED', 'DISBURSED', 'REPAYING'].includes(loan.status) && (
                  repayingId === loan.id ? (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        type="number" className="input"
                        placeholder={`Amount (max $${loan.amount - loan.repaidAmount})`}
                        value={repayAmount} onChange={e => setRepayAmount(e.target.value)}
                        style={{ flex: 1 }}
                        max={loan.amount - loan.repaidAmount}
                      />
                      <button onClick={() => repayLoan(loan.id)} className="btn btn-primary" style={{ flexShrink: 0 }}>Repay</button>
                      <button onClick={() => { setRepayingId(null); setRepayAmount(''); }} className="btn btn-ghost" style={{ flexShrink: 0 }}>Cancel</button>
                    </div>
                  ) : (
                    <button onClick={() => setRepayingId(loan.id)} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
                      💳 Make Repayment
                    </button>
                  )
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
