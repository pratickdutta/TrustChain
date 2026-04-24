'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import useWalletStore from '@/store/walletStore';
import { loansAPI, lenderAPI, poolsAPI, scoreAPI } from '@/lib/api';
import { 
  Building2, GraduationCap, Stethoscope, Tractor, Wrench, Package, 
  Lock, Link2, PlusCircle, Activity, Coins, ShieldCheck, ChevronRight,
  Zap, Users, Wallet2, CheckCircle2, Clock, Gem, AlertTriangle,
  Flame, TrendingDown
} from 'lucide-react';

const LOAN_TIERS = [
  { tier: 'Bronze', minScore: 450, maxAmount: 50, duration: '14 days', fee: '2%', color: 'var(--c-accent)' },
  { tier: 'Silver', minScore: 600, maxAmount: 200, duration: '30 days', fee: '1.5%', color: 'var(--c-secondary)' },
  { tier: 'Gold', minScore: 750, maxAmount: 1000, duration: '90 days', fee: '1%', color: 'var(--c-accent)' },
  { tier: 'Platinum', minScore: 900, maxAmount: 5000, duration: '180 days', fee: '0.5%', color: 'var(--c-primary)' },
];

const PURPOSES = [
  { value: 'working_capital', label: 'Working Capital', icon: Building2 },
  { value: 'education', label: 'Education', icon: GraduationCap },
  { value: 'medical', label: 'Medical', icon: Stethoscope },
  { value: 'agriculture', label: 'Agriculture', icon: Tractor },
  { value: 'equipment', label: 'Equipment', icon: Wrench },
  { value: 'other', label: 'Other', icon: Package },
];

