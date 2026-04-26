'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import useWalletStore from '@/store/walletStore';
import { authAPI, scoreAPI } from '@/lib/api';
import { Activity, Shield, Coins, Trophy, Sun, Moon, Link as LinkIcon, LogOut, ChevronRight, Droplets, Wallet } from 'lucide-react';
import { StellarWalletsKit, Networks } from '@creit.tech/stellar-wallets-kit';
import { FreighterModule, FREIGHTER_ID } from '@creit.tech/stellar-wallets-kit/modules/freighter';
import { AlbedoModule } from '@creit.tech/stellar-wallets-kit/modules/albedo';
import { LobstrModule } from '@creit.tech/stellar-wallets-kit/modules/lobstr';
import { xBullModule } from '@creit.tech/stellar-wallets-kit/modules/xbull';
import { WalletConnectModule, WalletConnectTargetChain } from '@creit.tech/stellar-wallets-kit/modules/wallet-connect';

const isMobile = () =>
  typeof navigator !== 'undefined' &&
  /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);

const NAV_LINKS = [
  { href: '/dashboard',   label: 'Dashboard',   icon: Activity },
  { href: '/circles',     label: 'Circles',     icon: Shield },
  { href: '/loans',       label: 'Loans',       icon: Coins },
  { href: '/lender',      label: 'Lend',        icon: Wallet },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/metrics',     label: 'Metrics',     icon: Droplets },
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
      
      // Initialize Wallet Kit globally on mount
      try {
        const mobile = isMobile();
        const modules: any[] = [
          // Only include Freighter on desktop — on mobile it causes the "Install" redirect loop
          ...(mobile ? [] : [new FreighterModule()]),
          new AlbedoModule(),
          new LobstrModule(),
          new xBullModule(),
        ];

        // Add WalletConnect for proper mobile wallet deep-linking
        const wcProjectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID;
        if (wcProjectId) {
          modules.push(new WalletConnectModule({
            projectId: wcProjectId,
            metadata: {
              name: 'TrustChain',
              description: 'Decentralized Credit Network on Stellar',
              url: window.location.origin,
              icons: ['https://trustchain.app/favicon.ico'],
            },
            allowedChains: [WalletConnectTargetChain.TESTNET],
          }));
        }

        StellarWalletsKit.init({
          network: Networks.TESTNET,
          selectedWalletId: mobile ? undefined : FREIGHTER_ID,
          modules,
        });
        StellarWalletsKit.setTheme({
          "background": "rgba(18, 10, 34, 0.75)",
          "background-secondary": "rgba(255, 255, 255, 0.05)",
          "foreground-strong": "#ffffff",
          "foreground": "rgba(255, 255, 255, 0.9)",
          "foreground-secondary": "rgba(255, 255, 255, 0.6)",
          "primary": "#8B5CF6",
          "primary-foreground": "#ffffff",
          "transparent": "transparent",
          "lighter": "rgba(255, 255, 255, 0.1)",
          "light": "rgba(255, 255, 255, 0.05)",
          "light-gray": "rgba(255, 255, 255, 0.1)",
          "gray": "rgba(255, 255, 255, 0.2)",
          "danger": "#ef4444",
          "border": "rgba(255, 255, 255, 0.15)",
          "shadow": "0 8px 32px rgba(0, 0, 0, 0.6)",
          "border-radius": "16px",
          "font-family": "var(--font-sans), sans-serif",
        });
      } catch (e) {
        // already initialized
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

  const connectWalletsKit = async () => {
    try {
      setConnecting(true);
      setError('');
      
      const { address: pubKey } = await StellarWalletsKit.authModal();
      if (!pubKey) {
        throw new Error('Wallet connection cancelled.');
      }
      
      await handleConnect(pubKey);
    } catch (err: any) {
      console.error('Wallet connect error:', err);
      if (err.message && !err.message.includes('closed') && !err.message.includes('cancel')) {
        setError(err.message || 'Connection failed.');
      }
    } finally {
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
          ? (theme === 'light' ? 'rgba(190, 165, 235, 0.98)' : 'rgba(0, 0, 0, 0.65)')
          : (theme === 'light' ? 'rgba(190, 165, 235, 0.5)' : 'rgba(0, 0, 0, 0.15)'),
        borderBottom: `1px solid ${(scrolled || !isHome) ? (theme === 'light' ? 'rgba(59,34,110,0.15)' : 'rgba(255,255,255,0.08)') : 'transparent'}`,
        boxShadow: (scrolled || !isHome) ? (theme === 'light' ? '0 4px 40px rgba(59, 34, 110, 0.12)' : '0 4px 30px rgba(0, 0, 0, 0.4)') : 'none',
        color: theme === 'light' ? '#2A1550' : 'var(--c-text)',
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: 0, height: 68 }}>

          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 'auto', textDecoration: 'none' }}>
            <img src="/logo-light.png" alt="TrustChain Logo" className="logo-light-only" style={{ width: 44, height: 44, objectFit: 'contain', borderRadius: 10 }} />
            <img src="/logo.png" alt="TrustChain Logo" className="logo-dark-only" style={{ width: 44, height: 44, objectFit: 'contain', borderRadius: 10 }} />
            <div>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.05rem', color: theme === 'light' ? '#3B226E' : '#fff', letterSpacing: '-0.01em' }}>
                TrustChain
              </div>
              <div style={{ fontSize: '0.6rem', color: theme === 'light' ? 'rgba(59,34,110,0.6)' : 'rgba(255,255,255,0.6)', fontWeight: 600, letterSpacing: '0.08em', marginTop: -2 }}>
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
                  color: active ? (theme === 'light' ? '#fff' : '#0A0A0A') : (theme === 'light' ? 'rgba(0,0,0,0.6)' : 'rgba(255, 255, 255, 0.8)'),
                  background: active ? (theme === 'light' ? 'var(--c-bg)' : '#FFFFFF') : 'transparent',
                  border: `1px solid transparent`,
                  transition: 'var(--transition)',
                  textDecoration: 'none',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
                onMouseEnter={(e) => { if (!active) { (e.currentTarget as HTMLElement).style.color = theme === 'light' ? '#000' : '#FFFFFF'; (e.currentTarget as HTMLElement).style.background = theme === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.1)'; }}}
                onMouseLeave={(e) => { if (!active) { (e.currentTarget as HTMLElement).style.color = theme === 'light' ? 'rgba(0,0,0,0.6)' : 'rgba(255, 255, 255, 0.8)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}}
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
              background: 'transparent', border: 'none', color: theme === 'light' ? '#3B226E' : 'var(--c-text-2)',
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
                    <span style={{ fontSize: '0.7rem', color: theme === 'light' ? 'rgba(59,34,110,0.7)' : 'var(--c-text-3)', textTransform: 'capitalize' }}>
                      {score.tier}
                    </span>
                  </div>
                )}

                {/* Wallet block */}
                <div style={{ position: 'relative' }} className="wallet-dropdown-trigger">
                  <button style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '7px 16px 7px 10px',
                    background: theme === 'light' ? 'rgba(59, 34, 110, 0.04)' : 'var(--c-surface)',
                    border: `1px solid ${theme === 'light' ? 'rgba(59, 34, 110, 0.1)' : 'var(--c-border)'}`,
                    borderRadius: 'var(--radius-full)',
                    color: theme === 'light' ? '#3B226E' : 'var(--c-text)',
                    fontSize: '0.82rem', fontWeight: 600,
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
                    <LogOut size={12} color={theme === 'light' ? 'rgba(59,34,110,0.6)' : "var(--c-text-3)"} />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={connectWalletsKit}
                disabled={isConnecting}
                className="btn btn-primary"
                style={{ fontSize: '0.875rem', padding: '9px 20px', gap: 6 }}
              >
                {isConnecting ? (
                  <><span className="animate-spin" style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} /> Connecting...</>
                ) : (
                  <><LinkIcon size={14} /> Connect Wallet</>
                )}
              </button>
            )}
          </div>

          {/* Hamburger for mobile */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="mobile-menu-btn"
            style={{
              background: 'none', border: 'none', color: theme === 'light' ? '#3B226E' : 'var(--c-text-2)',
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

      {/* Connect Modal REMOVED, now using StellarWalletsKit */}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
}
