'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import useWalletStore from '@/store/walletStore';
import { authAPI, scoreAPI } from '@/lib/api';

const NAV_LINKS = [
  { href: '/dashboard',   label: 'Dashboard',   emoji: '⬡' },
  { href: '/circles',     label: 'Circles',     emoji: '◎' },
  { href: '/loans',       label: 'Loans',       emoji: '◈' },
  { href: '/leaderboard', label: 'Leaderboard', emoji: '◉' },
];

const TIER_COLORS: Record<string, string> = {
  platinum:    '#A78BFA', gold: '#F59E0B', silver: '#94A3B8',
  bronze:      '#D97706', building: '#F97316', establishing: '#EF4444',
};

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { pubKey, score, user, isConnected, setWallet, setScore, setConnecting, isConnecting, disconnect } = useWalletStore();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [connectModal, setConnectModal] = useState(false);
  const [pubKeyInput, setPubKeyInput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Re-hydrate from localStorage
  useEffect(() => {
    const token = localStorage.getItem('tc_token');
    const pk = localStorage.getItem('tc_pubkey');
    if (token && pk && !isConnected) {
      // Silently rehydrate — dashboard page will populate user/score
    }
  }, [isConnected]);

  const handleConnect = async (pubKey: string, nonce?: string) => {
    setConnecting(true);
    setError('');
    try {
      let pk = pubKey;
      let nonceToUse = nonce;

      if (!nonceToUse) {
        const challenge = await authAPI.challenge(pk);
        nonceToUse = challenge.nonce;
      }
      const { token, user } = await authAPI.verify(pk, nonceToUse!);
      setWallet(pk, token, user);
      const userScore = await scoreAPI.me();
      setScore(userScore);
      setConnectModal(false);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Connection failed');
    } finally {
      setConnecting(false);
    }
  };

  const connectFreighter = async () => {
    const freighter = (window as any).freighter;
    if (!freighter) {
      setError('Freighter not installed. Install from freighter.app');
      return;
    }
    await freighter.requestAccess();
    const { address } = await freighter.getAddress();
    const { nonce } = await authAPI.challenge(address);
    await handleConnect(address, nonce);
  };

  const tierColor = score ? (TIER_COLORS[score.tier] || '#6C63FF') : '#6C63FF';
  const shortKey = pubKey ? `${pubKey.slice(0, 4)}…${pubKey.slice(-4)}` : '';

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
        backdropFilter: scrolled ? 'blur(24px)' : 'blur(12px)',
        WebkitBackdropFilter: scrolled ? 'blur(24px)' : 'blur(12px)',
        background: scrolled
          ? 'rgba(4, 5, 12, 0.92)'
          : 'rgba(4, 5, 12, 0.5)',
        borderBottom: `1px solid ${scrolled ? 'rgba(108,99,255,0.2)' : 'transparent'}`,
        boxShadow: scrolled ? '0 4px 40px rgba(0,0,0,0.4)' : 'none',
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: 0, height: 68 }}>

          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 'auto', textDecoration: 'none' }}>
            <div style={{
              width: 36, height: 36,
              background: 'linear-gradient(135deg, #6C63FF, #A855F7, #00D9A6)',
              borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1rem', fontWeight: 800, color: '#fff',
              boxShadow: '0 0 20px rgba(108,99,255,0.5)',
              fontFamily: 'var(--font-heading)',
              flexShrink: 0,
            }}>T</div>
            <div>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1rem', color: 'var(--c-text)', letterSpacing: '-0.01em' }}>
                TrustChain
              </div>
              <div style={{ fontSize: '0.6rem', color: 'var(--c-text-3)', fontWeight: 500, letterSpacing: '0.08em', marginTop: -2 }}>
                STELLAR TESTNET
              </div>
            </div>
          </Link>

          {/* Desktop nav links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginRight: 24 }}
            className="desktop-nav">
            {NAV_LINKS.map(link => {
              const active = pathname === link.href;
              return (
                <Link key={link.href} href={link.href} style={{
                  padding: '7px 14px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.85rem',
                  fontWeight: active ? 600 : 500,
                  color: active ? '#fff' : 'var(--c-text-2)',
                  background: active ? 'rgba(108,99,255,0.2)' : 'transparent',
                  border: `1px solid ${active ? 'rgba(108,99,255,0.4)' : 'transparent'}`,
                  transition: 'var(--transition)',
                  textDecoration: 'none',
                  display: 'flex', alignItems: 'center', gap: 6,
                  boxShadow: active ? 'inset 0 1px 0 rgba(255,255,255,0.1)' : 'none',
                }}
                onMouseEnter={(e) => { if (!active) { (e.currentTarget as HTMLElement).style.color = 'var(--c-text)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; }}}
                onMouseLeave={(e) => { if (!active) { (e.currentTarget as HTMLElement).style.color = 'var(--c-text-2)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}}
                >
                  <span style={{ opacity: 0.7, fontSize: '0.9rem' }}>{link.emoji}</span>
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          {isConnected ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* Score pill */}
              {score && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '6px 14px',
                  background: `rgba(${tierColor === '#A78BFA' ? '167,139,250' : tierColor === '#F59E0B' ? '245,158,11' : '108,99,255'},0.12)`,
                  border: `1px solid ${tierColor}40`,
                  borderRadius: 'var(--radius-full)',
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                }}
                onClick={() => router.push('/dashboard')}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = `${tierColor}20`; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = `${tierColor}12`; }}
                >
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: tierColor, boxShadow: `0 0 8px ${tierColor}` }} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: tierColor, fontFamily: 'var(--font-heading)' }}>
                    {score.totalScore}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--c-text-3)', textTransform: 'capitalize' }}>
                    {score.tier}
                  </span>
                </div>
              )}

              {/* Wallet address with disconnect */}
              <div style={{ position: 'relative' }} className="wallet-dropdown-trigger">
                <button style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '7px 16px 7px 10px',
                  background: 'rgba(10,12,28,0.8)',
                  border: '1px solid rgba(108,99,255,0.25)',
                  borderRadius: 'var(--radius-full)',
                  color: 'var(--c-text)',
                  fontSize: '0.82rem', fontWeight: 500,
                  transition: 'var(--transition)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-mono)',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(108,99,255,0.5)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(108,99,255,0.25)'; }}
                onClick={disconnect}
                title="Click to disconnect"
                >
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%',
                    background: `linear-gradient(135deg, ${tierColor}, #00D9A6)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.6rem', fontWeight: 700, color: '#fff', flexShrink: 0,
                  }}>
                    {shortKey.charAt(0).toUpperCase()}
                  </div>
                  {shortKey}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConnectModal(true)}
              className="btn btn-primary"
              style={{ fontSize: '0.875rem', padding: '9px 20px' }}
            >
              🔐 Connect Wallet
            </button>
          )}

          {/* Hamburger for mobile */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="mobile-menu-btn"
            style={{
              background: 'none', border: 'none', color: 'var(--c-text-2)',
              padding: 8, marginLeft: 8, display: 'none',
              fontSize: '1.3rem', cursor: 'pointer',
            }}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div style={{
            background: 'rgba(4,5,12,0.97)',
            borderTop: '1px solid var(--c-border)',
            padding: '16px 24px 24px',
            display: 'flex', flexDirection: 'column', gap: 6,
            animation: 'slideDown 0.2s ease',
          }}>
            {NAV_LINKS.map(link => (
              <Link key={link.href} href={link.href}
                onClick={() => setMenuOpen(false)}
                style={{
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  color: pathname === link.href ? '#fff' : 'var(--c-text-2)',
                  background: pathname === link.href ? 'rgba(108,99,255,0.15)' : 'transparent',
                  fontSize: '0.95rem', fontWeight: 500,
                  display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none',
                }}>
                {link.emoji} {link.label}
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* Connect Modal */}
      {connectModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 2000,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24,
          animation: 'fadeIn 0.2s ease',
        }}
        onClick={(e) => { if (e.target === e.currentTarget) { setConnectModal(false); setError(''); } }}
        >
          <div style={{
            width: '100%', maxWidth: 440,
            background: 'rgba(8, 10, 24, 0.98)',
            border: '1px solid rgba(108,99,255,0.3)',
            borderRadius: 'var(--radius-xl)',
            padding: 36,
            boxShadow: '0 40px 100px rgba(0,0,0,0.7), 0 0 60px rgba(108,99,255,0.15)',
            animation: 'scaleIn 0.25s cubic-bezier(0.34,1.56,0.64,1)',
          }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{
                width: 56, height: 56, margin: '0 auto 16px',
                background: 'linear-gradient(135deg, #6C63FF, #A855F7, #00D9A6)',
                borderRadius: 16/*, boxShadow: '0 0 30px rgba(108,99,255,0.5)'*/,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.6rem',
              }}>🔗</div>
              <h2 style={{ fontSize: '1.4rem', marginBottom: 6, fontFamily: 'var(--font-heading)' }}>
                Connect to TrustChain
              </h2>
              <p style={{ color: 'var(--c-text-2)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                Authenticate with your Stellar wallet to access your credit profile
              </p>
            </div>

            {/* Freighter option */}
            <button
              onClick={connectFreighter}
              disabled={isConnecting}
              style={{
                width: '100%', padding: '16px 20px', marginBottom: 12,
                background: 'linear-gradient(135deg, rgba(108,99,255,0.12), rgba(168,85,247,0.08))',
                border: '1px solid rgba(108,99,255,0.35)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--c-text)',
                display: 'flex', alignItems: 'center', gap: 14,
                cursor: 'pointer', transition: 'var(--transition)',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(108,99,255,0.6)'; (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg,rgba(108,99,255,0.18),rgba(168,85,247,0.12))'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(108,99,255,0.35)'; (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg,rgba(108,99,255,0.12),rgba(168,85,247,0.08))'; }}
            >
              <div style={{
                width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                background: 'rgba(108,99,255,0.15)',
                border: '1px solid rgba(108,99,255,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.2rem',
              }}>🌟</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Freighter Wallet</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--c-text-2)', marginTop: 2 }}>
                  Official Stellar browser extension — recommended
                </div>
              </div>
              <div style={{ marginLeft: 'auto', color: 'var(--c-text-3)', fontSize: '1.1rem' }}>→</div>
            </button>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0' }}>
              <div style={{ flex: 1, height: 1, background: 'var(--c-border)' }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--c-text-3)', userSelect: 'none' }}>or use public key</span>
              <div style={{ flex: 1, height: 1, background: 'var(--c-border)' }} />
            </div>

            {/* Manual entry */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input
                className="input"
                placeholder="GABC...XYZ (Stellar public key)"
                value={pubKeyInput}
                onChange={e => setPubKeyInput(e.target.value)}
                style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}
              />
              <button
                onClick={() => handleConnect(pubKeyInput.trim())}
                disabled={isConnecting || !pubKeyInput.trim()}
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                {isConnecting
                  ? <><span className="animate-spin" style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block' }} /> Authenticating...</>
                  : 'Continue with Public Key →'}
              </button>

              <p style={{ fontSize: '0.75rem', color: 'var(--c-text-3)', textAlign: 'center', lineHeight: 1.6 }}>
                Get a testnet wallet at{' '}
                <a href="https://laboratory.stellar.org/#account-creator?network=test" target="_blank" rel="noopener noreferrer"
                  style={{ color: 'var(--c-primary)', fontWeight: 600 }}>
                  Stellar Laboratory
                </a>
                {' '}· Fund it via{' '}
                <a href="https://friendbot.stellar.org" target="_blank" rel="noopener noreferrer"
                  style={{ color: 'var(--c-secondary)', fontWeight: 600 }}>
                  Friendbot
                </a>
              </p>
            </div>

            {error && (
              <div className="alert alert-error" style={{ marginTop: 16 }}>
                ⚠️ {error}
              </div>
            )}

            <button
              onClick={() => { setConnectModal(false); setError(''); }}
              style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', color: 'var(--c-text-3)', fontSize: '1.3rem', cursor: 'pointer', padding: 4, borderRadius: 6, transition: 'var(--transition)' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--c-text)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--c-text-3)'; }}
            >✕</button>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
}
