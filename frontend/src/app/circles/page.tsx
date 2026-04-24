'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import useWalletStore from '@/store/walletStore';
import { circlesAPI, scoreAPI, poolsAPI } from '@/lib/api';
import { Network, Search, PlusCircle, CheckCircle2, ShieldCheck, Lock, Link2, KeySquare, Globe, Fingerprint, Coins, Settings2, ChevronDown, CircleCheck, Gem, Copy, TrendingUp } from 'lucide-react';

export default function CirclesPage() {
  const { pubKey, setScore, isConnected } = useWalletStore();
  const router = useRouter();
  const [circles, setCircles] = useState<any[]>([]);
  const [publicCircles, setPublicCircles] = useState<any[]>([]);
  const [selectedCircle, setSelectedCircle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', circleRules: '', socialLink: '', isPublic: true });
  const [attestWeight, setAttestWeight] = useState(0.7);
  const [msg, setMsg] = useState('');
  const [tab, setTab] = useState<'mine' | 'public'>('mine');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [poolForm, setPoolForm] = useState({ openToOutside: true, manualApproval: false, minBorrowerScore: 300, maxLoanPerBorrower: 500 });
  const [savingPool, setSavingPool] = useState(false);
  const [showPoolPanel, setShowPoolPanel] = useState(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [settingsForm, setSettingsForm] = useState({ circleRules: '', borrowApprovalEnabled: false, isPublic: true, socialLink: '' });
  const [savingSettings, setSavingSettings] = useState(false);
  const [userPoolDeposit, setUserPoolDeposit] = useState(0);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);
  const [depositing, setDepositing] = useState(false);

  // Delete Circle states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteCodeStr, setDeleteCodeStr] = useState('');
  const [deleteInput, setDeleteInput] = useState('');
  const [deletingCircle, setDeletingCircle] = useState(false);

  // Pool dissolution payout state
  const [payoutResult, setPayoutResult] = useState<any>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('tc_token');
    const savedPubKey = localStorage.getItem('tc_pubkey');
    if (!savedToken || !savedPubKey) {
      setLoading(false);
      return;
    }
    load().then(async () => {
      const params = new URLSearchParams(window.location.search);
      const joinUci = params.get('join');
      if (joinUci) {
        setTab('public');
        setSearchQuery(joinUci);
        window.history.replaceState({}, '', window.location.pathname);
        
        setIsSearching(true);
        try {
          const res = await circlesAPI.searchByUCI(joinUci);
          setPublicCircles(res.filter((p: any) => !circles.find((m: any) => m.id === p.id)));
        } catch(e) {}
        setIsSearching(false);
      }
    });
  }, [isConnected]);

  async function load() {
    setLoading(true);
    try {
      const [mine, pub] = await Promise.all([circlesAPI.list(), circlesAPI.public()]);
      setCircles(mine);
      setPublicCircles(pub.filter((p: any) => !mine.find((m: any) => m.id === p.id)));
    } catch (e) {}
    setLoading(false);
  }

  async function loadCircle(id: string) {
    const c = await circlesAPI.get(id);
    setSelectedCircle(c);
    setSettingsForm({ circleRules: c.circleRules || '', borrowApprovalEnabled: c.borrowApprovalEnabled || false, isPublic: c.isPublic ?? true, socialLink: c.socialLink || '' });
    
    if (c.isPool) {
      try {
        const d = await poolsAPI.getUserDeposit(id);
        setUserPoolDeposit(d.total);
      } catch (e) {}
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setPublicCircles([]);
      load();
      return;
    }
    setIsSearching(true);
    try {
      let res;
      if (searchQuery.trim().toUpperCase().startsWith('UCI-') || searchQuery.trim().length === 16) {
        res = await circlesAPI.searchByUCI(searchQuery);
      } else {
        res = await circlesAPI.search(searchQuery);
      }
      setPublicCircles(res.filter((p: any) => !circles.find((m: any) => m.id === p.id)));
    } catch (e) {}
    setIsSearching(false);
  }

  async function createCircle() {
    if (!form.name.trim()) return;
    setCreating(true);
    try {
      await circlesAPI.create(form);
      setForm({ name: '', description: '', circleRules: '', socialLink: '', isPublic: true });
      setMsg('Circle created successfully');
      load();
    } catch (e: any) { setMsg('Error: ' + e.message); }
    setCreating(false);
  }

  async function joinCircle(id: string, inviteCode?: string) {
    try {
      await circlesAPI.join(id, inviteCode);
      setMsg('Joined consensus circle successfully');
      load();
    } catch (e: any) { setMsg('Error: ' + e.message); }
  }

  async function attest(circleId: string, targetPubKey: string) {
    try {
      await circlesAPI.attest(circleId, targetPubKey, attestWeight);
      const s = await scoreAPI.recalculate();
      setScore(s);
      setMsg(`Attestation propagated for ${targetPubKey.slice(0, 6)} with weight ${attestWeight}`);
      loadCircle(circleId);
    } catch (e: any) { setMsg('Error: ' + e.message); }
  }

  const tierColors: Record<string, string> = {
    platinum: 'var(--c-primary)', gold: 'var(--c-accent)', silver: 'var(--c-secondary)',
    bronze: 'var(--c-accent)', building: '#F97316', establishing: '#EF4444',
  };

  if (!isConnected && !loading) {
    return (
      <div style={{ minHeight: '100vh' }}>
        <Navbar />
        <div className="container page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
          <div className="glass-card animate-scale-in" style={{ padding: '48px 36px', textAlign: 'center', maxWidth: 500, width: '100%' }}>
            <div style={{ width: 72, height: 72, margin: '0 auto 24px', background: 'var(--c-surface-2)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--c-border)' }}>
              <Lock size={32} color="var(--c-text-3)" />
            </div>
            <h2 style={{ fontSize: '1.6rem', marginBottom: 16, color: 'var(--c-text)' }}>Endpoint Secured</h2>
            <p style={{ color: 'var(--c-text-2)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: 32 }}>
              Trust Circles are private attestation graphs. Please connect your Web3 wallet to access and manage your peer network.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button onClick={() => { const navBtn = document.querySelector('.desktop-nav + div .btn') as HTMLButtonElement; if (navBtn) navBtn.click(); }} className="btn btn-primary">
                <Link2 size={16} /> Connect Web3 Wallet
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <div className="container page-content">
        <h1 className="section-title">Trust Circles</h1>
        <p className="section-subtitle">Establish decentralized consensus graphs and build mutual credit reputation</p>

        {msg && (
          <div className={`alert ${msg.includes('Error') ? 'alert-error' : ''}`} style={{
            marginBottom: 24,
            background: msg.includes('Error') ? 'rgba(255,71,87,0.1)' : 'rgba(0,217,166,0.1)',
            borderColor: msg.includes('Error') ? 'rgba(255,71,87,0.3)' : 'rgba(0,217,166,0.3)',
            color: msg.includes('Error') ? '#FF4757' : 'var(--c-secondary)',
          }}>
            <ShieldCheck size={18} /> {msg}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: selectedCircle ? '1fr 1fr' : '1fr', gap: 24 }}>
          {/* Left Panel */}
          <div>
            {/* Create Circle */}
            <div className="glass-card animate-fade-in-up" style={{ padding: 24, marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <PlusCircle size={20} color="var(--c-primary)" />
                <h3 style={{ fontSize: '1.1rem', color: 'var(--c-text)' }}>Deploy a Circle</h3>
              </div>
              <input className="input" placeholder="Circle Name *" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} style={{ marginBottom: 12 }} />
              <textarea className="input" placeholder="Circle description (optional)" value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                style={{ marginBottom: 12, resize: 'vertical', minHeight: 60 }} />
              <textarea className="input" placeholder="Circle rule (optional)" value={form.circleRules}
                onChange={e => setForm({ ...form, circleRules: e.target.value })}
                style={{ marginBottom: 12, resize: 'vertical', minHeight: 60 }} />
              <input className="input" placeholder="Social Media Link (optional, e.g. X/Discord)" value={form.socialLink}
                onChange={e => setForm({ ...form, socialLink: e.target.value })} style={{ marginBottom: 16 }} />
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, fontSize: '0.85rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.isPublic} onChange={e => setForm({ ...form, isPublic: e.target.checked })}
                  style={{ accentColor: 'var(--c-primary)', width: 16, height: 16 }} />
                <span style={{ color: 'var(--c-text-2)' }}>Public Circle (anyone can request to join)</span>
              </label>
              <button onClick={createCircle} disabled={creating || !form.name.trim()} className="btn btn-primary" style={{ width: '100%' }}>
                {creating ? 'Creating...' : 'Create Circle Network'}
              </button>
            </div>

            <div className="animate-fade-in-up" style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
              {(['mine', 'public'] as const).map(t => (
                <button key={t} onClick={() => { setTab(t); if(t==='public' && !searchQuery) load(); }} className={`btn ${tab === t ? 'btn-secondary' : 'btn-ghost'}`} style={{ flex: 1 }}>
                  {t === 'mine' ? <Network size={16} /> : <Search size={16} />}
                  {t === 'mine' ? `Active Circles (${circles.length})` : `Join Circle`}
                </button>
              ))}
            </div>

            {tab === 'public' && (
              <form onSubmit={handleSearch} className="animate-fade-in-up" style={{ marginBottom: 20, display: 'flex', gap: 8 }}>
                <input
                  className="input"
                  style={{ flex: 1 }}
                  placeholder="Search by Circle Name or UCI (e.g. UCI-XXXX-XXXX)"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="btn btn-secondary" disabled={isSearching}>
                  <Search size={16} /> Search
                </button>
              </form>
            )}

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[1, 2].map(i => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 'var(--radius-md)' }} />)}
              </div>
            ) : (
              <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {(tab === 'mine' ? circles : publicCircles).map((circle, idx) => (
                  <div key={circle.id} className="glass-card" style={{
                    padding: 24, cursor: 'pointer', transition: 'var(--transition)',
                    borderColor: selectedCircle?.id === circle.id ? 'var(--c-primary)' : 'var(--c-border)',
                    animationDelay: `${idx * 100}ms`
                  }}
                  onClick={() => loadCircle(circle.id)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: 6, color: 'var(--c-text)' }}>{circle.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--c-text-3)', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Network size={12} /> {circle.memberCount || circle.members?.length || 0} nodes
                          <span style={{ color: 'var(--c-border-hover)' }}>•</span>
                          {circle.isPublic ? <><Globe size={12}/> Public Endpoint</> : <><Lock size={12}/> Encrypted</>}
                        </div>
                      </div>
                      {tab === 'public' && (
                        <button onClick={e => { e.stopPropagation(); joinCircle(circle.id); }} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
                          Initialize Join
                        </button>
                      )}
                    </div>
                    {circle.description && (
                      <p style={{ marginTop: 12, fontSize: '0.85rem', color: 'var(--c-text-2)', lineHeight: 1.6 }}>{circle.description}</p>
                    )}
                    {circle.socialLink && (
                      <div style={{ marginTop: 8, fontSize: '0.8rem' }} onClick={e => e.stopPropagation()}>
                        <a href={circle.socialLink.startsWith('http') ? circle.socialLink : `https://${circle.socialLink}`} target="_blank" rel="noreferrer" style={{ color: 'var(--c-primary)', display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
                          <Link2 size={12} /> Contact Owner
                        </a>
                      </div>
                    )}
                    {tab === 'mine' && circle.inviteCode && (
                      <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(130,107,218,0.1)', border: '1px solid rgba(130,107,218,0.3)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: 'var(--c-text)', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <KeySquare size={16} color="var(--c-primary)" /> <span style={{ fontWeight: 600 }}>Invite Signature:</span> <strong style={{ fontFamily: 'var(--font-mono)', letterSpacing: '1.5px', color: 'var(--c-primary)', background: 'var(--c-surface-2)', padding: '4px 8px', borderRadius: 6, border: '1px solid var(--c-border)' }}>{circle.inviteCode}</strong>
                      </div>
                    )}
                  </div>
                ))}
                {(tab === 'mine' ? circles : publicCircles).length === 0 && (
                  <div style={{ textAlign: 'center', padding: 60, color: 'var(--c-text-3)', fontSize: '0.9rem', border: '1px dashed var(--c-border)', borderRadius: 'var(--radius-lg)' }}>
                    {tab === 'mine' ? 'No active circles. Create a circle above.' : 'No public circles found. Try searching.'}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Panel — Circle Detail */}
          {selectedCircle && (
            <div className="glass-card animate-scale-in" style={{ padding: 32, height: 'fit-content', position: 'sticky', top: 100 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--c-text)' }}>{selectedCircle.name}</h3>
                <button onClick={() => setSelectedCircle(null)} style={{ background: 'var(--c-surface-2)', border: '1px solid var(--c-border)', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--c-text-2)', cursor: 'pointer' }}>×</button>
              </div>

              <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--c-text-3)', marginBottom: 12, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div>VERIFIED NODES ({selectedCircle.enrichedMembers?.length || 0})</div>
                <div style={{ padding: '2px 6px', background: 'var(--c-surface-2)', borderRadius: 4, fontFamily: 'var(--font-mono)' }}>UCI: {selectedCircle.uci}</div>
                {(selectedCircle.isPublic || selectedCircle.creatorId === pubKey) && (
                  <button onClick={() => {
                    const url = new URL(window.location.href);
                    url.searchParams.set('join', selectedCircle.uci);
                    navigator.clipboard.writeText(url.toString());
                    setMsg('Join link copied to clipboard!');
                  }} className="btn" style={{ padding: '2px 8px', fontSize: '0.7rem', background: 'transparent', border: '1px solid var(--c-border)', color: 'var(--c-text-2)' }}>
                    <Copy size={10} style={{ marginRight: 4 }} /> Copy Join Link
                  </button>
                )}
              </div>

              {/* Owner Settings & MoneyPool Panel */}
              {selectedCircle.creatorId === pubKey && (
                <>
                  {/* Circle Settings Panel */}
                  <div style={{ marginBottom: 12, borderRadius: 'var(--radius-md)', border: '1px solid var(--c-border)', overflow: 'hidden' }}>
                    <button
                      onClick={() => setShowSettingsPanel(s => !s)}
                      style={{ width: '100%', padding: '12px 16px', background: 'var(--c-surface)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--c-text)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: '0.85rem' }}>
                        <Settings2 size={14} color="var(--c-text-3)" />
                        Circle Configurations
                      </div>
                      <ChevronDown size={14} style={{ transform: showSettingsPanel ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
                    </button>

                    {showSettingsPanel && (
                      <div style={{ padding: '16px', background: 'var(--c-surface)', borderTop: '1px solid var(--c-border)', display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div>
                          <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--c-text-2)', display: 'block', marginBottom: 6 }}>Circle Rule</label>
                          <textarea className="input" value={settingsForm.circleRules}
                            placeholder="Set your circle rules..."
                            onChange={e => setSettingsForm({ ...settingsForm, circleRules: e.target.value })}
                            style={{ padding: '8px 12px', fontSize: '0.85rem', width: '100%', minHeight: 60, resize: 'vertical' }} />
                        </div>

                        <div>
                          <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--c-text-2)', display: 'block', marginBottom: 6 }}>Social Link</label>
                          <input className="input" value={settingsForm.socialLink}
                            placeholder="e.g. https://x.com/yourhandle"
                            onChange={e => setSettingsForm({ ...settingsForm, socialLink: e.target.value })}
                            style={{ padding: '8px 12px', fontSize: '0.85rem', width: '100%' }} />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0' }}>
                          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--c-text-2)' }}>Public Circle (Visible in Global Directory)</label>
                          <button onClick={() => setSettingsForm({ ...settingsForm, isPublic: !settingsForm.isPublic })}
                            style={{ width: 44, height: 24, borderRadius: 99, border: `2px solid ${settingsForm.isPublic ? 'var(--c-primary)' : 'var(--c-border)'}`, background: settingsForm.isPublic ? 'var(--c-primary)' : 'var(--c-surface)', cursor: 'pointer', position: 'relative' }}>
                            <span style={{ position: 'absolute', top: 2, left: settingsForm.isPublic ? 20 : 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
                          </button>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0' }}>
                          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--c-text-2)' }}>Require Platinum Owner Borrow Approval</label>
                          <button onClick={() => setSettingsForm({ ...settingsForm, borrowApprovalEnabled: !settingsForm.borrowApprovalEnabled })}
                            style={{ width: 44, height: 24, borderRadius: 99, border: `2px solid ${settingsForm.borrowApprovalEnabled ? 'var(--c-secondary)' : 'var(--c-border)'}`, background: settingsForm.borrowApprovalEnabled ? 'var(--c-secondary)' : 'var(--c-surface)', cursor: 'pointer', position: 'relative' }}>
                            <span style={{ position: 'absolute', top: 2, left: settingsForm.borrowApprovalEnabled ? 20 : 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
                          </button>
                        </div>
                        <div style={{ padding: '10px 12px', background: 'rgba(130,107,218,0.08)', border: '1px solid rgba(130,107,218,0.2)', borderRadius: 'var(--radius-sm)', fontSize: '0.72rem', color: 'var(--c-primary)', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                          <Gem size={12} style={{ marginTop: 1, flexShrink: 0 }} />
                          <span><strong>Platinum Required:</strong> Borrow approval control is only available to Platinum-tier circle owners.
                          {selectedCircle?.enrichedMembers?.find((m: any) => m.stellarPublicKey === pubKey)?.tier !== 'platinum' && (
                            <span> Your current tier does not qualify.</span>
                          )}</span>
                        </div>

                        <button
                          onClick={async () => {
                            setSavingSettings(true);
                            try {
                              await circlesAPI.patch(selectedCircle.id, { circleRules: settingsForm.circleRules, borrowApprovalEnabled: settingsForm.borrowApprovalEnabled, isPublic: settingsForm.isPublic, socialLink: settingsForm.socialLink });
                              setMsg('Settings saved!');
                              await loadCircle(selectedCircle.id);
                            } catch (e: any) { setMsg('Error: ' + e.message); }
                            setSavingSettings(false);
                          }}
                          disabled={savingSettings}
                          className="btn btn-primary"
                          style={{ fontSize: '0.82rem', padding: '9px 18px' }}>
                          {savingSettings ? 'Saving...' : 'Save Settings'}
                        </button>

                        <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid rgba(255,71,87,0.2)' }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#FF4757', marginBottom: 8 }}>Danger Zone</div>
                          
                          {selectedCircle.isPool ? (
                            <div style={{ padding: '12px 16px', background: 'rgba(255,71,87,0.05)', border: '1px solid rgba(255,71,87,0.2)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: 'var(--c-text-2)', lineHeight: 1.5 }}>
                              <strong style={{ color: '#FF4757' }}>Deletion Disabled:</strong> This circle is operating as an active MoneyPool. To protect lender liquidity and active loans, MoneyPool circles cannot be deleted. If you need to delete this circle, please disable the MoneyPool first.
                            </div>
                          ) : !showDeleteConfirm ? (
                            <button
                              onClick={() => {
                                setShowDeleteConfirm(true);
                                setDeleteCodeStr(Math.random().toString(36).substring(2, 10).toUpperCase());
                                setDeleteInput('');
                              }}
                              className="btn btn-ghost"
                              style={{ width: '100%', color: '#FF4757', border: '1px solid rgba(255,71,87,0.3)' }}
                            >
                              Delete Circle Network
                            </button>
                          ) : (
                            <div style={{ background: 'rgba(255,71,87,0.05)', border: '1px solid rgba(255,71,87,0.2)', padding: 16, borderRadius: 'var(--radius-md)' }}>
                              <p style={{ fontSize: '0.75rem', color: 'var(--c-text-2)', marginBottom: 12 }}>
                                This action is permanent and cannot be undone. All nodes will be disconnected.
                                To verify deletion, type the following 8-character code:
                              </p>
                              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 800, color: 'var(--c-text)', textAlign: 'center', letterSpacing: '2px', marginBottom: 12, userSelect: 'none', background: 'var(--c-surface-2)', padding: '8px', borderRadius: 4 }}>
                                {deleteCodeStr}
                              </div>
                              <input
                                className="input"
                                value={deleteInput}
                                onChange={e => setDeleteInput(e.target.value.toUpperCase())}
                                placeholder="TYPE CODE HERE"
                                style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', marginBottom: 12, borderColor: deleteInput === deleteCodeStr ? 'var(--c-secondary)' : 'var(--c-border)' }}
                              />
                              <div style={{ display: 'flex', gap: 8 }}>
                                <button
                                  onClick={() => setShowDeleteConfirm(false)}
                                  className="btn btn-ghost"
                                  style={{ flex: 1, fontSize: '0.8rem' }}
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={async () => {
                                    if (deleteInput !== deleteCodeStr) return;
                                    setDeletingCircle(true);
                                    try {
                                      await circlesAPI.delete(selectedCircle.id);
                                      setMsg('Circle deleted successfully.');
                                      setSelectedCircle(null);
                                      load();
                                    } catch (e: any) { setMsg('Error: ' + e.message); }
                                    setDeletingCircle(false);
                                  }}
                                  disabled={deleteInput !== deleteCodeStr || deletingCircle}
                                  className="btn"
                                  style={{ flex: 1, fontSize: '0.8rem', background: '#FF4757', color: '#fff', border: 'none' }}
                                >
                                  {deletingCircle ? 'Deleting...' : 'Confirm Delete'}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                      </div>
                    )}
                  </div>

                  {/* MoneyPool Panel */}
                  <div style={{ marginBottom: 20, borderRadius: 'var(--radius-md)', border: '1px solid var(--c-border)', overflow: 'hidden' }}>
                  <button
                    onClick={() => {
                      setShowPoolPanel(s => !s);
                      if (selectedCircle.isPool) {
                        setPoolForm({
                          openToOutside: selectedCircle.poolOpenToOutside ?? true,
                          manualApproval: selectedCircle.poolManualApproval ?? false,
                          minBorrowerScore: selectedCircle.poolMinBorrowerScore ?? 300,
                          maxLoanPerBorrower: selectedCircle.poolMaxLoanPerBorrower ?? 500,
                        });
                      }
                    }}
                    style={{ width: '100%', padding: '12px 16px', background: selectedCircle.isPool ? 'rgba(200,224,35,0.08)' : 'var(--c-surface)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--c-text)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: '0.85rem' }}>
                      <Coins size={14} color={selectedCircle.isPool ? 'var(--c-secondary)' : 'var(--c-text-3)'} />
                      {selectedCircle.isPool ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <CircleCheck size={14} color="var(--c-secondary)" /> MoneyPool Active
                        </span>
                      ) : 'Enable MoneyPool'}
                    </div>
                    <ChevronDown size={14} style={{ transform: showPoolPanel ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
                  </button>

                  {showPoolPanel && (
                    <div style={{ padding: '16px', background: 'var(--c-surface)', borderTop: '1px solid var(--c-border)', display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--c-text-3)', lineHeight: 1.5 }}>
                        Converting this circle into a MoneyPool allows members to deposit capital and borrowers to apply for loans from this group.
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--c-text-2)' }}>Open to outside borrowers</label>
                        <button onClick={() => setPoolForm(f => ({ ...f, openToOutside: !f.openToOutside }))}
                          style={{ width: 44, height: 24, borderRadius: 99, border: `2px solid ${poolForm.openToOutside ? 'var(--c-secondary)' : 'var(--c-border)'}`, background: poolForm.openToOutside ? 'var(--c-secondary)' : 'var(--c-surface)', cursor: 'pointer', position: 'relative' }}>
                          <span style={{ position: 'absolute', top: 2, left: poolForm.openToOutside ? 20 : 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
                        </button>
                      </div>

                      <div>
                        <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--c-text-2)', display: 'block', marginBottom: 6 }}>Min Borrower Score</label>
                        <input type="number" className="input" value={poolForm.minBorrowerScore}
                          onChange={e => setPoolForm(f => ({ ...f, minBorrowerScore: parseInt(e.target.value) }))}
                          style={{ padding: '8px 12px', fontSize: '0.85rem' }} />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--c-text-2)', display: 'block', marginBottom: 6 }}>Max Loan Per Borrower (XLM)</label>
                        <input type="number" className="input" value={poolForm.maxLoanPerBorrower}
                          onChange={e => setPoolForm(f => ({ ...f, maxLoanPerBorrower: parseFloat(e.target.value) }))}
                          style={{ padding: '8px 12px', fontSize: '0.85rem' }} />
                      </div>

                      <div style={{ padding: '10px 12px', background: 'rgba(130,107,218,0.08)', border: '1px solid rgba(130,107,218,0.2)', borderRadius: 'var(--radius-sm)', fontSize: '0.72rem', color: 'var(--c-primary)', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                        <Gem size={12} style={{ marginTop: 1, flexShrink: 0 }} />
                        <span><strong>Platinum Required:</strong> Manual approval control is only available to Platinum-tier circle owners.
                        {selectedCircle?.enrichedMembers?.find((m: any) => m.stellarPublicKey === pubKey)?.tier !== 'platinum' && (
                          <span> Your current tier does not qualify.</span>
                        )}</span>
                      </div>

                      <button
                        onClick={async () => {
                          setSavingPool(true);
                          try {
                            await poolsAPI.updateSettings(selectedCircle.id, poolForm);
                            setMsg('MoneyPool settings saved!');
                            await loadCircle(selectedCircle.id);
                          } catch (e: any) { setMsg('Error: ' + e.message); }
                          setSavingPool(false);
                        }}
                        disabled={savingPool}
                        className="btn btn-primary"
                        style={{ fontSize: '0.82rem', padding: '9px 18px' }}>
                        {savingPool ? 'Saving...' : selectedCircle.isPool ? 'Save Pool Settings' : 'Activate MoneyPool'}
                      </button>

                      {selectedCircle.isPool && (
                        <div style={{ borderTop: '1px solid rgba(255,80,80,0.15)', paddingTop: 14 }}>
                          <div style={{ fontSize: '0.72rem', color: 'var(--c-text-3)', marginBottom: 8, lineHeight: 1.4 }}>
                            <strong style={{ color: '#FF5050' }}>Dissolve Pool:</strong> Disabling the MoneyPool will settle all lender contributions with their earned interest and permanently close the pool. All repaid loan interest is distributed pro-rata.
                          </div>
                          <button
                            onClick={async () => {
                              if (!confirm('Are you sure? This will distribute all capital + interest to lenders and permanently close the MoneyPool.')) return;
                              setSavingPool(true);
                              try {
                                const result = await poolsAPI.disablePool(selectedCircle.id);
                                setPayoutResult(result);
                                setMsg(`MoneyPool dissolved. ${result.payouts?.length ?? 0} lender(s) paid out.`);
                                setShowPoolPanel(false);
                                await loadCircle(selectedCircle.id);
                              } catch (e: any) { setMsg('Error: ' + e.message); }
                              setSavingPool(false);
                            }}
                            disabled={savingPool}
                            style={{ fontSize: '0.78rem', padding: '7px 16px', background: 'none', border: '1px solid rgba(255,80,80,0.4)', color: '#FF5050', borderRadius: 'var(--radius-full)', cursor: 'pointer' }}>
                            {savingPool ? 'Processing...' : 'Dissolve & Pay Out Lenders'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* MoneyPool Capital Management (Visible to all members if isPool) */}
                {selectedCircle.isPool && (
                  <div className="glass-card animate-fade-in-up" style={{ padding: 20, marginBottom: 20, background: 'linear-gradient(135deg, rgba(130,107,218,0.05), rgba(0,217,166,0.05))', border: '1px solid var(--c-border-hover)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <TrendingUp size={18} color="var(--c-secondary)" />
                        <h4 style={{ fontSize: '0.9rem', color: 'var(--c-text)' }}>Pool Capital</h4>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--c-text-3)', fontWeight: 600 }}>LIQUIDITY</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--c-secondary)' }}>{selectedCircle.poolBalance?.toFixed(2) || '0.00'} XLM</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--c-surface-2)', borderRadius: 'var(--radius-md)', marginBottom: 16 }}>
                      <div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--c-text-3)', fontWeight: 700 }}>YOUR CONTRIBUTION</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--c-text)' }}>{userPoolDeposit.toFixed(2)} XLM</div>
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <input 
                          type="number" 
                          className="input" 
                          placeholder="Amount" 
                          value={depositAmount} 
                          onChange={e => setDepositAmount(e.target.value)}
                          style={{ width: 80, padding: '6px 10px', fontSize: '0.8rem' }}
                        />
                        <button 
                          onClick={async () => {
                            if (!depositAmount || parseFloat(depositAmount) <= 0) return;
                            setDepositing(true);
                            try {
                              await poolsAPI.deposit(selectedCircle.id, parseFloat(depositAmount));
                              setMsg(`Successfully deposited ${depositAmount} XLM to pool`);
                              setDepositAmount('');
                              await loadCircle(selectedCircle.id);
                            } catch (e: any) { setMsg('Error: ' + e.message); }
                            setDepositing(false);
                          }}
                          disabled={depositing}
                          className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                          {depositing ? '...' : 'Deposit'}
                        </button>
                        {userPoolDeposit > 0 && (
                          <button 
                            onClick={async () => {
                              if (!depositAmount || parseFloat(depositAmount) <= 0) return;
                              setWithdrawing(true);
                              try {
                                await poolsAPI.withdraw(selectedCircle.id, parseFloat(depositAmount));
                                setMsg(`Successfully withdrawn ${depositAmount} XLM from pool`);
                                setDepositAmount('');
                                await loadCircle(selectedCircle.id);
                              } catch (e: any) { setMsg('Error: ' + e.message); }
                              setWithdrawing(false);
                            }}
                            disabled={withdrawing}
                            className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: '0.75rem', color: '#FF4757', border: '1px solid rgba(255,71,87,0.3)' }}>
                            {withdrawing ? '...' : 'Withdraw'}
                          </button>
                        )}
                      </div>
                    </div>

                    <div style={{ fontSize: '0.7rem', color: 'var(--c-text-3)', lineHeight: 1.4 }}>
                      <p>• Deposits are added to the circle's lending liquidity.</p>
                      <p>• You earn a pro-rata share of all interest collected by the pool.</p>
                      <p>• Withdrawals are subject to available liquidity in the pool.</p>
                    </div>
                  </div>
                )}
                </>
              )}

              {/* Payout result card — shown after pool dissolution */}
              {payoutResult && (
                <div className="glass-card animate-scale-in" style={{ padding: 20, marginBottom: 20, border: '1px solid rgba(0,217,166,0.3)', background: 'rgba(0,217,166,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <TrendingUp size={16} color="var(--c-secondary)" />
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--c-secondary)' }}>Pool Dissolved — Payout Summary</span>
                    </div>
                    <button onClick={() => setPayoutResult(null)} style={{ background: 'none', border: 'none', color: 'var(--c-text-3)', cursor: 'pointer', fontSize: '1.1rem' }}>×</button>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--c-text-3)', marginBottom: 12 }}>
                    Total interest distributed: <strong style={{ color: 'var(--c-secondary)' }}>{payoutResult.totalInterestEarned?.toFixed(4) ?? '0'} XLM</strong>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {(payoutResult.payouts || []).map((p: any, i: number) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--c-surface-2)', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--c-text-2)' }}>{p.userId.slice(0, 8)}…</span>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ color: 'var(--c-text-3)' }}>{p.principal.toFixed(2)} + </span>
                          <span style={{ color: 'var(--c-secondary)' }}>{p.interest.toFixed(4)} interest</span>
                          <strong style={{ color: 'var(--c-text)', marginLeft: 8 }}>= {p.total.toFixed(4)} XLM</strong>
                        </div>
                      </div>
                    ))}
                    {(payoutResult.payouts || []).length === 0 && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--c-text-3)', textAlign: 'center', padding: '12px 0' }}>No deposits on record — nothing to pay out.</div>
                    )}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {selectedCircle.creatorId === pubKey && selectedCircle.enrichedPendingMembers?.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--c-accent)', marginBottom: 12 }}>
                      PENDING JOIN REQUESTS ({selectedCircle.enrichedPendingMembers.length})
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {selectedCircle.enrichedPendingMembers.map((member: any) => {
                        const tColor = tierColors[member.tier] || 'var(--c-primary)';
                        return (
                          <div key={member.stellarPublicKey} style={{
                            display: 'flex', alignItems: 'center', gap: 14,
                            padding: 16, borderRadius: 'var(--radius-md)',
                            background: 'var(--c-surface-2)',
                            border: '1px solid var(--c-accent)',
                          }}>
                            {/* Avatar */}
                            <div style={{
                              width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                              background: `linear-gradient(135deg, ${tColor}, var(--c-secondary))`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '0.85rem', fontWeight: 800, color: '#fff',
                            }}>
                              {(member.displayName || 'U').slice(0, 2).toUpperCase()}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--c-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{member.displayName}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--c-text-3)', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                                <Fingerprint size={10} /> {member.stellarPublicKey.slice(0, 8)}...
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button
                                onClick={async () => {
                                  try {
                                    await circlesAPI.approveJoin(selectedCircle.id, member.stellarPublicKey, 'APPROVE');
                                    setMsg('Join request approved');
                                    loadCircle(selectedCircle.id);
                                  } catch(e: any) { setMsg('Error: ' + e.message); }
                                }}
                                className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                              >
                                Approve
                              </button>
                              <button
                                onClick={async () => {
                                  try {
                                    await circlesAPI.approveJoin(selectedCircle.id, member.stellarPublicKey, 'REJECT');
                                    setMsg('Join request rejected');
                                    loadCircle(selectedCircle.id);
                                  } catch(e: any) { setMsg('Error: ' + e.message); }
                                }}
                                className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: '0.75rem', border: '1px solid var(--c-border)' }}
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {(selectedCircle.enrichedMembers || []).map((member: any) => {
                  const tColor = tierColors[member.tier] || 'var(--c-primary)';
                  return (
                  <div key={member.stellarPublicKey} style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: 16, borderRadius: 'var(--radius-md)',
                    background: 'var(--c-surface-2)',
                    border: '1px solid var(--c-border)',
                  }}>
                    {/* Avatar */}
                    <div style={{
                      width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                      background: `linear-gradient(135deg, ${tColor}, var(--c-secondary))`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.85rem', fontWeight: 800, color: '#fff',
                    }}>
                      {(member.displayName || 'U').slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--c-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{member.displayName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--c-text-3)', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                        <Fingerprint size={10} /> {member.stellarPublicKey.slice(0, 8)}...
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1rem', fontWeight: 800, color: tColor, fontFamily: 'var(--font-heading)' }}>{member.score}</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--c-text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{member.tier}</div>
                    </div>
                    {member.stellarPublicKey !== pubKey && circles.some(c => c.id === selectedCircle.id) && (
                      <button
                        onClick={() => attest(selectedCircle.id, member.stellarPublicKey)}
                        className="btn btn-primary"
                        style={{ padding: '6px 14px', fontSize: '0.75rem', flexShrink: 0, height: 32, gap: 4 }}
                        title={`Attest with weight ${attestWeight}`}
                      >
                        <CheckCircle2 size={14} /> Vouch
                      </button>
                    )}
                  </div>
                )})}
              </div>

              {circles.some(c => c.id === selectedCircle.id) && (
                <div style={{ marginTop: 24, padding: 20, background: 'var(--c-surface-2)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--c-border)' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--c-text-2)', display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span>Attestation Weight Vector</span>
                    <strong style={{ color: 'var(--c-primary)' }}>{attestWeight}</strong>
                  </label>
                  <input
                    type="range" min="0.1" max="1" step="0.1"
                    value={attestWeight}
                    onChange={e => setAttestWeight(parseFloat(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--c-primary)', marginBottom: 8 }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--c-text-3)', fontWeight: 500 }}>
                    <span>Minimal Protocol (0.1)</span><span>Maximum Leverage (1.0)</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
