'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import useWalletStore from '@/store/walletStore';
import { circlesAPI, scoreAPI } from '@/lib/api';

export default function CirclesPage() {
  const { pubKey, setScore } = useWalletStore();
  const router = useRouter();
  const [circles, setCircles] = useState<any[]>([]);
  const [publicCircles, setPublicCircles] = useState<any[]>([]);
  const [selectedCircle, setSelectedCircle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', isPublic: true });
  const [attestWeight, setAttestWeight] = useState(0.7);
  const [attestTarget, setAttestTarget] = useState('');
  const [msg, setMsg] = useState('');
  const [tab, setTab] = useState<'mine' | 'public'>('mine');

  useEffect(() => {
    if (!localStorage.getItem('tc_token')) { router.push('/'); return; }
    load();
  }, []);

  async function load() {
    setLoading(true);
    const [mine, pub] = await Promise.all([circlesAPI.list(), circlesAPI.public()]);
    setCircles(mine);
    setPublicCircles(pub.filter((p: any) => !mine.find((m: any) => m.id === p.id)));
    setLoading(false);
  }

  async function loadCircle(id: string) {
    const c = await circlesAPI.get(id);
    setSelectedCircle(c);
  }

  async function createCircle() {
    if (!form.name.trim()) return;
    setCreating(true);
    try {
      await circlesAPI.create(form);
      setForm({ name: '', description: '', isPublic: true });
      setMsg('✅ Circle created!');
      load();
    } catch (e: any) { setMsg('❌ ' + e.message); }
    setCreating(false);
  }

  async function joinCircle(id: string, inviteCode?: string) {
    try {
      await circlesAPI.join(id, inviteCode);
      setMsg('✅ Joined circle!');
      load();
    } catch (e: any) { setMsg('❌ ' + e.message); }
  }

  async function attest(circleId: string, targetPubKey: string) {
    try {
      await circlesAPI.attest(circleId, targetPubKey, attestWeight);
      const s = await scoreAPI.recalculate();
      setScore(s);
      setMsg(`✅ Attested ${targetPubKey.slice(0, 8)}... with weight ${attestWeight}`);
      loadCircle(circleId);
    } catch (e: any) { setMsg('❌ ' + e.message); }
  }

  const tierColors: Record<string, string> = {
    platinum: '#818CF8', gold: '#F59E0B', silver: '#94A3B8',
    bronze: '#D97706', building: '#F97316', establishing: '#EF4444',
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface)' }}>
      <Navbar />
      <div className="container page-content">
        <h1 className="section-title">🤝 Trust Circles</h1>
        <p className="section-subtitle">Join circles, vouch for peers, and build your on-chain credit reputation</p>

        {msg && (
          <div style={{
            marginBottom: 20, padding: 14,
            borderRadius: 'var(--radius-md)',
            background: msg.startsWith('✅') ? 'rgba(0,217,166,0.1)' : 'rgba(255,71,87,0.1)',
            border: `1px solid ${msg.startsWith('✅') ? 'rgba(0,217,166,0.3)' : 'rgba(255,71,87,0.3)'}`,
            color: msg.startsWith('✅') ? 'var(--color-secondary)' : '#FF4757',
            fontSize: '0.875rem',
          }}>
            {msg}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: selectedCircle ? '1fr 1fr' : '1fr', gap: 24 }}>
          {/* Left Panel */}
          <div>
            {/* Create Circle */}
            <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
              <h3 style={{ marginBottom: 16, fontSize: '1rem' }}>➕ Create a Circle</h3>
              <input className="input" placeholder="Circle name *" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} style={{ marginBottom: 10 }} />
              <textarea className="input" placeholder="Description (optional)" value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                style={{ marginBottom: 10, resize: 'vertical', minHeight: 60 }} />
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, fontSize: '0.85rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.isPublic} onChange={e => setForm({ ...form, isPublic: e.target.checked })} />
                <span style={{ color: 'var(--color-text-secondary)' }}>Public circle (anyone can join)</span>
              </label>
              <button onClick={createCircle} disabled={creating || !form.name.trim()} className="btn btn-primary" style={{ width: '100%' }}>
                {creating ? 'Creating...' : 'Create Circle'}
              </button>
            </div>

            {/* My Circles / Public */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {(['mine', 'public'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)} style={{
                  padding: '8px 18px', borderRadius: 'var(--radius-full)',
                  background: tab === t ? 'rgba(108,99,255,0.15)' : 'transparent',
                  border: `1px solid ${tab === t ? 'rgba(108,99,255,0.4)' : 'var(--color-border)'}`,
                  color: tab === t ? 'var(--color-primary-light)' : 'var(--color-muted)',
                  cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500, transition: 'all 0.2s',
                }}>
                  {t === 'mine' ? `My Circles (${circles.length})` : `Discover (${publicCircles.length})`}
                </button>
              ))}
            </div>

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[1, 2].map(i => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 12 }} />)}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {(tab === 'mine' ? circles : publicCircles).map(circle => (
                  <div
                    key={circle.id}
                    className="glass-card"
                    style={{ padding: 20, cursor: 'pointer', borderColor: selectedCircle?.id === circle.id ? 'rgba(108,99,255,0.5)' : 'var(--color-border)' }}
                    onClick={() => loadCircle(circle.id)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>{circle.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>
                          {circle.memberCount || circle.members?.length || 0} members · {circle.isPublic ? '🌐 Public' : '🔒 Private'}
                        </div>
                      </div>
                      {tab === 'public' && (
                        <button onClick={e => { e.stopPropagation(); joinCircle(circle.id); }} className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '0.78rem' }}>
                          Join
                        </button>
                      )}
                    </div>
                    {circle.description && (
                      <p style={{ marginTop: 8, fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{circle.description}</p>
                    )}
                    {tab === 'mine' && circle.inviteCode && (
                      <div style={{ marginTop: 10, padding: '6px 12px', background: 'rgba(108,99,255,0.06)', borderRadius: 8, fontSize: '0.78rem', color: 'var(--color-primary-light)', fontFamily: 'monospace' }}>
                        Invite Code: <strong>{circle.inviteCode}</strong>
                      </div>
                    )}
                  </div>
                ))}
                {(tab === 'mine' ? circles : publicCircles).length === 0 && (
                  <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-muted)', fontSize: '0.875rem' }}>
                    {tab === 'mine' ? 'No circles yet. Create one above!' : 'No public circles available.'}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Panel — Circle Detail */}
          {selectedCircle && (
            <div className="glass-card" style={{ padding: 24, height: 'fit-content', position: 'sticky', top: 80 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontSize: '1.1rem' }}>{selectedCircle.name}</h3>
                <button onClick={() => setSelectedCircle(null)} style={{ background: 'none', border: 'none', color: 'var(--color-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {(selectedCircle.enrichedMembers || []).map((member: any) => (
                  <div key={member.stellarPublicKey} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: 14, borderRadius: 'var(--radius-md)',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--color-border)',
                  }}>
                    {/* Avatar */}
                    <div style={{
                      width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                      background: `linear-gradient(135deg, ${tierColors[member.tier] || '#6C63FF'}, #00D9A6)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.8rem', fontWeight: 700, color: '#fff',
                    }}>
                      {member.displayName.slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{member.displayName}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-muted)', fontFamily: 'monospace' }}>
                        {member.stellarPublicKey.slice(0, 10)}...
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: tierColors[member.tier] }}>{member.score}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-muted)', textTransform: 'capitalize' }}>{member.tier}</div>
                    </div>
                    {member.stellarPublicKey !== pubKey && circles.some(c => c.id === selectedCircle.id) && (
                      <button
                        onClick={() => attest(selectedCircle.id, member.stellarPublicKey)}
                        className="btn btn-secondary"
                        style={{ padding: '4px 12px', fontSize: '0.75rem', flexShrink: 0 }}
                        title={`Attest with weight ${attestWeight}`}
                      >
                        ✅ Vouch
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {circles.some(c => c.id === selectedCircle.id) && (
                <div style={{ marginTop: 20, padding: 16, background: 'rgba(108,99,255,0.06)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(108,99,255,0.2)' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: 8 }}>
                    Attestation Weight: <strong style={{ color: 'var(--color-primary-light)' }}>{attestWeight}</strong>
                  </label>
                  <input
                    type="range" min="0.1" max="1" step="0.1"
                    value={attestWeight}
                    onChange={e => setAttestWeight(parseFloat(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--color-primary)' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--color-muted)', marginTop: 4 }}>
                    <span>Low (0.1)</span><span>High (1.0)</span>
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
