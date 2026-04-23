'use client';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import WalletConnect from '@/components/WalletConnect';
import useWalletStore from '@/store/walletStore';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const stats = [
  { label: 'Testnet Users', value: '500+', icon: '👥' },
  { label: 'Avg Credit Score', value: '612', icon: '📊' },
  { label: 'Loans Issued', value: '$12K+', icon: '💸' },
  { label: 'Repayment Rate', value: '94%', icon: '✅' },
];

const steps = [
  { step: '01', title: 'Connect Wallet', desc: 'Link your Stellar wallet via Freighter or paste your public key to get started instantly.', icon: '🔐' },
  { step: '02', title: 'Join a Trust Circle', desc: 'Connect with peers who vouch for you. Mutual attestations build your on-chain credit score.', icon: '🤝' },
  { step: '03', title: 'Build Your Score', desc: 'Your Trust (T), Behavior (B), and Activity (A) scores combine into a 0–1000 credit rating.', icon: '📈' },
  { step: '04', title: 'Access Loans', desc: 'Score ≥ 450? Request micro-loans instantly. Repay on time to unlock higher tiers.', icon: '💰' },
];

export default function LandingPage() {
  const { isConnected } = useWalletStore();
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('tc_token');
    if (token && isConnected) {
      router.push('/dashboard');
    }
  }, [isConnected, router]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface)' }}>
      <Navbar />

      {/* Hero */}
      <section style={{
        position: 'relative',
        overflow: 'hidden',
        padding: '100px 0 80px',
        textAlign: 'center',
      }}>
        {/* Background glow */}
        <div style={{
          position: 'absolute', top: '-40%', left: '50%', transform: 'translateX(-50%)',
          width: '900px', height: '600px',
          background: 'radial-gradient(ellipse, rgba(108,99,255,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 16px',
            background: 'rgba(0, 217, 166, 0.1)',
            border: '1px solid rgba(0, 217, 166, 0.3)',
            borderRadius: 'var(--radius-full)',
            marginBottom: 24,
            fontSize: '0.8rem', color: 'var(--color-secondary)', fontWeight: 500,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-secondary)', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            Live on Stellar Testnet
          </div>

          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.6rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: 20 }}>
            Social Trust → <br />
            <span className="gradient-text">Verifiable Credit</span>
          </h1>

          <p style={{
            fontSize: '1.1rem', color: 'var(--color-text-secondary)',
            maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.7,
          }}>
            TrustChain converts your peer reputation into on-chain credit scores on Stellar,
            unlocking <strong>fair micro-loans</strong> for the next billion users.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 60 }}>
            <Link href="/dashboard" className="btn btn-primary" style={{ fontSize: '1rem', padding: '14px 32px' }}>
              Launch App →
            </Link>
            <a href="https://github.com/pratickdutta/TrustChain" target="_blank" rel="noopener noreferrer"
              className="btn btn-secondary" style={{ fontSize: '1rem', padding: '14px 32px' }}>
              ⭐ GitHub
            </a>
          </div>

          {/* Stats row */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 16, maxWidth: 700, margin: '0 auto',
          }}>
            {stats.map(s => (
              <div key={s.label} className="stat-card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.4rem', marginBottom: 4 }}>{s.icon}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Space Grotesk', color: 'var(--color-text)' }}>{s.value}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '80px 0', background: 'rgba(255,255,255,0.015)' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: 8 }}>How TrustChain Works</h2>
          <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', marginBottom: 48 }}>From community trust to verifiable credit in 4 steps</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
            {steps.map(s => (
              <div key={s.step} className="glass-card" style={{ padding: '28px 24px' }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 44, height: 44, borderRadius: 'var(--radius-md)',
                  background: 'rgba(108,99,255,0.12)',
                  border: '1px solid rgba(108,99,255,0.2)',
                  fontSize: '1.2rem', marginBottom: 16,
                }}>{s.icon}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-primary)', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 8 }}>
                  STEP {s.step}
                </div>
                <h3 style={{ fontSize: '1.05rem', marginBottom: 8 }}>{s.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Connect section */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', fontSize: '1.8rem', marginBottom: 8 }}>Get Started Today</h2>
          <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', marginBottom: 40 }}>
            Connect your Stellar wallet and start building your on-chain credit score
          </p>
          <WalletConnect />
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--color-border)',
        padding: '32px 0',
        textAlign: 'center',
        color: 'var(--color-muted)',
        fontSize: '0.82rem',
      }}>
        <div className="container">
          <p>
            Built on{' '}
            <a href="https://stellar.org" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary-light)' }}>Stellar Network</a>
            {' '}·{' '}
            <a href="https://github.com/pratickdutta/TrustChain" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary-light)' }}>GitHub</a>
            {' '}·{' '}
            <a href="https://docs.stellar.org" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary-light)' }}>Stellar Docs</a>
          </p>
          <p style={{ marginTop: 8 }}>© 2026 TrustChain. Blue Belt Submission — Stellar Hackathon.</p>
        </div>
      </footer>
    </div>
  );
}
