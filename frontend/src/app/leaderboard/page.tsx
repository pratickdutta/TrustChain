'use client';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { usersAPI } from '@/lib/api';
import useWalletStore from '@/store/walletStore';
import { Trophy, Shield, Sparkles, Mountain, TrendingUp, Anchor, Globe, Search } from 'lucide-react';

const TIER_CONFIG: Record<string, { color: string; icon: any }> = {
  platinum:    { color: 'var(--c-primary)', icon: Trophy },
  gold:        { color: 'var(--c-accent)', icon: Sparkles },
  silver:      { color: 'var(--c-secondary)', icon: Shield },
  bronze:      { color: 'var(--c-accent)', icon: Mountain },
  building:    { color: '#F97316', icon: TrendingUp },
  establishing:{ color: '#EF4444', icon: Anchor },
};

export default function LeaderboardPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'global' | 'my-circles'>('global');
  const { pubKey, isConnected } = useWalletStore();

  useEffect(() => {
    setLoading(true);
    usersAPI.leaderboard(tab === 'my-circles' ? 'my-circles' : undefined).then(data => {
      setUsers(data);
      setLoading(false);
    });
  }, [tab, isConnected]);

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <div className="container page-content">
        <h1 className="section-title" style={{ textAlign: 'center' }}>Network Index</h1>
        <p className="section-subtitle" style={{ textAlign: 'center' }}>Top decentralized identities verified via TrustChain protocol running on Stellar infrastructure.</p>

        <div style={{ display: 'flex', gap: 12, marginBottom: 24, justifyContent: 'center' }} className="animate-fade-in-up">
          {(['global', 'my-circles'] as const).map(t => (
            <button key={t} onClick={() => { if (t === 'my-circles' && !isConnected) return; setTab(t); }} className={`btn ${tab === t ? 'btn-secondary' : 'btn-ghost'}`} style={{ padding: '10px 24px', opacity: (t === 'my-circles' && !isConnected) ? 0.5 : 1, cursor: (t === 'my-circles' && !isConnected) ? 'not-allowed' : 'pointer' }} title={(t === 'my-circles' && !isConnected) ? "Connect wallet to view your circles" : ""}>
              {t === 'global' ? <><Globe size={16} /> Global Index</> : <><TrendingUp size={16} /> Within TrustChain</>}
            </button>
          ))}
        </div>

        <div className="glass-card animate-fade-in-up" style={{ overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: 40 }}>
              {[1,2,3,4,5].map(i => (
                <div key={i} className="skeleton" style={{ height: 70, marginBottom: 16, borderRadius: 'var(--radius-md)' }} />
              ))}
            </div>
          ) : users.length === 0 ? (
            <div style={{ padding: 80, textAlign: 'center', color: 'var(--c-text-3)' }}>
              <Globe size={40} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
              <div>No operational identities registered on this shard.</div>
            </div>
          ) : (
            <div>
              {/* Header */}
              <div style={{
                display: 'grid', gridTemplateColumns: '60px 1fr 140px 120px',
                padding: '16px 28px',
                borderBottom: '1px solid var(--c-border)',
                background: 'var(--c-surface-2)',
                fontSize: '0.75rem', color: 'var(--c-text-3)', fontWeight: 700, letterSpacing: '0.08em',
              }}>
                <span>RANK</span><span>IDENTITY</span><span style={{ textAlign: 'center' }}>CLASSIFICATION</span><span style={{ textAlign: 'right' }}>RATING</span>
              </div>
              {users.map((user, idx) => {
                const tier = user.score?.tier || 'establishing';
                const cfg = TIER_CONFIG[tier] || TIER_CONFIG.establishing;
                const isMe = user.stellarPublicKey === pubKey;
                const rank = idx + 1;
                const TierIcon = cfg.icon;

                return (
                  <div key={user.stellarPublicKey} style={{
                    display: 'grid', gridTemplateColumns: '60px 1fr 140px 120px',
                    alignItems: 'center',
                    padding: '20px 28px',
                    borderBottom: '1px solid var(--c-border)',
                    background: isMe ? 'rgba(108,99,255,0.06)' : 'transparent',
                    transition: 'var(--transition)',
                  }}
                  onMouseEnter={e => !isMe && ((e.currentTarget as HTMLElement).style.background = 'var(--c-surface-2)')}
                  onMouseLeave={e => !isMe && ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                  >
                    {/* Rank */}
                    <div style={{ fontWeight: 900, fontSize: rank <= 3 ? '1.3rem' : '1rem', color: rank === 1 ? 'var(--c-accent)' : rank === 2 ? 'var(--c-secondary)' : rank === 3 ? 'var(--c-accent)' : 'var(--c-text-3)', fontFamily: 'var(--font-heading)' }}>
                      {rank === 1 ? '01' : rank === 2 ? '02' : rank === 3 ? '03' : rank < 10 ? `0${rank}` : rank}
                    </div>

                    {/* User */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                        background: `linear-gradient(135deg, ${cfg.color}, var(--c-secondary))`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.9rem', fontWeight: 800, color: '#fff',
                        boxShadow: isMe ? `0 0 20px ${cfg.color}40` : 'none',
                      }}>
                        {(user.displayName || 'U').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--c-text)', display: 'flex', alignItems: 'center', gap: 8 }}>
                          {user.displayName}
                          {isMe && <span className="badge badge-primary" style={{ padding: '2px 8px', fontSize: '0.65rem' }}>ACTIVE NODE</span>}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--c-text-3)', fontFamily: 'var(--font-mono)', marginTop: 4 }}>
                          <a
                            href={`https://stellar.expert/explorer/testnet/account/${user.stellarPublicKey}`}
                            target="_blank" rel="noopener noreferrer"
                            style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--c-text-3)', textDecoration: 'none', transition: 'var(--transition)' }}
                            onMouseEnter={e => (e.currentTarget.style.color = 'var(--c-primary)')}
                            onMouseLeave={e => (e.currentTarget.style.color = 'var(--c-text-3)')}
                          >
                            <Search size={10} /> {user.stellarPublicKey.slice(0, 8)}...{user.stellarPublicKey.slice(-4)}
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Tier */}
                    <div style={{ textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '6px 14px', borderRadius: 'var(--radius-full)',
                        background: `${cfg.color}15`, border: `1px solid ${cfg.color}30`,
                        color: cfg.color, fontSize: '0.75rem', fontWeight: 700,
                        textTransform: 'uppercase', letterSpacing: '0.05em'
                      }}>
                        <TierIcon size={12} /> {tier}
                      </span>
                    </div>

                    {/* Score */}
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 900, fontSize: '1.25rem', color: cfg.color, fontFamily: 'var(--font-heading)' }}>
                        {user.score?.totalScore || 0}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--c-text-3)', fontWeight: 600, letterSpacing: '0.05em' }}>MAX 1000</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="animate-fade-in" style={{ marginTop: 32, textAlign: 'center', fontSize: '0.85rem', color: 'var(--c-text-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <div className="glow-dot" style={{ width: 6, height: 6 }} /> Protocol computations are entirely deterministic and verifiable on block explorers.
        </div>
      </div>
    </div>
  );
}
