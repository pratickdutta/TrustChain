'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import useWalletStore from '@/store/walletStore';
import { authAPI, scoreAPI } from '@/lib/api';

// Icon components (inline SVG)
const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const XIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const navLinks = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/circles', label: 'Trust Circles' },
  { href: '/loans', label: 'Loans' },
  { href: '/leaderboard', label: 'Leaderboard' },
];

export default function Navbar() {
  const { pubKey, user, score, isConnected, isConnecting, setWallet, setScore, setConnecting, disconnect } = useWalletStore();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const connectWallet = useCallback(async () => {
    setConnecting(true);
    try {
      // Try Freighter wallet
      const freighter = (window as any).freighter;
      if (!freighter) {
        // Demo mode: use a generated testnet keypair hint
        alert('Freighter wallet not detected.\n\nInstall Freighter from https://freighter.app to connect your Stellar wallet.\n\nFor demo: enter your Stellar public key on the login page.');
        setConnecting(false);
        return;
      }

      await freighter.requestAccess();
      const { address } = await freighter.getAddress();
      if (!address) throw new Error('No address returned from Freighter');

      const { nonce } = await authAPI.challenge(address);
      const { token, user } = await authAPI.verify(address, nonce);
      setWallet(address, token, user);

      const userScore = await scoreAPI.me();
      setScore(userScore);
    } catch (err: any) {
      console.error('Wallet connection failed:', err);
    } finally {
      setConnecting(false);
    }
  }, [setConnecting, setWallet, setScore]);

  const tierColor: Record<string, string> = {
    platinum: '#818CF8', gold: '#F59E0B', silver: '#94A3B8',
    bronze: '#D97706', building: '#F97316', establishing: '#EF4444',
  };

  return (
    <nav className="nav">
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'linear-gradient(135deg, #6C63FF, #00D9A6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 800, color: '#fff',
          }}>T</div>
          <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '1.1rem', color: '#F0F0F5' }}>
            TrustChain
          </span>
        </Link>

        {/* Desktop Links */}
        {isConnected && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }} className="desktop-nav">
            {navLinks.map(l => (
              <Link key={l.href} href={l.href} style={{
                textDecoration: 'none',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: pathname === l.href ? 'var(--color-primary-light)' : 'var(--color-text-secondary)',
                background: pathname === l.href ? 'rgba(108,99,255,0.12)' : 'transparent',
                transition: 'all 0.2s',
              }}>{l.label}</Link>
            ))}
          </div>
        )}

        {/* Right: wallet */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {isConnected && score && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 14px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.8rem',
            }}>
              <span style={{ color: tierColor[score.tier] || '#fff', fontWeight: 700 }}>{score.totalScore}</span>
              <span style={{ color: 'var(--color-muted)' }}>pts</span>
            </div>
          )}
          {isConnected ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Link href="/dashboard" style={{
                textDecoration: 'none',
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 14px',
                background: 'rgba(108,99,255,0.1)',
                border: '1px solid rgba(108,99,255,0.3)',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8rem',
                color: 'var(--color-primary-light)',
                fontWeight: 500,
              }}>
                <span style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: 'var(--color-secondary)', display: 'inline-block',
                }} />
                {pubKey?.slice(0, 6)}...{pubKey?.slice(-4)}
              </Link>
              <button onClick={disconnect} className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={connectWallet}
              disabled={isConnecting}
              className="btn btn-primary"
              style={{ padding: '8px 20px' }}
            >
              {isConnecting ? (
                <span className="animate-spin" style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} />
              ) : '🔐 Connect Wallet'}
            </button>
          )}

          {/* Mobile hamburger */}
          <button
            className="btn btn-ghost"
            style={{ padding: '8px', display: 'none' }}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <XIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && isConnected && (
        <div style={{
          borderTop: '1px solid var(--color-border)',
          padding: '16px 24px',
          display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          {navLinks.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)} style={{
              textDecoration: 'none',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              color: pathname === l.href ? 'var(--color-primary-light)' : 'var(--color-text-secondary)',
              background: pathname === l.href ? 'rgba(108,99,255,0.12)' : 'transparent',
            }}>{l.label}</Link>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          button[style*="display: none"] { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}
