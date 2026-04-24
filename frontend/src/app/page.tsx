'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import Navbar from '@/components/Navbar';
import useWalletStore from '@/store/walletStore';
import { useRouter } from 'next/navigation';
import { Users, BarChart3, Coins, ShieldCheck, Link2, TrendingUp, Zap, Globe, KeyRound } from 'lucide-react';

const STATS = [
  { label: 'Active Users',    value: '500+',  icon: Users,      color: 'var(--c-primary)' },
  { label: 'Avg Score',       value: '612',   icon: BarChart3,  color: 'var(--c-secondary)' },
  { label: 'Loans Issued',    value: '$12K+', icon: Coins,      color: 'var(--c-accent)' },
  { label: 'Repayment Rate',  value: '94%',   icon: ShieldCheck,color: 'var(--c-primary)' },
];

const HOW_IT_WORKS = [
  {
    step: '01', icon: KeyRound,
    title: 'Connect Wallet',
    desc: 'Link your Web3 wallet securely. Enjoy passwordless, purely cryptographic identity verification across multi-chain ecosystems.',
    color: 'var(--c-primary)',
  },
  {
    step: '02', icon: Users,
    title: 'Network Consensus',
    desc: 'Join Trust Circles. Connect with peers who vouch for you. Each mutual attestation increases your score.',
    color: 'var(--c-secondary)',
  },
  {
    step: '03', icon: TrendingUp,
    title: 'Calculate Rating',
    desc: 'Your Trust (T) + Behavior (B) + Activity (A) metrics compute an immutable 0–1000 credit score on-chain.',
    color: 'var(--c-secondary)',
  },
  {
    step: '04', icon: Coins,
    title: 'Access Liquidity',
    desc: 'Qualify for micro-loans across integrated protocols. Maintain high repayment rates to unlock premium tiers.',
    color: 'var(--c-accent)',
  },
];

const TIERS = [
  { name: 'Establishing', range: '0–299',   color: '#EF4444' }, // Red
  { name: 'Building',     range: '300–449', color: '#F97316' }, // Orange
  { name: 'Bronze',       range: '450–599', color: '#F59E0B' }, // Bronze/Amber
  { name: 'Silver',       range: '600–749', color: '#9CA3AF' }, // Silver/Gray
  { name: 'Gold',         range: '750–899', color: '#FBBF24' }, // Gold/Yellow
  { name: 'Platinum',     range: '900–1000',color: '#A78BFA' }, // Platinum/Purple
];

const FEATURES = [
  { icon: Link2, title: 'Multi-Chain Ready', desc: 'Agnostic architecture engineered to aggregate identity and behavior across networks like Stellar, Ethereum, and more.', color: 'var(--c-primary)' },
  { icon: ShieldCheck, title: 'Trustless Auth', desc: 'Secure, passwordless authentication utilizing advanced public-key cryptography to guarantee user sovereignty.', color: 'var(--c-secondary)' },
  { icon: BarChart3, title: 'Transparent Scoring', desc: 'Open-source, deterministic evaluation algorithms. Every attestation is auditable directly on block explorers.', color: 'var(--c-accent)' },
  { icon: Globe, title: 'Financial Inclusion', desc: 'Bridging the global credit gap. Connecting underserved communities to decentralized capital without legacy requirements.', color: 'var(--c-secondary)' },
  { icon: Users, title: 'Decentralized Attestation', desc: 'Peer-to-peer reputation routing constructs resilient trust graphs, translating reputation into tangible leverage.', color: 'var(--c-accent)' },
  { icon: Zap, title: 'Instant Settlement', desc: 'Built for high-throughput networks allowing sub-second finality at minimal transaction costs.', color: 'var(--c-secondary)' },
];

