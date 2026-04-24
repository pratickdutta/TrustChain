'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import useWalletStore from '@/store/walletStore';
import { authAPI, scoreAPI } from '@/lib/api';
import { requestAccess, getAddress } from '@stellar/freighter-api';
import { Activity, Shield, Coins, Trophy, Sun, Moon, Link as LinkIcon, LogOut, ChevronRight, Droplets, Wallet } from 'lucide-react';

const NAV_LINKS = [
  { href: '/dashboard',   label: 'Dashboard',   icon: Activity },
  { href: '/circles',     label: 'Circles',     icon: Shield },
  { href: '/loans',       label: 'Loans',       icon: Coins },
  { href: '/lender',      label: 'Lend',        icon: Wallet },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
];

const TIER_COLORS: Record<string, string> = {
  platinum:    'var(--c-primary)', gold: 'var(--c-accent)', silver: 'var(--c-secondary)',
  bronze:      'var(--c-accent)', building: '#F97316', establishing: '#EF4444',
};

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { pubKey, score, isConnected, setWallet, setScore, setConnecting, isConnecting, disconnect } = useWalletStore();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [connectModal, setConnectModal] = useState(false);
  const [error, setError] = useState('');
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    
    // Check theme initially
    if (typeof window !== 'undefined') {
      const isLight = document.documentElement.classList.contains('light');
      setTheme(isLight ? 'light' : 'dark');
      
      const savedToken = localStorage.getItem('tc_token');
      const savedPubKey = localStorage.getItem('tc_pubkey');
      if (savedToken && savedPubKey && !useWalletStore.getState().isConnected) {
        setWallet(savedPubKey, savedToken, null as any);
        scoreAPI.me().then(s => setScore(s)).catch(() => disconnect());
      }
    }
    
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleTheme = () => {
    const isLight = document.documentElement.classList.toggle('light');
    setTheme(isLight ? 'light' : 'dark');
  };

  const handleConnect = async (pubKeyStr: string) => {
    setConnecting(true);
    setError('');
    try {
      const { nonce } = await authAPI.challenge(pubKeyStr);
      const { token, user } = await authAPI.verify(pubKeyStr, nonce);
      setWallet(pubKeyStr, token, user);
      
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
    try {
      setConnecting(true);
      setError('');
      
      const accessDetails = await requestAccess();
      if (accessDetails.error) {
        throw new Error(accessDetails.error);
      }
      
      const session = await getAddress();
      if (session.error) {
        throw new Error(session.error);
      }
      
      // Found address, run auth backend logic
      await handleConnect(session.address);
    } catch (err: any) {
      console.error(err);
      setError('Freighter connection failed. Check if wallet is unlocked.');
      setConnecting(false);
    }
  };

  const tierColor = score ? (TIER_COLORS[score.tier] || 'var(--c-primary)') : 'var(--c-primary)';
  const shortKey = pubKey ? `${pubKey.slice(0, 4)}…${pubKey.slice(-4)}` : '';
  const isHome = pathname === '/';

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
        backdropFilter: 'blur(32px)',
        WebkitBackdropFilter: 'blur(32px)',
        background: (scrolled || !isHome)
          ? 'rgba(0, 0, 0, 0.65)'
          : 'rgba(0, 0, 0, 0.15)',
        borderBottom: `1px solid ${(scrolled || !isHome) ? 'rgba(255,255,255,0.08)' : 'transparent'}`,
        boxShadow: (scrolled || !isHome) ? '0 4px 30px rgba(0, 0, 0, 0.4)' : 'none',
        color: 'var(--c-text)',
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: 0, height: 68 }}>

          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 'auto', textDecoration: 'none' }}>
            <img src="/logo.png" alt="TrustChain Logo" style={{ width: 44, height: 44, objectFit: 'contain', borderRadius: 10 }} />
            <div>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.05rem', color: '#fff', letterSpacing: '-0.01em' }}>
                TrustChain
              </div>
              <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600, letterSpacing: '0.08em', marginTop: -2 }}>
                MULTI-CHAIN NETWORK
              </div>
            </div>
          </Link>

          {/* Desktop nav links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginRight: 24 }}
            className="desktop-nav">
            {NAV_LINKS.map(link => {
              const active = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link key={link.href} href={link.href} style={{
                  padding: '7px 14px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.85rem',
                  fontWeight: active ? 700 : 500,
                  color: active ? '#0A0A0A' : 'rgba(255, 255, 255, 0.8)',
                  background: active ? '#FFFFFF' : 'transparent',
                  border: `1px solid transparent`,
                  transition: 'var(--transition)',
                  textDecoration: 'none',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
                onMouseEnter={(e) => { if (!active) { (e.currentTarget as HTMLElement).style.color = '#FFFFFF'; (e.currentTarget as HTMLElement).style.background = 'rgba(255, 255, 255, 0.1)'; }}}
                onMouseLeave={(e) => { if (!active) { (e.currentTarget as HTMLElement).style.color = 'rgba(255, 255, 255, 0.8)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}}
                >
                  <Icon size={14} style={{ opacity: active ? 1 : 0.7 }} />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right side controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={toggleTheme} style={{
              background: 'transparent', border: 'none', color: 'var(--c-text-2)',
              cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center'
            }}>
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {isConnected ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {/* Score pill */}
                {score && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '6px 14px',
                    background: `rgba(${tierColor === 'var(--c-primary)' ? '167,139,250' : tierColor === 'var(--c-accent)' ? '245,158,11' : '108,99,255'},0.12)`,
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

                {/* Wallet block */}
                <div style={{ position: 'relative' }} className="wallet-dropdown-trigger">
                  <button style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '7px 16px 7px 10px',
                    background: 'var(--c-surface)',
                    border: '1px solid var(--c-border)',
                    borderRadius: 'var(--radius-full)',
                    color: 'var(--c-text)',
                    fontSize: '0.82rem', fontWeight: 500,
                    transition: 'var(--transition)',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-mono)',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--c-primary)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--c-border)'; }}
                  onClick={disconnect}
                  title="Disconnect"
                  >
                    <div style={{
                      width: 22, height: 22, borderRadius: '50%',
                      background: `linear-gradient(135deg, ${tierColor}, var(--c-secondary))`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.6rem', fontWeight: 700, color: '#fff', flexShrink: 0,
                    }}>
                      {shortKey.charAt(0).toUpperCase()}
                    </div>
                    {shortKey} 
                    <LogOut size={12} color="var(--c-text-3)" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setConnectModal(true)}
                className="btn btn-primary"
                style={{ fontSize: '0.875rem', padding: '9px 20px', gap: 6 }}
              >
                <LinkIcon size={14} /> Connect Wallet
              </button>
            )}
          </div>

          {/* Hamburger for mobile */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="mobile-menu-btn"
            style={{
              background: 'none', border: 'none', color: 'var(--c-text-2)',
              padding: 8, marginLeft: 8, display: 'none', cursor: 'pointer',
            }}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div style={{
            background: 'var(--c-surface)',
            borderTop: '1px solid var(--c-border)',
            padding: '16px 24px 24px',
            display: 'flex', flexDirection: 'column', gap: 6,
            animation: 'slideDown 0.2s ease',
          }}>
            {NAV_LINKS.map(link => {
              const Icon = link.icon;
              return (
                <Link key={link.href} href={link.href}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    color: pathname === link.href ? 'var(--c-text)' : 'var(--c-text-2)',
                    background: pathname === link.href ? 'var(--c-surface-2)' : 'transparent',
                    fontSize: '0.95rem', fontWeight: 500,
                    display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none',
                  }}>
                  <Icon size={16} /> {link.label}
                </Link>
              );
            })}
          </div>
        )}
      </nav>

      {/* Connect Modal */}
      {connectModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 2000,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24,
          animation: 'fadeIn 0.2s ease',
        }}
        onClick={(e) => { if (e.target === e.currentTarget) { setConnectModal(false); setError(''); } }}
        >
          <div style={{
            width: '100%', maxWidth: 420,
            background: 'var(--c-surface)',
            border: '1px solid var(--c-border)',
            borderRadius: 'var(--radius-xl)',
            padding: 36,
            boxShadow: 'var(--shadow-lg)',
            animation: 'scaleIn 0.25s cubic-bezier(0.34,1.56,0.64,1)',
            position: 'relative'
          }}>
            <button
              onClick={() => { setConnectModal(false); setError(''); }}
              style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', color: 'var(--c-text-3)', cursor: 'pointer', padding: 4 }}
            >✕</button>

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{
                width: 56, height: 56, margin: '0 auto 16px',
                background: 'var(--grad-primary)',
                borderRadius: 16,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff',
              }}><LinkIcon size={24} /></div>
              <h2 style={{ fontSize: '1.4rem', marginBottom: 6, fontFamily: 'var(--font-heading)', color: 'var(--c-text)' }}>
                Connect Wallet
              </h2>
              <p style={{ color: 'var(--c-text-2)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                Securely authenticate to access your TrustChain multi-chain credit profile.
              </p>
            </div>

            {/* Wallet Options */}
            <button
              onClick={connectFreighter}
              disabled={isConnecting}
              style={{
                width: '100%', padding: '16px 20px', marginBottom: 12,
                background: 'var(--c-surface-2)',
                border: '1px solid var(--c-border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--c-text)',
                display: 'flex', alignItems: 'center', gap: 14,
                cursor: 'pointer', transition: 'var(--transition)',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--c-primary)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--c-border)'; }}
            >
              <div style={{
                width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                background: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <img src="https://freighter.app/images/freighter-logo.svg" alt="Freighter" style={{ width: 20 }} onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerHTML = '<span style="color:#000;font-weight:bold;">F</span>'; }} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Freighter</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--c-text-2)', marginTop: 2 }}>
                  Official Stellar browser wallet
                </div>
              </div>
              <div style={{ marginLeft: 'auto', color: 'var(--c-text-3)' }}>
                {isConnecting ? <span className="animate-spin" style={{ width: 14, height: 14, border: '2px solid var(--c-primary)', borderTopColor: 'transparent', borderRadius: '50%', display: 'block' }} /> : <ChevronRight size={18} />}
              </div>
            </button>

            {error && (
              <div className="alert alert-error" style={{ marginTop: 16 }}>
                <span style={{ fontSize: '1rem', marginRight: 4 }}>!</span> {error}
              </div>
            )}

            <p style={{ fontSize: '0.75rem', color: 'var(--c-text-3)', textAlign: 'center', marginTop: 24, lineHeight: 1.6 }}>
              New to Web3? <a href="https://freighter.app" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--c-primary)', fontWeight: 600 }}>Download Freighter</a>
            </p>
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
