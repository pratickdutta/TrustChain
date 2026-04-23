'use client';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { usersAPI } from '@/lib/api';
import useWalletStore from '@/store/walletStore';

const TIER_CONFIG: Record<string, { color: string; emoji: string }> = {
  platinum:    { color: '#818CF8', emoji: '💎' },
  gold:        { color: '#F59E0B', emoji: '🥇' },
  silver:      { color: '#94A3B8', emoji: '🥈' },
  bronze:      { color: '#D97706', emoji: '🥉' },
  building:    { color: '#F97316', emoji: '🏗️' },
  establishing:{ color: '#EF4444', emoji: '🌱' },
};

export default function LeaderboardPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { pubKey } = useWalletStore();

  useEffect(() => {
    usersAPI.leaderboard().then(data => {
      setUsers(data);
      setLoading(false);
    });
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface)' }}>
      <Navbar />
      <div className="container page-content">
        <h1 className="section-title">🏆 Leaderboard</h1>
        <p className="section-subtitle">Top TrustChain users by credit score — Stellar Testnet</p>

        <div className="glass-card" style={{ overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: 40 }}>
              {[1,2,3,4,5].map(i => (
                <div key={i} className="skeleton" style={{ height: 60, marginBottom: 10, borderRadius: 12 }} />
              ))}
            </div>
          ) : users.length === 0 ? (
            <div style={{ padding: 60, textAlign: 'center', color: 'var(--color-muted)' }}>
              No users yet. Be the first to connect!
            </div>
          ) : (
            <div>
              {/* Header */}
              <div style={{
                display: 'grid', gridTemplateColumns: '60px 1fr 120px 100px',
                padding: '14px 24px',
                borderBottom: '1px solid var(--color-border)',
                fontSize: '0.75rem', color: 'var(--color-muted)', fontWeight: 600, letterSpacing: '0.05em',
              }}>
                <span>RANK</span><span>USER</span><span style={{ textAlign: 'center' }}>TIER</span><span style={{ textAlign: 'right' }}>SCORE</span>
              </div>
              {users.map((user, idx) => {
                const tier = user.score?.tier || 'establishing';
                const cfg = TIER_CONFIG[tier] || TIER_CONFIG.establishing;
                const isMe = user.stellarPublicKey === pubKey;
                const rank = idx + 1;

                return (
                  <div key={user.stellarPublicKey} style={{
                    display: 'grid', gridTemplateColumns: '60px 1fr 120px 100px',
                    alignItems: 'center',
                    padding: '16px 24px',
                    borderBottom: '1px solid var(--color-border)',
                    background: isMe ? 'rgba(108,99,255,0.08)' : 'transparent',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => !isMe && ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)')}
                  onMouseLeave={e => !isMe && ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                  >
                    {/* Rank */}
                    <div style={{ fontWeight: 800, fontSize: rank <= 3 ? '1.1rem' : '0.95rem' }}>
                      {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`}
                    </div>

                    {/* User */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                        background: `linear-gradient(135deg, ${cfg.color}, #00D9A6)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.8rem', fontWeight: 700, color: '#fff',
                      }}>
                        {(user.displayName || 'U').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                          {user.displayName}
                          {isMe && <span style={{ marginLeft: 8, fontSize: '0.7rem', color: 'var(--color-primary-light)', fontWeight: 400 }}>← You</span>}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-muted)', fontFamily: 'monospace' }}>
                          <a
                            href={`https://stellar.expert/explorer/testnet/account/${user.stellarPublicKey}`}
                            target="_blank" rel="noopener noreferrer"
                            style={{ color: 'var(--color-primary-light)', textDecoration: 'none' }}
                          >
                            {user.stellarPublicKey.slice(0, 8)}...{user.stellarPublicKey.slice(-4)}
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Tier */}
                    <div style={{ textAlign: 'center' }}>
                      <span style={{
                        padding: '4px 12px', borderRadius: 'var(--radius-full)',
                        background: `${cfg.color}20`, border: `1px solid ${cfg.color}40`,
                        color: cfg.color, fontSize: '0.75rem', fontWeight: 600,
                      }}>
                        {cfg.emoji} {tier.charAt(0).toUpperCase() + tier.slice(1)}
                      </span>
                    </div>

                    {/* Score */}
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, fontSize: '1.1rem', color: cfg.color, fontFamily: 'Space Grotesk' }}>
                        {user.score?.totalScore || 0}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-muted)' }}>/ 1000</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ marginTop: 24, textAlign: 'center', fontSize: '0.8rem', color: 'var(--color-muted)' }}>
          Scores update within 30 seconds of any credit event.{' '}
          <a href="/circles" style={{ color: 'var(--color-primary-light)' }}>Join a circle</a> to boost your rank.
        </div>
      </div>
    </div>
  );
}