export default function LandingPage() {
  const { isConnected } = useWalletStore();
  const router = useRouter();
  const heroRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [splash, setSplash] = useState<'entering' | 'visible' | 'fading' | 'hidden'>('entering');

  useEffect(() => {
    const token = localStorage.getItem('tc_token');
    if (token && isConnected) {
      router.push('/dashboard');
      return;
    }

    // Quick, punchy splash transition sequence
    const t0 = setTimeout(() => setSplash('visible'), 30);  // Trigger fade-in instantly
    const t1 = setTimeout(() => setSplash('fading'), 1000); // Hold for exactly 1.0s
    const t2 = setTimeout(() => {
      setSplash('hidden');
      setVisible(true); // Trigger rest of the page animations
    }, 1500); // 500ms fade duration

    return () => { clearTimeout(t0); clearTimeout(t1); clearTimeout(t2); };
  }, [isConnected, router]);

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      {splash !== 'hidden' && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: '#18102A', // Lighter, richer shade of purple as requested
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          opacity: splash === 'fading' ? 0 : 1,
          pointerEvents: 'none',
          transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        }}>
          {/* Subtle backglow for the logo */}
          <div style={{
            position: 'absolute', width: '40vw', height: '40vw',
            background: 'radial-gradient(circle, rgba(167, 139, 250, 0.15) 0%, transparent 65%)',
            opacity: splash === 'visible' ? 1 : 0,
            filter: 'blur(30px)',
            transition: 'opacity 0.8s ease',
          }} />
          <img src="/logo.png" alt="TrustChain Engine" style={{
            width: 'clamp(180px, 35vw, 360px)',
            height: 'clamp(180px, 35vw, 360px)', // Enforce perfect square height for a true circle
            objectFit: 'cover', // Cover ensures it fills the circle perfectly
            borderRadius: '50%', // Makes the logo perfectly round!
            boxShadow: '0 0 60px rgba(108, 99, 255, 0.2), inset 0 0 20px rgba(0,0,0,0.5)',
            transform: splash === 'entering' ? 'scale(0.92) translateY(10px)' : splash === 'fading' ? 'scale(1.08) translateY(-10px)' : 'scale(1) translateY(0)',
            opacity: splash === 'entering' ? 0 : splash === 'fading' ? 0 : 1,
            filter: splash === 'entering' ? 'blur(12px)' : splash === 'fading' ? 'blur(10px)' : 'blur(0)',
            transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            zIndex: 1,
          }} />
        </div>
      )}

      <Navbar />

      {/* ── HERO ── */}
      <section ref={heroRef} style={{ position: 'relative', overflow: 'hidden', paddingTop: 120, paddingBottom: 80 }}>
        {/* Floating background logos moved to global layout */}

        <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>

          {/* Live badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 28,
            opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(12px)',
            transition: 'all 0.6s ease', }}>
            <span className="badge badge-live" style={{ fontSize: '0.78rem' }}>
              <span className="glow-dot" style={{ width: 6, height: 6 }} />
              Mainnet & Testnet Beta
            </span>
            <span className="badge badge-muted" style={{ fontSize: '0.72rem' }}>V2 Protocol</span>
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
            color: 'var(--c-text)'
          }}>
            Decentralized Trust.<br />
            <span className="gradient-text">Verifiable Credit.</span>
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
            TrustChain converts your decentralized network reputation into a cryptographically-secured credit score — seamlessly unlocking liquidity across <strong style={{ color: 'var(--c-primary)' }}>multi-chain ecosystems</strong>.
          </p>

          {/* CTA bots */}
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
          </div>

          {/* Stats row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 14, maxWidth: 720, margin: '0 auto',
            opacity: visible ? 1 : 0,
            transition: 'all 0.7s ease 0.4s',
          }} className="stagger-children">
            {STATS.map(s => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="glass-card animate-fade-in-up" style={{ padding: '20px 16px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                    <Icon size={24} color={s.color} />
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, fontFamily: 'var(--font-heading)', color: 'var(--c-text)', lineHeight: 1 }}>
                    {s.value}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--c-text-3)', marginTop: 5, fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase' }}>
                    {s.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: '96px 0', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'var(--c-surface-2)', borderTop: '1px solid var(--c-border)', borderBottom: '1px solid var(--c-border)', opacity: 0.3 }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div className="badge badge-primary" style={{ marginBottom: 16, fontSize: '0.72rem' }}>INFRASTRUCTURE</div>
            <h2 className="section-title" style={{ color: 'var(--c-text)' }}>Protocol Initialization</h2>
            <p className="section-subtitle" style={{ maxWidth: 520, margin: '0 auto' }}>
              Designed for interoperability. Establish your identity entirely on-chain.
            </p>
          </div>

          <div className="grid-4">
            {HOW_IT_WORKS.map((step, i) => {
              const Icon = step.icon;
              return (
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
                    marginBottom: 16,
                    boxShadow: `0 0 20px ${step.color}20`,
                  }}>
                    <Icon size={22} color={step.color} />
                  </div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.12em', color: step.color, marginBottom: 8, fontFamily: 'var(--font-mono)' }}>
                    PHASE {step.step}
                  </div>
                  <h3 style={{ fontSize: '1rem', marginBottom: 10, fontWeight: 700, color: 'var(--c-text)' }}>{step.title}</h3>
                  <p style={{ fontSize: '0.83rem', color: 'var(--c-text-2)', lineHeight: 1.65 }}>{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── SCORE TIERS ── */}
      <section style={{ padding: '96px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div className="badge badge-primary" style={{ marginBottom: 16 }}>CREDIT SYSTEM</div>
            <h2 className="section-title" style={{ color: 'var(--c-text)' }}>Evaluative Hierarchies</h2>
            <p className="section-subtitle" style={{ maxWidth: 500, margin: '0 auto' }}>
              Standardized algorithm deriving multi-dimensional risk scores (0–1000).
            </p>
          </div>

          {/* Score bar visualization */}
          <div style={{
            position: 'relative',
            height: 8, borderRadius: 999,
            background: 'var(--c-surface-2)',
            marginBottom: 32,
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(90deg, #EF4444, #F97316, var(--c-accent), var(--c-secondary), var(--c-accent), var(--c-primary))',
              borderRadius: 999,
            }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
            {TIERS.map(tier => (
              <div key={tier.name} style={{
                padding: '18px 16px',
                background: `color-mix(in srgb, ${tier.color} 12%, transparent)`,
                border: `1px solid color-mix(in srgb, ${tier.color} 30%, transparent)`,
                borderRadius: 'var(--radius-md)',
                textAlign: 'center',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'default',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = `color-mix(in srgb, ${tier.color} 20%, transparent)`;
                (e.currentTarget as HTMLElement).style.borderColor = `color-mix(in srgb, ${tier.color} 55%, transparent)`;
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                (e.currentTarget as HTMLElement).style.boxShadow = `0 12px 40px color-mix(in srgb, ${tier.color} 25%, transparent)`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = `color-mix(in srgb, ${tier.color} 12%, transparent)`;
                (e.currentTarget as HTMLElement).style.borderColor = `color-mix(in srgb, ${tier.color} 30%, transparent)`;
                (e.currentTarget as HTMLElement).style.transform = '';
                (e.currentTarget as HTMLElement).style.boxShadow = '';
              }}
              >
                <div style={{ fontWeight: 800, color: tier.color, fontSize: '0.95rem', marginBottom: 4, fontFamily: 'var(--font-heading)' }}>{tier.name}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--c-text-3)' }}>{tier.range}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ padding: '96px 0', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'var(--c-surface-2)', borderTop: '1px solid var(--c-border)', borderBottom: '1px solid var(--c-border)', opacity: 0.3 }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div className="badge badge-primary" style={{ marginBottom: 16 }}>FEATURES</div>
            <h2 className="section-title" style={{ color: 'var(--c-text)' }}>Network Architecture</h2>
          </div>
          <div className="grid-3">
            {FEATURES.map(f => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="glass-card" style={{ padding: 28 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 14,
                    background: `${f.color}15`,
                    border: `1px solid ${f.color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 18,
                  }}>
                    <Icon size={24} color={f.color} />
                  </div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 10, color: 'var(--c-text)' }}>{f.title}</h3>
                  <p style={{ fontSize: '0.855rem', color: 'var(--c-text-2)', lineHeight: 1.65 }}>{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section style={{ padding: '96px 0' }}>
        <div className="container">
          <div style={{
            position: 'relative',
            background: 'var(--c-surface)',
            border: '1px solid var(--c-border)',
            borderRadius: 'var(--radius-xl)',
            padding: 'clamp(40px, 6vw, 72px)',
            textAlign: 'center',
            overflow: 'hidden',
          }}>
            {/* Background glow */}
            <div style={{ position: 'absolute', top: '-40px', left: '50%', transform: 'translateX(-50%)', width: '80%', height: '200px', background: 'radial-gradient(ellipse, rgba(108,99,255,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '-40px', left: '50%', transform: 'translateX(-50%)', width: '60%', height: '150px', background: 'radial-gradient(ellipse, rgba(0,217,166,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                <Zap size={40} color="var(--c-primary)" />
              </div>
              <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 900, marginBottom: 16, letterSpacing: '-0.02em', color: 'var(--c-text)' }}>
                Initialize your <span className="gradient-text">credit protocol</span>
              </h2>
              <p style={{ color: 'var(--c-text-2)', maxWidth: 500, margin: '0 auto 36px', lineHeight: 1.7, fontSize: '1rem' }}>
                Connect your digital asset wallet, integrate into specialized trust networks, and secure verifiable credit.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/dashboard" className="btn btn-primary" style={{ fontSize: '1rem', padding: '14px 36px' }}>
                  Initialize Application →
                </Link>
              </div>

              <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 36, flexWrap: 'wrap' }}>
                {[
                  { label: 'Unrestricted Access', icon: ShieldCheck },
                  { label: 'Censorship Resistant', icon: Globe },
                  { label: 'Multi-Chain Verified', icon: Link2 },
                  { label: 'Open-Source Consensus', icon: Users },
                ].map((item, i) => {
                  const SubIcon = item.icon;
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: 'var(--c-text-2)', fontWeight: 500 }}>
                      <SubIcon size={14} color="var(--c-text-3)" /> {item.label}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST BAND ── */}
      <section style={{ padding: '40px 0', background: 'var(--c-surface-2)', borderTop: '1px solid var(--c-border)', borderBottom: '1px solid var(--c-border)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, fontFamily: 'var(--font-heading)', color: 'var(--c-text)' }}>
            Trust <span className="glow-dot" style={{ background: 'var(--c-secondary)' }} />
            Community <span className="glow-dot" style={{ background: 'var(--c-accent)' }} />
            Credit <span className="glow-dot" style={{ background: 'var(--c-primary)' }} />
            Future
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '30px 15px' }}>
            {[
              { label: 'Community\nTrust Circles', icon: Users },
              { label: 'Blockchain\nTransparency', icon: Link2 },
              { label: 'Security\n& Reliability', icon: ShieldCheck },
              { label: 'Growth\n& Inclusion', icon: TrendingUp },
              { label: 'Fast\n& Efficient', icon: Zap },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  {i > 0 && <div className="hide-mobile" style={{ height: 40, width: 1, background: 'var(--c-border)', marginRight: 15 }} />}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left' }}>
                    <Icon size={28} color="var(--c-text)" />
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--c-text-2)', lineHeight: 1.3, whiteSpace: 'pre-wrap' }}>
                      {item.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