export default function LoansPage() {
  const { score, isConnected } = useWalletStore();
  const [eligibilityModal, setEligibilityModal] = useState(false);
  const router = useRouter();
  const [loans, setLoans] = useState<any[]>([]);
  const [form, setForm] = useState({ amount: '', purpose: 'working_capital', durationDays: 14 });
  const [fundingSource, setFundingSource] = useState<'defi' | 'individual' | 'pool'>('defi');
  const [selectedLender, setSelectedLender] = useState<any>(null);
  const [selectedPool, setSelectedPool] = useState<any>(null);
  const [lenders, setLenders] = useState<any[]>([]);
  const [pools, setPools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [repayingId, setRepayingId] = useState<string | null>(null);
  const [repayAmount, setRepayAmount] = useState('');
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [tab, setTab] = useState<'request' | 'history'>('request');

  useEffect(() => {
    const savedToken = localStorage.getItem('tc_token');
    const savedPubKey = localStorage.getItem('tc_pubkey');
    if (!savedToken || !savedPubKey) {
      setLoading(false);
      return;
    }
    load();
  }, [isConnected]);

  async function load() {
    setLoading(true);
    try {
      const [userLoans, globalStats, lenderList, poolList] = await Promise.all([
        loansAPI.list(), loansAPI.globalStats(), lenderAPI.browse(), poolsAPI.browse()
      ]);
      setLoans(userLoans);
      setStats(globalStats);
      setLenders(lenderList);
      setPools(poolList);
    } catch (err) {}

    // Ensure score is loaded even if wallet store hasn't hydrated yet
    if (!score) {
      try {
        const freshScore = await scoreAPI.me();
        useWalletStore.getState().setScore(freshScore);
      } catch (_) {}
    }
    setLoading(false);
  }

  async function requestLoan() {
    if (!form.amount || !form.purpose) return;
    if (fundingSource === 'individual' && !selectedLender) {
      setMsg({ text: 'Please select a lender from the list.', type: 'error' }); return;
    }
    if (fundingSource === 'pool' && !selectedPool) {
      setMsg({ text: 'Please select a Trust Pool from the list.', type: 'error' }); return;
    }
    setSubmitting(true);
    try {
      const result = await loansAPI.request({
        amount: parseFloat(form.amount),
        purpose: form.purpose,
        durationDays: form.durationDays,
        fundingSource,
        lenderKey: fundingSource === 'individual' ? selectedLender?.pubKey : undefined,
        poolId: fundingSource === 'pool' ? selectedPool?.id : undefined,
      });
      setMsg({ text: result.message, type: 'success' });
      setForm({ amount: '', purpose: 'working_capital', durationDays: 14 });
      setSelectedLender(null); setSelectedPool(null);
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
  // Only block new requests for actively running loans; PENDING/REJECTED should not block
  const activeLoan = loans.find(l => ['APPROVED', 'DISBURSED', 'REPAYING'].includes(l.status));

  if (!isConnected && !loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--c-bg)' }}>
        <Navbar />
        <div className="container page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
          <div className="glass-card animate-scale-in" style={{ padding: '48px 36px', textAlign: 'center', maxWidth: 500, width: '100%' }}>
            <div style={{ width: 72, height: 72, margin: '0 auto 24px', background: 'var(--c-surface-2)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--c-border)' }}>
              <Lock size={32} color="var(--c-text-3)" />
            </div>
            <h2 style={{ fontSize: '1.6rem', marginBottom: 16, color: 'var(--c-text)' }}>Drawdown Restricted</h2>
            <p style={{ color: 'var(--c-text-2)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: 32 }}>
              Liquidity access requires an active session. Please authenticate via a compatible multi-chain wallet to initialize loan procedures.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button onClick={() => { const navBtn = document.querySelector('.desktop-nav + div .btn') as HTMLButtonElement; if (navBtn) navBtn.click(); }} className="btn btn-primary">
                <Link2 size={16} /> Authenticate Wallet
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--c-bg)' }}>
      <Navbar />
      <div className="container page-content">
        <h1 className="section-title">Liquidity Gateway</h1>
        <p className="section-subtitle">Execute micro-loan drawdowns via smart contracts backed by your TrustChain rating</p>

        {msg && (
          <div className={`alert ${msg.type === 'error' ? 'alert-error' : ''}`} style={{
            marginBottom: 24,
            background: msg.type === 'error' ? 'rgba(255,71,87,0.1)' : 'rgba(0,217,166,0.1)',
            borderColor: msg.type === 'error' ? 'rgba(255,71,87,0.3)' : 'rgba(0,217,166,0.3)',
            color: msg.type === 'error' ? '#FF4757' : 'var(--c-secondary)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
              <ShieldCheck size={18} /> {msg.text}
              <button onClick={() => setMsg(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>✕</button>
            </div>
          </div>
        )}

        {/* Protocol Stats */}
        {stats && (
          <div className="animate-fade-in-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
            {[
              { label: 'Active Contracts', value: stats.totalLoans, icon: Activity, color: 'var(--c-primary)' },
              { label: 'Capital Disbursed', value: `$${parseFloat(stats.totalDisbursed).toFixed(0)}`, icon: Coins, color: 'var(--c-secondary)' },
              { label: 'Settled Contracts', value: stats.totalRepaid, icon: ShieldCheck, color: 'var(--c-accent)' },
              { label: 'Recovery Rate', value: `${stats.repaymentRate}%`, icon: Building2, color: 'var(--c-primary)' },
            ].map((s, idx) => {
              const StatIcon = s.icon;
              return (
                <div key={s.label} className="glass-card" style={{ padding: '24px 20px', textAlign: 'center', animationDelay: `${idx * 80}ms` }}>
                  <div style={{
                    width: 48, height: 48, margin: '0 auto 16px', borderRadius: 14,
                    background: `${s.color}15`, border: `1px solid ${s.color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <StatIcon size={24} color={s.color} />
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '1.4rem', fontFamily: 'var(--font-heading)', color: 'var(--c-text)' }}>{s.value}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--c-text-3)', marginTop: 4, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{s.label}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tier Cards */}
        <div className="animate-scale-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
          {LOAN_TIERS.map(t => {
            const eligible = userScore >= t.minScore;
            return (
              <div key={t.tier} className="glass-card" style={{
                padding: 20,
                borderColor: eligible ? `${t.color}50` : 'var(--c-border)',
                background: eligible ? `${t.color}08` : 'var(--c-surface)',
                opacity: eligible ? 1 : 0.6,
                transform: eligible ? 'scale(1.02)' : 'scale(1)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: t.color, fontWeight: 800, marginBottom: 12, fontSize: '0.95rem' }}>
                  {eligible ? <ShieldCheck size={18} /> : <Lock size={18} />} {t.tier.toUpperCase()}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--c-text-2)', lineHeight: 1.7 }}>
                  Max Drawdown: <strong style={{ color: 'var(--c-text)' }}>${t.maxAmount}</strong><br />
                  Term Length: <strong style={{ color: 'var(--c-text)' }}>{t.duration}</strong><br />
                  Protocol Fee: {t.fee} TRUST<br />
                  Threshold: {t.minScore}
                </div>
              </div>
            );
          })}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          {(['request', 'history'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`btn ${tab === t ? 'btn-secondary' : 'btn-ghost'}`} style={{ padding: '10px 24px' }}>
              {t === 'request' ? <><PlusCircle size={16} /> Setup Drawdown</> : <><Activity size={16} /> Protocol History ({loans.length})</>}
            </button>
          ))}
        </div>

        {tab === 'request' ? (
          <div style={{ maxWidth: 540 }}>
            <div className="glass-card animate-fade-in-up" style={{ padding: 32 }}>
              {/* ── ELIGIBILITY POPUP MODAL ── */}
              {eligibilityModal && (
                <div style={{
                  position: 'fixed', inset: 0, zIndex: 1000,
                  background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
                }} onClick={() => setEligibilityModal(false)}>
                  <div style={{
                    background: 'var(--c-surface)', borderRadius: 'var(--radius-lg)',
                    border: '1px solid rgba(249,115,22,0.4)', padding: 36,
                    maxWidth: 420, width: '100%', textAlign: 'center',
                    boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
                  }} onClick={e => e.stopPropagation()}>
                    <div style={{ background: 'rgba(249,115,22,0.1)', width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                      <Lock size={32} color="#F97316" />
                    </div>
                    <h3 style={{ color: 'var(--c-text)', fontSize: '1.3rem', marginBottom: 12 }}>Score Too Low</h3>
                    <p style={{ color: 'var(--c-text-2)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: 8 }}>
                      Your current TBA score is <strong style={{ color: '#F97316' }}>{userScore}</strong>.
                    </p>
                    <p style={{ color: 'var(--c-text-2)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: 24 }}>
                      You need at least <strong style={{ color: 'var(--c-secondary)' }}>450</strong> (Bronze tier) to request a loan.
                      Join Trust Circles and get peer attestations to boost your score!
                    </p>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                      <button onClick={() => setEligibilityModal(false)} className="btn btn-ghost">Close</button>
                      <button onClick={() => router.push('/circles')} className="btn btn-primary">
                        Build Trust Score <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeLoan ? (
                <div style={{ textAlign: 'center', padding: '30px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                    <div style={{ background: 'rgba(255,179,71,0.1)', padding: 16, borderRadius: '50%' }}>
                      <Activity size={40} color="var(--c-accent)" />
                    </div>
                  </div>
                  <h3 style={{ marginBottom: 12, color: 'var(--c-text)', fontSize: '1.4rem' }}>Active Contract Executing</h3>
                  <p style={{ color: 'var(--c-text-2)', fontSize: '0.95rem', marginBottom: 24 }}>
                    Cannot initialize new drawdown. Existing capital deployment must be settled prior to next execution.
                  </p>
                  <button onClick={() => setTab('history')} className="btn btn-secondary">
                    View Active Contract
                  </button>
                </div>
              ) : (
                <>
                  {eligibleTier && (
                    <div style={{ marginBottom: 20, padding: '14px 18px', borderRadius: 'var(--radius-md)', background: 'rgba(0,217,166,0.08)', border: '1px solid rgba(0,217,166,0.25)', fontSize: '0.85rem', color: 'var(--c-secondary)', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <ShieldCheck size={16} /> Authorized for <strong>{eligibleTier.tier} Tier</strong> drawdown (Max ${eligibleTier.maxAmount})
                    </div>
                  )}

                  {/* ── FUNDING SOURCE SELECTOR (always visible) ── */}
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--c-text-3)', marginBottom: 12 }}>SELECT FUNDING SOURCE</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                      {[
                        { key: 'defi', label: 'DeFi Protocol', sub: 'Auto-approved by Smart Contract', icon: Zap, color: 'var(--c-secondary)' },
                        { key: 'individual', label: 'Individual Lender', sub: `${lenders.length} lender${lenders.length !== 1 ? 's' : ''} available`, icon: Wallet2, color: 'var(--c-primary)' },
                        { key: 'pool', label: 'Trust Pool', sub: `${pools.length} pool${pools.length !== 1 ? 's' : ''} available`, icon: Users, color: 'var(--c-accent)' },
                      ].map(src => {
                        const Icon = src.icon;
                        const active = fundingSource === src.key;
                        return (
                          <button key={src.key}
                            onClick={() => {
                              if (!eligibleTier) { setEligibilityModal(true); return; }
                              setFundingSource(src.key as any); setSelectedLender(null); setSelectedPool(null);
                            }}
                            style={{
                              padding: '14px 12px', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                              background: active && eligibleTier ? `${src.color}15` : 'var(--c-surface)',
                              border: `2px solid ${active && eligibleTier ? src.color : 'var(--c-border)'}`,
                              textAlign: 'center', transition: 'all 0.2s',
                              opacity: !eligibleTier ? 0.7 : 1,
                            }}>
                            <Icon size={20} color={!eligibleTier ? 'var(--c-text-3)' : src.color} style={{ display: 'block', margin: '0 auto 8px' }} />
                            <div style={{ fontWeight: 700, fontSize: '0.78rem', color: 'var(--c-text)', marginBottom: 4 }}>{src.label}</div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--c-text-3)', lineHeight: 1.4 }}>
                              {!eligibleTier ? '🔒 Score 450+ required' : src.sub}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div style={{
                    marginBottom: 24,
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(239,68,68,0.35)',
                    background: 'rgba(239,68,68,0.06)',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 16px',
                      background: 'rgba(239,68,68,0.12)',
                      borderBottom: '1px solid rgba(239,68,68,0.2)',
                      color: '#EF4444', fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.06em',
                    }}>
                      <AlertTriangle size={15} /> DEFAULT PENALTY NOTICE — READ BEFORE PROCEEDING
                    </div>
                    <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {[
                        {
                          icon: Flame,
                          title: 'TRUST Token Seizure',
                          desc: 'If you default, your entire TRUST token balance will be immediately burned by the protocol. You lose all earned reputation capital.',
                        },
                        {
                          icon: Zap,
                          title: 'Social Slashing',
                          desc: 'Every peer who vouched for you loses 100 TRUST tokens and takes a –40 point BehaviorScore penalty. Your default damages your entire circle.',
                        },
                        {
                          icon: TrendingDown,
                          title: 'Score Collapse',
                          desc: 'Your own BehaviorScore drops by 150 points immediately, likely collapsing your credit tier and locking you out of future loans.',
                        },
                      ].map((item, idx) => {
                        const Icon = item.icon;
                        return (
                          <div key={item.title} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                            <div style={{ padding: 6, background: 'rgba(239,68,68,0.15)', borderRadius: 'var(--radius-md)', flexShrink: 0 }}>
                              <Icon size={16} color="#EF4444" />
                            </div>
                            <div>
                              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#EF4444', marginBottom: 2 }}>{item.title}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--c-text-2)', lineHeight: 1.55 }}>{item.desc}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>



                  {/* Individual Lender Picker */}
                  {fundingSource === 'individual' && (
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--c-text-3)', marginBottom: 10 }}>AVAILABLE LENDERS</div>
                      {lenders.length === 0 ? (
                        <div style={{ padding: 20, textAlign: 'center', color: 'var(--c-text-3)', fontSize: '0.82rem', border: '1px dashed var(--c-border)', borderRadius: 'var(--radius-md)' }}>
                          No registered lenders yet. Check back later.
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {lenders.map(l => (
                            <div key={l.pubKey}
                              onClick={() => setSelectedLender(selectedLender?.pubKey === l.pubKey ? null : l)}
                              style={{
                                padding: '12px 16px', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                                background: selectedLender?.pubKey === l.pubKey ? 'rgba(130,107,218,0.12)' : 'var(--c-surface)',
                                border: `1px solid ${selectedLender?.pubKey === l.pubKey ? 'var(--c-primary)' : 'var(--c-border)'}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.2s',
                              }}>
                              <div>
                                <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: 2 }}>{l.displayName}</div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--c-text-3)' }}>
                                  Score: {l.score} · Min required: {l.minBorrowerScore} · Cap: {l.maxExposure} XLM
                                </div>
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                                {l.manualReview
                                  ? <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: 99, background: 'rgba(255,179,71,0.15)', color: 'var(--c-accent)', border: '1px solid rgba(255,179,71,0.3)' }}><Clock size={8} style={{ display: 'inline' }} /> Manual Review</span>
                                  : <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: 99, background: 'rgba(0,200,120,0.15)', color: '#00C878', border: '1px solid rgba(0,200,120,0.3)' }}><Zap size={8} style={{ display: 'inline' }} /> Auto Approve</span>
                                }
                                {selectedLender?.pubKey === l.pubKey && <CheckCircle2 size={16} color="var(--c-primary)" />}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Trust Pool Picker */}
                  {fundingSource === 'pool' && (
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--c-text-3)', marginBottom: 10 }}>AVAILABLE TRUST POOLS</div>
                      {pools.length === 0 ? (
                        <div style={{ padding: 20, textAlign: 'center', color: 'var(--c-text-3)', fontSize: '0.82rem', border: '1px dashed var(--c-border)', borderRadius: 'var(--radius-md)' }}>
                          No active MoneyPools yet. Circle owners with Platinum tier can enable this.
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {pools.map(p => (
                            <div key={p.id}
                              onClick={() => setSelectedPool(selectedPool?.id === p.id ? null : p)}
                              style={{
                                padding: '12px 16px', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                                background: selectedPool?.id === p.id ? 'rgba(200,224,35,0.08)' : 'var(--c-surface)',
                                border: `1px solid ${selectedPool?.id === p.id ? 'var(--c-secondary)' : 'var(--c-border)'}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.2s',
                              }}>
                              <div>
                                <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: 2 }}>{p.name}</div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--c-text-3)' }}>
                                  {p.openToOutside ? 'Open to all' : 'Members only'} · Min score: {p.minBorrowerScore} · Max loan: ${p.maxLoanPerBorrower}
                                </div>
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                                <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: 99, background: 'rgba(130,107,218,0.12)', color: 'var(--c-primary)', border: '1px solid rgba(130,107,218,0.25)' }}>
                                  Owner: {p.ownerTier?.toUpperCase()}
                                </span>
                                {p.manualApproval
                                  ? <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: 99, background: 'rgba(130,107,218,0.15)', color: 'var(--c-primary)', border: '1px solid rgba(130,107,218,0.3)', display: 'flex', alignItems: 'center', gap: 4 }}><Gem size={8} /> Platinum Review</span>
                                  : <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: 99, background: 'rgba(0,200,120,0.15)', color: '#00C878', border: '1px solid rgba(0,200,120,0.3)' }}>Auto Approve</span>
                                }
                                {selectedPool?.id === p.id && <CheckCircle2 size={16} color="var(--c-secondary)" />}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--c-text-2)', display: 'block', marginBottom: 8 }}>Capital Request (XLM Equiv) *</label>
                      <input
                        type="number" className="input"
                        placeholder={`1 – ${eligibleTier.maxAmount}`}
                        value={form.amount}
                        onChange={e => setForm({ ...form, amount: e.target.value })}
                        min="1" max={eligibleTier.maxAmount}
                        style={{ padding: '14px 16px', fontSize: '1.1rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--c-text-2)', display: 'block', marginBottom: 8 }}>Utilization Vector *</label>
                      <div style={{ position: 'relative' }}>
                        <select className="input" value={form.purpose} onChange={e => setForm({ ...form, purpose: e.target.value })} style={{ padding: '14px 16px', appearance: 'none' }}>
                          {PURPOSES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                        </select>
                        <div style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--c-text-3)' }}>
                          <ChevronRight size={16} style={{ transform: 'rotate(90deg)' }} />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--c-text-2)', display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                        <span>Maturity Term</span>
                        <strong style={{ color: 'var(--c-primary)' }}>{form.durationDays} days</strong>
                      </label>
                      <input
                        type="range" min="7" max={eligibleTier.duration.split(' ')[0]}
                        value={form.durationDays}
                        onChange={e => setForm({ ...form, durationDays: parseInt(e.target.value) })}
                        style={{ width: '100%', accentColor: 'var(--c-primary)' }}
                      />
                    </div>
                    {form.amount && (
                      <div style={{ padding: 18, borderRadius: 'var(--radius-md)', background: 'var(--c-surface-2)', border: '1px solid var(--c-border)', fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <span style={{ color: 'var(--c-text-3)' }}>Principal Sum</span>
                          <span style={{ fontWeight: 600, color: 'var(--c-text)' }}>${form.amount}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <span style={{ color: 'var(--c-text-3)' }}>Network Fee ({eligibleTier.fee})</span>
                          <span style={{ color: 'var(--c-secondary)', fontWeight: 600 }}>{(parseFloat(form.amount || '0') * parseFloat(eligibleTier.fee) / 100).toFixed(2)} TRUST</span>
                        </div>
                        <div style={{ height: 1, background: 'var(--c-border)', margin: '10px 0' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                          <span style={{ color: 'var(--c-text-2)' }}>Settlement Deadline</span>
                          <span style={{ color: 'var(--c-text)' }}>{new Date(Date.now() + form.durationDays * 86400000).toLocaleDateString()}</span>
                        </div>
                      </div>
                    )}
                    <button onClick={requestLoan} disabled={submitting || !form.amount} className="btn btn-primary" style={{ padding: '14px', fontSize: '1rem' }}>
                      {submitting ? 'Executing Contract...' : 'Initialize Drawdown'}
                    </button>
                    <p style={{ fontSize: '0.75rem', color: 'var(--c-text-3)', textAlign: 'center' }}>
                      Smart contracts deploy to Stellar Testnet automatically.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {loans.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 80, border: '1px dashed var(--c-border)', borderRadius: 'var(--radius-lg)' }}>
                <Activity size={32} color="var(--c-text-3)" style={{ margin: '0 auto 16px' }} />
                <div style={{ color: 'var(--c-text-2)' }}>No operational contracts detected.</div>
              </div>
            ) : loans.map(loan => (
              <div key={loan.id} className="glass-card" style={{ padding: 28, borderColor: loan.status === 'REPAYING' || loan.status === 'APPROVED' ? 'var(--c-primary)' : 'var(--c-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                      <span style={{ fontSize: '1.8rem', fontWeight: 900, fontFamily: 'var(--font-heading)', color: 'var(--c-text)' }}>${loan.amount}</span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--c-text-3)', fontWeight: 600 }}>{loan.currency}</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--c-text-2)', textTransform: 'capitalize', marginTop: 4 }}>
                      {loan.purpose.replace(/_/g, ' ')} vector · Settlement {new Date(loan.dueDate).toLocaleDateString()}
                    </div>
                  </div>
                  <span className={`badge ${loan.status === 'REPAID' ? 'badge-success' : loan.status === 'DEFAULTED' ? 'badge-danger' : 'badge-primary'}`} style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
                    {loan.status}
                  </span>
                </div>
                <div style={{ margin: '24px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.82rem', color: 'var(--c-text-2)', fontWeight: 500 }}>
                    <span>Recovery Progress</span>
                    <span>${loan.repaidAmount} / ${loan.amount} ({Math.round((loan.repaidAmount / loan.amount) * 100)}%)</span>
                  </div>
                  <div className="progress-bar" style={{ height: 6, background: 'var(--c-surface-2)' }}>
                    <div className="progress-fill" style={{ width: `${(loan.repaidAmount / loan.amount) * 100}%`, background: loan.status === 'REPAID' ? 'var(--c-secondary)' : 'var(--c-primary)' }} />
                  </div>
                </div>
                {['APPROVED', 'DISBURSED', 'REPAYING'].includes(loan.status) && (
                  repayingId === loan.id ? (
                    <div style={{ display: 'flex', gap: 12, background: 'var(--c-surface-2)', padding: 16, borderRadius: 'var(--radius-md)', border: '1px solid var(--c-border)' }}>
                      <input
                        type="number" className="input"
                        placeholder={`Maximum: $${loan.amount - loan.repaidAmount}`}
                        value={repayAmount} onChange={e => setRepayAmount(e.target.value)}
                        style={{ flex: 1, backgroundColor: 'var(--c-surface)' }}
                        max={loan.amount - loan.repaidAmount}
                      />
                      <button onClick={() => repayLoan(loan.id)} className="btn btn-primary" style={{ padding: '0 24px' }}>Execute</button>
                      <button onClick={() => { setRepayingId(null); setRepayAmount(''); }} className="btn btn-ghost">Abort</button>
                    </div>
                  ) : (
                    <div style={{ paddingTop: 16, borderTop: '1px solid var(--c-border)' }}>
                      <button onClick={() => setRepayingId(loan.id)} className="btn btn-secondary" style={{ padding: '10px 20px' }}>
                        <Coins size={16} /> Submit Payment
                      </button>
                    </div>
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
