'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import Navbar from '@/components/Navbar';
import useWalletStore from '@/store/walletStore';
import { useRouter } from 'next/navigation';

const STATS = [
  { label: 'Testnet Users',   value: '500+',  icon: '👥', color: '#6C63FF' },
  { label: 'Avg Credit Score',value: '612',   icon: '📊', color: '#00D9A6' },
  { label: 'Loans Issued',    value: '$12K+', icon: '💸', color: '#FFB347' },
  { label: 'Repayment Rate',  value: '94%',   icon: '✅', color: '#A78BFA' },
];

const HOW_IT_WORKS = [
  {
    step: '01', icon: '🔐',
    title: 'Connect Wallet',
    desc: 'Link your Stellar wallet via Freighter or paste your public key. No password — purely cryptographic identity.',
    color: '#6C63FF',
  },
  {
    step: '02', icon: '🤝',
    title: 'Join Trust Circles',
    desc: 'Connect with peers who vouch for you. Each mutual attestation increases your Trust Score proportionally.',
    color: '#A855F7',
  },
  {
    step: '03', icon: '📈',
    title: 'Build Your Score',
    desc: 'Your Trust (T) + Behavior (B) + Activity (A) scores compute a 0–1000 credit rating with 6 tiers.',
    color: '#00D9A6',
  },
  {
    step: '04', icon: '💰',
    title: 'Access Micro-Loans',
    desc: 'Score ≥ 450? Request instant micro-loans (Bronze–Platinum). Repay on-time to unlock higher tiers.',
    color: '#FFB347',
  },
];

const TIERS = [
  { name: 'Establishing', range: '0–299',   color: '#EF4444', emoji: '🌱' },
  { name: 'Building',     range: '300–449', color: '#F97316', emoji: '🏗️' },
  { name: 'Bronze',       range: '450–599', color: '#D97706', emoji: '🥉' },
  { name: 'Silver',       range: '600–749', color: '#94A3B8', emoji: '🥈' },
  { name: 'Gold',         range: '750–899', color: '#F59E0B', emoji: '🥇' },
  { name: 'Platinum',     range: '900–1000',color: '#A78BFA', emoji: '💎' },
];

const FEATURES = [
  { icon: '⛓️', title: 'Stellar Native', desc: 'Built on Stellar Testnet with XLM and TRUST custom asset integration via Horizon API', color: '#6C63FF' },
  { icon: '🔒', title: 'Trustless Auth', desc: 'No passwords. Authenticate via Stellar keypair challenge-response. Your keys, your identity.', color: '#00D9A6' },
  { icon: '📊', title: 'Transparent Scoring', desc: 'Open-source T·B·A algorithm. Every data point auditable on Stellar Explorer.', color: '#FFB347' },
  { icon: '🌍', title: 'Financial Inclusion', desc: 'Designed for the 1.4B unbanked — no bank account, credit history, or collateral needed.', color: '#A855F7' },
  { icon: '🤝', title: 'Community-Driven', desc: 'Trust Circles let peers vouch for each other. Social reputation = financial credit.', color: '#F59E0B' },
  { icon: '⚡', title: 'Instant Settlement', desc: 'Stellar finalizes in 3–5 seconds at <$0.00001 per transaction. Real-world speed.', color: '#00D9A6' },
];

