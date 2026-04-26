'use client';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import useWalletStore from '@/store/walletStore';
import { lenderAPI } from '@/lib/api';
import { Wallet, Shield, Users, TrendingUp, CheckCircle2, XCircle, Clock, ChevronRight, Lock, Inbox, BarChart3, Settings2, CircleCheck } from 'lucide-react';

type Tab = 'settings' | 'inbox' | 'portfolio';

export default function LenderPage() {
  const { isConnected, score, pubKey } = useWalletStore();
  const [tab, setTab] = useState<Tab>('settings');
  const [settings, setSettings] = useState({ isLender: false, maxExposure: 500, manualReview: false, minBorrowerScore: 300 });
  const [inbox, setInbox] = useState<any[]>([]);
  const [portfolio, setPortfolio] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deciding, setDeciding] = useState<string | null>(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!isConnected) { setLoading(false); return; }
    load();
  }, [isConnected]);

  async function load() {
    setLoading(true);
    try {
      const s = await lenderAPI.getSettings();
      setSettings(s);
      if (s.isLender) {
        // Load inbox and portfolio independently — inbox may 403 if not in manual review mode
        try {
          const i = await lenderAPI.inbox();
          setInbox(i);
        } catch (_) { setInbox([]); }
        try {
          const p = await lenderAPI.portfolio();
          setPortfolio(p);
        } catch (_) { setPortfolio(null); }
      } else {
        setInbox([]);
        setPortfolio(null);
      }
    } catch (e: any) {
      console.error('Lender Gateway load error:', e.message);
    }
    setLoading(false);
  }

  async function saveSettings(customSettings?: any) {
    const toSave = customSettings || settings;
    setSaving(true);
    setMsg('');
    try {
      await lenderAPI.updateSettings(toSave);
      setMsg('Settings saved successfully!');
      await load();
    } catch (e: any) { 
      setMsg('Error saving: ' + e.message); 
    }
    setSaving(false);
  }

  async function toggleLenderMode() {
    const newIsLender = !settings.isLender;
    setSettings(s => ({ ...s, isLender: newIsLender }));
    await saveSettings({ ...settings, isLender: newIsLender });
  }

  async function decide(loanId: string, decision: 'APPROVE' | 'REJECT') {
    setDeciding(loanId);
    try {
      await lenderAPI.decide(loanId, decision);
      setInbox(prev => prev.filter(l => l.id !== loanId));
    } catch (e: any) { setMsg(e.message); }
    setDeciding(null);
  }

  if (!isConnected) return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <div className="container page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div className="glass-card" style={{ padding: 48, textAlign: 'center', maxWidth: 480 }}>
          <Lock size={40} color="var(--c-text-3)" style={{ margin: '0 auto 20px' }} />
          <h2 style={{ marginBottom: 12 }}>Connect Your Wallet</h2>
          <p style={{ color: 'var(--c-text-2)' }}>Please connect your Freighter wallet to access the Lender Gateway.</p>
        </div>
      </div>
    </div>
  );

  const TABS = [
    { key: 'settings', label: 'Settings', icon: Settings2 },
    { key: 'inbox', label: `Inbox${inbox.length > 0 ? ` (${inbox.length})` : ''}`, icon: Inbox },
    { key: 'portfolio', label: 'Portfolio', icon: BarChart3 },
  ] as const;

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <div className="container page-content">

        {/* Header */}
        <div className="animate-fade-in-up" style={{ marginBottom: 32 }}>
          <div className="badge" style={{ background: 'rgba(130,107,218,0.15)', color: 'var(--c-primary)', border: '1px solid rgba(130,107,218,0.3)', marginBottom: 12 }}>
            <Wallet size={12} /> Lender Gateway
          </div>
          <h1 style={{ fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 6 }}>
            Lender Dashboard
          </h1>
          <p style={{ color: 'var(--c-text-2)', fontSize: '0.9rem' }}>
            Register as a lender, review loan applications, and track your lending portfolio.
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 28, padding: '4px', background: 'var(--c-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--c-border)', width: 'fit-content' }}>
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`btn ${tab === t.key ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: '0.82rem', padding: '8px 18px', gap: 6 }}>
                <Icon size={14} /> {t.label}
              </button>
            );
          })}
        </div>

        {msg && (
          <div className="alert" style={{ marginBottom: 20, padding: '12px 18px', background: msg.includes('!') ? 'rgba(0,200,120,0.1)' : 'rgba(255,80,80,0.1)', border: `1px solid ${msg.includes('!') ? 'rgba(0,200,120,0.3)' : 'rgba(255,80,80,0.3)'}`, borderRadius: 'var(--radius-md)', color: msg.includes('!') ? '#00C878' : '#FF5050', fontSize: '0.85rem' }}>
            {msg}
          </div>
        )}

        {/* ── SETTINGS TAB ── */}
        {tab === 'settings' && (
          <div className="glass-card animate-fade-in-up" style={{ padding: 36, maxWidth: 680 }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--c-text-3)', marginBottom: 24 }}>LENDER CONFIGURATION</div>

            {/* Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', background: 'var(--c-surface-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--c-border)', marginBottom: 24 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {settings.isLender
                    ? <CircleCheck size={16} color="var(--c-secondary)" />
                    : null
                  }
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>
                    {settings.isLender ? 'Registered as Lender' : 'Become a Lender'}
                  </div>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--c-text-2)' }}>
                  Allow borrowers to send loan applications directly to you.
                </div>
              </div>
              <button
                  onClick={toggleLenderMode}
                  style={{
                    width: 52, height: 28, borderRadius: 99, cursor: 'pointer',
                    background: settings.isLender ? 'var(--c-primary)' : 'var(--c-surface)',
                    border: `2px solid ${settings.isLender ? 'var(--c-primary)' : 'var(--c-border)'}`,
                    position: 'relative', transition: 'all 0.2s',
                  }}>
                  <span style={{
                    position: 'absolute', top: 3, left: settings.isLender ? 26 : 3,
                    width: 18, height: 18, borderRadius: '50%',
                    background: '#fff', transition: 'left 0.2s',
                  }} />
                </button>
            </div>

            {settings.isLender && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {/* Max Exposure */}
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--c-text-2)', marginBottom: 8, display: 'block' }}>
                    Max Capital Exposure (XLM)
                  </label>
                  <input type="number" className="input" value={settings.maxExposure}
                    onChange={e => setSettings(s => ({ ...s, maxExposure: parseFloat(e.target.value) }))}
                    min={10} max={100000} placeholder="e.g. 5000" />
                </div>

                {/* Min Borrower Score */}
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--c-text-2)', marginBottom: 8, display: 'block' }}>
                    Minimum Borrower TBA Score Required
                  </label>
                  <input type="number" className="input" value={settings.minBorrowerScore}
                    onChange={e => setSettings(s => ({ ...s, minBorrowerScore: parseInt(e.target.value) }))}
                    min={0} max={1000} placeholder="e.g. 450" />
                  <div style={{ fontSize: '0.72rem', color: 'var(--c-text-3)', marginTop: 6 }}>
                    Borrowers below this score won't be able to apply to you.
                  </div>
                </div>

                {/* Manual Review Toggle */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'var(--c-surface-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--c-border)' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 4 }}>Manual Review Mode</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--c-text-2)' }}>
                      {settings.manualReview
                        ? 'You personally approve/reject each application.'
                        : 'Smart Contract auto-approves eligible borrowers.'}
                    </div>
                  </div>
                  <button
                    onClick={() => setSettings(s => ({ ...s, manualReview: !s.manualReview }))}
                    style={{
                      width: 52, height: 28, borderRadius: 99, cursor: 'pointer',
                      background: settings.manualReview ? 'var(--c-primary)' : 'var(--c-surface)',
                      border: `2px solid ${settings.manualReview ? 'var(--c-primary)' : 'var(--c-border)'}`,
                      position: 'relative', transition: 'all 0.2s',
                    }}>
                    <span style={{
                      position: 'absolute', top: 3, left: settings.manualReview ? 26 : 3,
                      width: 18, height: 18, borderRadius: '50%',
                      background: '#fff', transition: 'left 0.2s',
                    }} />
                  </button>
                </div>
              </div>
            )}

            <div style={{ marginTop: 28 }}>
              <button onClick={() => saveSettings()} disabled={saving} className="btn btn-primary" style={{ fontSize: '0.9rem' }}>
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        )}

        {/* ── INBOX TAB ── */}
        {tab === 'inbox' && (
          <div className="animate-fade-in-up">
            {!settings.isLender ? (
              <div className="glass-card" style={{ padding: 48, textAlign: 'center', color: 'var(--c-text-2)' }}>
                <Shield size={36} style={{ margin: '0 auto 16px', color: 'var(--c-text-3)' }} />
                <p>You need to register as a lender first in the Settings tab.</p>
              </div>
            ) : !settings.manualReview ? (
              <div className="glass-card" style={{ padding: 48, textAlign: 'center', color: 'var(--c-text-2)' }}>
                <Clock size={36} style={{ margin: '0 auto 16px', color: 'var(--c-text-3)' }} />
                <p>Manual Review Mode is off. Applications are auto-approved by the Smart Contract.</p>
                <p style={{ marginTop: 8, fontSize: '0.8rem', color: 'var(--c-text-3)' }}>Enable Manual Review in Settings to see applications here.</p>
              </div>
            ) : inbox.length === 0 ? (
              <div className="glass-card" style={{ padding: 48, textAlign: 'center', color: 'var(--c-text-2)' }}>
                <Inbox size={36} style={{ margin: '0 auto 16px', color: 'var(--c-text-3)' }} />
                <p>No pending applications. Borrowers who select you as their lender will appear here.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {inbox.map(loan => (
                  <div key={loan._id} className="glass-card" style={{ padding: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '1.15rem', marginBottom: 4 }}>${loan.amount} <span style={{ color: 'var(--c-text-3)', fontSize: '0.8rem', fontWeight: 500 }}>XLM</span></div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--c-text-2)', marginBottom: 6, textTransform: 'capitalize' }}>{loan.purpose?.replace(/_/g, ' ')}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--c-text-3)' }}>
                          From: <strong style={{ color: 'var(--c-text)' }}>{loan.borrowerName}</strong>
                          {' · '}Score: <strong style={{ color: 'var(--c-primary)' }}>{loan.borrowerScore}</strong>
                          {' · '}Tier: <span className="badge" style={{ fontSize: '0.64rem', padding: '2px 8px', background: 'rgba(130,107,218,0.15)', color: 'var(--c-primary)', border: '1px solid rgba(130,107,218,0.3)' }}>{loan.borrowerTier?.toUpperCase()}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => decide(loan._id, 'REJECT')}
                          disabled={deciding === loan._id}
                          style={{ padding: '8px 16px', borderRadius: 'var(--radius-full)', background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.3)', color: '#FF5050', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <XCircle size={14} /> Reject
                        </button>
                        <button
                          onClick={() => decide(loan._id, 'APPROVE')}
                          disabled={deciding === loan._id}
                          className="btn btn-primary"
                          style={{ padding: '8px 16px', fontSize: '0.82rem' }}>
                          <CheckCircle2 size={14} /> Approve
                        </button>
                      </div>
                    </div>
                    <div style={{ marginTop: 14, padding: '10px 14px', background: 'var(--c-surface-2)', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', color: 'var(--c-text-3)' }}>
                      Due in {loan.durationDays} days · <Clock size={10} style={{ display: 'inline' }} /> Applied: {new Date(loan.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── PORTFOLIO TAB ── */}
        {tab === 'portfolio' && (
          <div className="animate-fade-in-up">
            {!portfolio ? (
              <div className="glass-card" style={{ padding: 48, textAlign: 'center', color: 'var(--c-text-2)' }}>
                <BarChart3 size={36} style={{ margin: '0 auto 16px', color: 'var(--c-text-3)' }} />
                <p>Register as a lender to see your portfolio statistics.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                {[
                  { label: 'Total Capital Deployed', value: `$${portfolio.totalLent}`, icon: TrendingUp, color: 'var(--c-primary)' },
                  { label: 'Capital Returned', value: `$${portfolio.totalReturned}`, icon: CheckCircle2, color: '#00C878' },
                  { label: 'Active Loans', value: portfolio.activeLoans, icon: Clock, color: 'var(--c-accent)' },
                  { label: 'Repayment Rate', value: `${portfolio.repaymentRate}%`, icon: BarChart3, color: portfolio.repaymentRate >= 80 ? '#00C878' : '#FF5050' },
                  { label: 'Defaulted', value: portfolio.defaultedLoans, icon: XCircle, color: '#FF5050' },
                ].map(stat => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="glass-card" style={{ padding: 24 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: `${stat.color}18`, border: `1px solid ${stat.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon size={16} color={stat.color} />
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--c-text-2)', fontWeight: 500 }}>{stat.label}</span>
                      </div>
                      <div style={{ fontSize: '1.6rem', fontWeight: 900, color: stat.color, fontFamily: 'var(--font-heading)' }}>{stat.value}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
