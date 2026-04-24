'use client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Network, ShieldCheck, Target, Rocket, Users, Milestone, ArrowRight, Code2, Mail, KeySquare } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      
      {/* ── HERO SECTION ── */}
      <div style={{ background: 'var(--c-surface-2)', borderBottom: '1px solid var(--c-border)', padding: '80px 0 60px' }}>
        <div className="container" style={{ maxWidth: 800, textAlign: 'center' }}>
          <div className="badge badge-primary animate-fade-in-up" style={{ marginBottom: 20, display: 'inline-flex' }}>
            <Target size={14} /> Our Mission
          </div>
          <h1 className="animate-fade-in-up" style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: 900, marginBottom: 20, lineHeight: 1.1, letterSpacing: '-0.03em', color: 'var(--c-text)', animationDelay: '100ms' }}>
            Democratizing <span className="text-gradient">Financial Access</span>
          </h1>
          <p className="animate-fade-in-up" style={{ fontSize: '1.1rem', color: 'var(--c-text-2)', lineHeight: 1.7, animationDelay: '200ms' }}>
            TrustChain is an institutional-grade protocol built on the Stellar network. We transform human trust and social capital into quantifiable, decentralized credit—empowering the unbanked to access global liquidity pools without traditional collateral.
          </p>
        </div>
      </div>

      <div className="container" style={{ maxWidth: 1000, padding: '80px 0' }}>
        
        {/* ── PROBLEM & SOLUTION ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 40, marginBottom: 80 }}>
          <div className="glass-card animate-fade-in-up" style={{ padding: 40, animationDelay: '300ms' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
               <ShieldCheck size={24} />
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 16 }}>The Problem We Solve</h3>
            <p style={{ color: 'var(--c-text-2)', lineHeight: 1.7 }}>
              Billions of individuals globally are entirely locked out of traditional credit systems simply because they lack verifiable financial history or hard collateral. They have reputation and trust within their communities, but banks cannot underwrite them. This creates a severe liquidity barrier for global growth.
            </p>
          </div>

          <div className="glass-card animate-fade-in-up" style={{ padding: 40, animationDelay: '400ms' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(0, 217, 166, 0.1)', color: 'var(--c-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
               <Network size={24} />
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 16 }}>How We Work</h3>
            <p style={{ color: 'var(--c-text-2)', lineHeight: 1.7 }}>
              We leverage an on-chain Social Circle. Users form "Trust Circles" and vouch for one another to generate a Trust Score. By analyzing network topology, repayment behavior, and community attestations, our Soroban smart contracts automatically assign users a TrustChain Rating, allowing them to draw unsecured micro-loans.
            </p>
          </div>
        </div>

        {/* ── DEFAULT PENALTY MECHANISM ── */}
        <div className="glass-card animate-fade-in-up" style={{ padding: 40, marginBottom: 80, border: '1px solid rgba(239,68,68,0.25)', background: 'linear-gradient(135deg, var(--c-surface) 0%, rgba(239,68,68,0.04) 100%)', animationDelay: '450ms' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(239,68,68,0.1)', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', color: '#EF4444', marginBottom: 4 }}>PROTOCOL ENFORCEMENT</div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--c-text)' }}>Default Penalty System</h3>
            </div>
          </div>
          <p style={{ color: 'var(--c-text-2)', lineHeight: 1.7, marginBottom: 28 }}>
            TrustChain does not rely on collateral — it relies on <strong style={{ color: 'var(--c-text)' }}>community accountability</strong>. A borrower who defaults isn't just hurting themselves; they are breaking the trust of every peer who vouched for them. The protocol enforces this mathematically.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {[
              {
                emoji: '🔥',
                title: 'TRUST Token Seizure',
                color: '#EF4444',
                desc: "On default, the borrower's entire TRUST token balance is immediately burned. All earned reputation capital is wiped.",
              },
              {
                emoji: '⚡',
                title: 'Social Slashing',
                color: '#F97316',
                desc: 'Every attester who vouched for the defaulter loses 100 TRUST tokens and a –40 BehaviorScore penalty. The default is their responsibility too.',
              },
              {
                emoji: '📉',
                title: 'Score Collapse',
                color: '#FBBF24',
                desc: "The borrower's BehaviorScore drops by 150 points, typically causing a full tier downgrade and blocking future loan access.",
              },
            ].map(item => (
              <div key={item.title} style={{ padding: '18px 20px', borderRadius: 'var(--radius-md)', background: `color-mix(in srgb, ${item.color} 6%, transparent)`, border: `1px solid color-mix(in srgb, ${item.color} 25%, transparent)` }}>
                <div style={{ fontSize: '1.4rem', marginBottom: 10 }}>{item.emoji}</div>
                <div style={{ fontWeight: 700, color: item.color, marginBottom: 8, fontSize: '0.9rem' }}>{item.title}</div>
                <p style={{ fontSize: '0.82rem', color: 'var(--c-text-2)', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── CORE MECHANISMS: CIRCLES, UCI, & INVITE SIGNATURES ── */}
        <div className="glass-card animate-fade-in-up" style={{ padding: 40, marginBottom: 80, border: '1px solid rgba(0, 217, 166, 0.25)', background: 'linear-gradient(135deg, var(--c-surface) 0%, rgba(0, 217, 166, 0.04) 100%)', animationDelay: '480ms' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(0, 217, 166, 0.1)', color: 'var(--c-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Network size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--c-secondary)', marginBottom: 4 }}>DECENTRALIZED ORGANIZATION</div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--c-text)' }}>Circle Architecture & Privacy</h3>
            </div>
          </div>
          <p style={{ color: 'var(--c-text-2)', lineHeight: 1.7, marginBottom: 28 }}>
            Trust Circles are the core structural units of TrustChain. They act as self-regulating micro-communities with built-in privacy and security layers to protect the integrity of the credit network.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {[
              {
                icon: <Target size={20} color="var(--c-primary)" />,
                title: 'UCI (Unique Circle Identification)',
                desc: "Every Trust Circle is permanently assigned a unique UCI upon creation. This cryptographic identifier ensures exact routing and allows circles to remain entirely hidden from global searches while still being accessible to those who know the exact UCI.",
              },
              {
                icon: <ShieldCheck size={20} color="var(--c-secondary)" />,
                title: 'Public vs. Private Visiblity',
                desc: 'Owners can toggle their Circle’s visibility dynamically. Public circles appear in the global directory for anyone to join. Private circles are completely stealth; they can only be discovered if the owner shares the specific UCI or a direct Join Link.',
              },
              {
                icon: <KeySquare size={20} color="var(--c-accent)" />,
                title: 'Invite Signatures (Bypass keys)',
                desc: "When a user attempts to join a private circle, the request usually goes into a pending state for manual owner approval. However, owners can distribute an 'Invite Signature'—a cryptographic passkey that grants instant, automated access to the circle without review.",
              },
            ].map(item => (
              <div key={item.title} style={{ padding: '18px 20px', borderRadius: 'var(--radius-md)', background: 'var(--c-surface-2)', border: '1px solid var(--c-border)' }}>
                <div style={{ marginBottom: 12 }}>{item.icon}</div>
                <div style={{ fontWeight: 700, color: 'var(--c-text)', marginBottom: 8, fontSize: '0.9rem' }}>{item.title}</div>
                <p style={{ fontSize: '0.82rem', color: 'var(--c-text-2)', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── ABOUT THE FOUNDER ── */}
        <div className="glass-card animate-fade-in-up" style={{ padding: '60px 40px', marginBottom: 80, border: '1px solid rgba(130, 107, 218, 0.3)', background: 'linear-gradient(135deg, var(--c-surface) 0%, rgba(130, 107, 218, 0.05) 100%)', animationDelay: '500ms' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--c-surface-2)', border: '2px solid var(--c-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <Users size={32} color="var(--c-primary)" />
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: 8 }}>Pratick Dutta</h2>
            <p style={{ color: 'var(--c-primary)', fontWeight: 700, letterSpacing: '0.1em', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: 24 }}>Student Developer & Founder</p>
            <p style={{ color: 'var(--c-text-2)', lineHeight: 1.8, maxWidth: 640, marginBottom: 24 }}>
              I am a student developer passionate about building decentralized solutions that bridge the gap between human sociology and Web3 architecture. Driven by a desire to solve foundational global problems, I built TrustChain to explore how systemic financial exclusion can be overcome through cryptographic networks—proving that strong community bonds can serve as the ultimate financial collateral.
            </p>
            <div style={{ display: 'flex', gap: 16 }}>
              <a href="mailto:pratickdutta006@gmail.com" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'var(--c-surface)', border: '1px solid var(--c-border)', borderRadius: 'var(--radius-full)', color: 'var(--c-text)', fontSize: '0.9rem', textDecoration: 'none', transition: 'all 0.2s' }}>
                <Mail size={16} color="var(--c-primary)" /> Email
              </a>
              <a href="https://github.com/pratickdutta" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'var(--c-surface)', border: '1px solid var(--c-border)', borderRadius: 'var(--radius-full)', color: 'var(--c-text)', fontSize: '0.9rem', textDecoration: 'none', transition: 'all 0.2s' }}>
                <Code2 size={16} color="var(--c-primary)" /> GitHub
              </a>
            </div>
          </div>
        </div>

        {/* ── OUR FUTURE VISION ── */}
        <div className="animate-fade-in-up" style={{ animationDelay: '600ms' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 30, textAlign: 'center' }}>The Future Roadmap</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
            {[
              { icon: Rocket, label: 'Cross-Border Capital', text: 'Expanding our liquidity pools to allow retail investors worldwide to fund micro-loans directly.' },
              { icon: Milestone, label: 'Oracle Integration', text: 'Implementing rigorous off-chain identity verification via decentralized Web3 oracles.' },
              { icon: Network, label: 'B2B Protocol APIs', text: 'Licensing the TrustChain scoring engine so other dApps can utilize our decentralized credit rating system.' }
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="glass-card" style={{ padding: 30 }}>
                  <div style={{ marginBottom: 16, color: 'var(--c-accent)' }}><Icon size={28} /></div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 10 }}>{item.label}</h4>
                  <p style={{ color: 'var(--c-text-3)', fontSize: '0.9rem', lineHeight: 1.6 }}>{item.text}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="animate-fade-in-up" style={{ textAlign: 'center', marginTop: 80, animationDelay: '700ms' }}>
          <Link href="/dashboard" className="btn btn-primary" style={{ padding: '14px 32px', fontSize: '1.1rem' }}>
            Access Output Gateway <ArrowRight size={18} />
          </Link>
        </div>

      </div>
    </div>
  );
}