export default function LandingPage() {
  const { isConnected } = useWalletStore();
  const router = useRouter();
  const heroRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('tc_token');
    if (token && isConnected) router.push('/dashboard');
    setTimeout(() => setVisible(true), 100);
  }, [isConnected, router]);

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />

      {/* ── HERO ── */}
      <section ref={heroRef} style={{ position: 'relative', overflow: 'hidden', paddingTop: 120, paddingBottom: 80 }}>
        {/* Orbs */}
        <div className="orb orb-purple" style={{ width: 700, height: 500, top: '-20%', left: '-15%', opacity: 0.25, animation: 'float 8s ease-in-out infinite' }} />
        <div className="orb orb-teal"   style={{ width: 500, height: 400, bottom: '-10%', right: '-10%', opacity: 0.2, animation: 'float 10s ease-in-out infinite reverse' }} />

        <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>

          {/* Live badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 28,
            opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(12px)',
            transition: 'all 0.6s ease', }}>
            <span className="badge badge-live" style={{ fontSize: '0.78rem' }}>
              <span className="glow-dot" style={{ width: 6, height: 6 }} />
              Live on Stellar Testnet
            </span>
            <span className="badge badge-muted" style={{ fontSize: '0.72rem' }}>Blue Belt 2026</span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: 'clamp(2.6rem, 6vw, 5rem)',
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            marginBottom: 24,
            opacity: visible ? 1 : 0,
            transform: visible ? 'none' : 'translateY(16px)',
            transition: 'all 0.7s ease 0.1s',
          }}>
            Social Trust →<br />
            <span className="gradient-text">Verifiable Credit</span>
          </h1>

          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            color: 'var(--c-text-2)',
            maxWidth: 620, margin: '0 auto 40px',
            lineHeight: 1.75,
            opacity: visible ? 1 : 0,
            transform: visible ? 'none' : 'translateY(12px)',
            transition: 'all 0.7s ease 0.2s',
          }}>
            TrustChain converts your community reputation into a cryptographically-verifiable credit score on the
            Stellar blockchain — unlocking <strong style={{ color: 'var(--c-secondary)' }}>fair micro-loans</strong> for
            the <strong style={{ color: 'var(--c-primary)' }}>next billion users</strong>.
          </p>

          {/* CTA buttons */}
          <div style={{
            display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap',
            marginBottom: 72,
            opacity: visible ? 1 : 0,
            transform: visible ? 'none' : 'translateY(10px)',
            transition: 'all 0.7s ease 0.3s',
          }}>
            <Link href="/dashboard" className="btn btn-primary" style={{ fontSize: '1rem', padding: '13px 32px', borderRadius: 'var(--radius-full)' }}>
              Launch App →
            </Link>
            <a href="https://github.com/pratickdutta/TrustChain" target="_blank" rel="noopener noreferrer"
              className="btn btn-ghost" style={{ fontSize: '1rem', padding: '13px 28px' }}>
              ⭐ GitHub
            </a>
          </div>

          {/* Stats row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 14, maxWidth: 720, margin: '0 auto',
            opacity: visible ? 1 : 0,
            transition: 'all 0.7s ease 0.4s',
          }} className="stagger-children">
            {STATS.map(s => (
              <div key={s.label} className="glass-card animate-fade-in-up" style={{ padding: '20px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>{s.icon}</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, fontFamily: 'var(--font-heading)', color: s.color, lineHeight: 1 }}>
                  {s.value}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--c-text-3)', marginTop: 5, fontWeight: 500, letterSpacing: '0.03em' }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: '96px 0', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.015)', borderTop: '1px solid var(--c-border)', borderBottom: '1px solid var(--c-border)' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div className="badge badge-primary" style={{ marginBottom: 16, fontSize: '0.72rem' }}>HOW IT WORKS</div>
            <h2 className="section-title">From Trust to Credit in 4 Steps</h2>
            <p className="section-subtitle" style={{ maxWidth: 520, margin: '0 auto' }}>
              No bank account required. Your community is your credit history.
            </p>
          </div>

          <div className="grid-4">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.step} className="glass-card" style={{ padding: 28, position: 'relative' }}>
                {/* Connector line for desktop */}
                {i < HOW_IT_WORKS.length - 1 && (
                  <div style={{
                    position: 'absolute', top: '42px', right: '-10px',
                    width: 20, height: 2,
                    background: `linear-gradient(90deg, ${step.color}60, transparent)`,
                    zIndex: 2,
                  }}/>
                )}
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: `${step.color}18`,
                  border: `1px solid ${step.color}35`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.3rem', marginBottom: 16,
                  boxShadow: `0 0 20px ${step.color}20`,
                }}>
                  {step.icon}
                </div>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.12em', color: step.color, marginBottom: 8, fontFamily: 'var(--font-mono)' }}>
                  STEP {step.step}
                </div>
                <h3 style={{ fontSize: '1rem', marginBottom: 10, fontWeight: 700 }}>{step.title}</h3>
                <p style={{ fontSize: '0.83rem', color: 'var(--c-text-2)', lineHeight: 1.65 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SCORE TIERS ── */}
      <section style={{ padding: '96px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div className="badge badge-primary" style={{ marginBottom: 16 }}>CREDIT SYSTEM</div>
            <h2 className="section-title">6-Tier Credit Score System</h2>
            <p className="section-subtitle" style={{ maxWidth: 500, margin: '0 auto' }}>
              Score ranges from 0 to 1000. Each tier unlocks higher loan access.
            </p>
          </div>

          {/* Score bar visualization */}
          <div style={{
            position: 'relative',
            height: 8, borderRadius: 999,
            background: 'rgba(255,255,255,0.05)',
            marginBottom: 32,
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(90deg, #EF4444, #F97316, #D97706, #94A3B8, #F59E0B, #A78BFA)',
              borderRadius: 999,
            }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
            {TIERS.map(tier => (
              <div key={tier.name} style={{
                padding: '18px 16px',
                background: `${tier.color}0a`,
                border: `1px solid ${tier.color}30`,
                borderRadius: 'var(--radius-md)',
                textAlign: 'center',
                transition: 'var(--transition)',
                cursor: 'default',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = `${tier.color}18`;
                (e.currentTarget as HTMLElement).style.borderColor = `${tier.color}55`;
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                (e.currentTarget as HTMLElement).style.boxShadow = `0 12px 40px ${tier.color}20`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = `${tier.color}0a`;
                (e.currentTarget as HTMLElement).style.borderColor = `${tier.color}30`;
                (e.currentTarget as HTMLElement).style.transform = '';
                (e.currentTarget as HTMLElement).style.boxShadow = '';
              }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>{tier.emoji}</div>
                <div style={{ fontWeight: 800, color: tier.color, fontSize: '0.95rem', marginBottom: 4, fontFamily: 'var(--font-heading)' }}>{tier.name}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--c-text-3)' }}>{tier.range}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ padding: '96px 0', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.015)', borderTop: '1px solid var(--c-border)', borderBottom: '1px solid var(--c-border)' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div className="badge badge-primary" style={{ marginBottom: 16 }}>FEATURES</div>
            <h2 className="section-title">Why TrustChain?</h2>
          </div>
          <div className="grid-3">
            {FEATURES.map(f => (
              <div key={f.title} className="glass-card" style={{ padding: 28 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: `${f.color}15`,
                  border: `1px solid ${f.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.3rem', marginBottom: 18,
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 10, color: 'var(--c-text)' }}>{f.title}</h3>
                <p style={{ fontSize: '0.855rem', color: 'var(--c-text-2)', lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section style={{ padding: '96px 0' }}>
        <div className="container">
          <div style={{
            position: 'relative',
            background: 'rgba(8,10,24,0.8)',
            border: '1px solid rgba(108,99,255,0.25)',
            borderRadius: 'var(--radius-xl)',
            padding: 'clamp(40px, 6vw, 72px)',
            textAlign: 'center',
            overflow: 'hidden',
          }}>
            {/* Background glow */}
            <div style={{ position: 'absolute', top: '-40px', left: '50%', transform: 'translateX(-50%)', width: '80%', height: '200px', background: 'radial-gradient(ellipse, rgba(108,99,255,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '-40px', left: '50%', transform: 'translateX(-50%)', width: '60%', height: '150px', background: 'radial-gradient(ellipse, rgba(0,217,166,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>🚀</div>
              <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 900, marginBottom: 16, letterSpacing: '-0.02em' }}>
                Ready to build your <span className="gradient-text">credit score?</span>
              </h2>
              <p style={{ color: 'var(--c-text-2)', maxWidth: 500, margin: '0 auto 36px', lineHeight: 1.7, fontSize: '1rem' }}>
                Get a free Stellar testnet wallet, join a Trust Circle, and start building your on-chain credit profile in minutes.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/dashboard" className="btn btn-primary" style={{ fontSize: '1rem', padding: '14px 36px' }}>
                  Start Building Score →
                </Link>
                <a href="https://laboratory.stellar.org/#account-creator?network=test" target="_blank" rel="noopener noreferrer"
                  className="btn btn-ghost" style={{ fontSize: '1rem', padding: '14px 28px' }}>
                  Get Testnet Wallet
                </a>
              </div>

              <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 36, flexWrap: 'wrap' }}>
                {[
                  { label: 'Free to use', icon: '✅' },
                  { label: 'No KYC required', icon: '🔓' },
                  { label: 'Stellar Testnet', icon: '⛓️' },
                  { label: 'Open source', icon: '🌐' },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: 'var(--c-text-2)' }}>
                    <span>{item.icon}</span> {item.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid var(--c-border)', padding: '40px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 28, height: 28, background: 'var(--grad-primary)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, color: '#fff' }}>T</div>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--c-text-2)' }}>TrustChain</span>
              <span className="badge badge-primary" style={{ fontSize: '0.68rem' }}>Blue Belt</span>
            </div>
            <div style={{ display: 'flex', gap: 20, fontSize: '0.82rem' }}>
              {[
                { label: 'Stellar Network', href: 'https://stellar.org' },
                { label: 'GitHub', href: 'https://github.com/pratickdutta/TrustChain' },
                { label: 'Explorer', href: 'https://stellar.expert/explorer/testnet' },
                { label: 'Docs', href: 'https://docs.stellar.org' },
              ].map(link => (
                <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer"
                  style={{ color: 'var(--c-text-3)', transition: 'var(--transition)' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--c-primary)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--c-text-3)'; }}
                >{link.label}</a>
              ))}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--c-text-3)' }}>© 2026 TrustChain · Stellar Hackathon</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
