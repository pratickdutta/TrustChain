'use client';
import { Mail, Code2, Users, Shield, Link2, CheckCircle, Globe } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{
      width: '100%',
      background: 'var(--c-surface-2)',
      borderTop: '1px solid var(--c-border)',
      padding: '60px 0 30px',
      color: 'var(--c-text-2)',
      fontFamily: 'var(--font-body)',
      position: 'relative',
      zIndex: 10,
    }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 40, marginBottom: 40 }}>
          
          {/* Brand & About */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <img src="/logo-light.png" alt="TrustChain Logo" className="logo-light-only" style={{ width: 36, height: 36, objectFit: 'contain', borderRadius: 8 }} />
              <img src="/logo.png" alt="TrustChain Logo" className="logo-dark-only" style={{ width: 36, height: 36, objectFit: 'contain', borderRadius: 8 }} />
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--c-text)' }}>
                TrustChain
              </span>
            </div>
            <div style={{ marginTop: 12 }}>
              <Link href="/about" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--c-text)', fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none', background: 'var(--c-surface)', padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--c-border)' }}>
                About Us <Link2 size={16} color="var(--c-primary)" />
              </Link>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 style={{ color: 'var(--c-text)', fontWeight: 700, marginBottom: 16, fontFamily: 'var(--font-heading)' }}>Platform</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.9rem' }}>
              <Link href="/dashboard" style={{ color: 'var(--c-text-3)' }}>Dashboard</Link>
              <Link href="/circles" style={{ color: 'var(--c-text-3)' }}>Trust Circles</Link>
              <Link href="/loans" style={{ color: 'var(--c-text-3)' }}>Liquidity</Link>
              <Link href="/leaderboard" style={{ color: 'var(--c-text-3)' }}>Network Index</Link>
            </div>
          </div>

          {/* Contact & Founder */}
          <div>
            <h4 style={{ color: 'var(--c-text)', fontWeight: 700, marginBottom: 16, fontFamily: 'var(--font-heading)' }}>Contact & Founder</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ padding: 6, background: 'var(--c-surface)', borderRadius: 6, border: '1px solid var(--c-border)' }}>
                  <Users size={16} color="var(--c-primary)" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--c-text-3)', fontWeight: 600, lineHeight: 1 }}>FOUNDER</span>
                  <span style={{ color: 'var(--c-text)', fontWeight: 600, lineHeight: 1.2 }}>Pratick Dutta</span>
                </div>
              </div>

              <a href="mailto:pratickdutta006@gmail.com" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                <div style={{ padding: 6, background: 'var(--c-surface)', borderRadius: 6, border: '1px solid var(--c-border)' }}>
                  <Mail size={16} color="var(--c-primary)" />
                </div>
                <span style={{ color: 'var(--c-text-2)' }}>pratickdutta006@gmail.com</span>
              </a>

              <a href="https://github.com/pratickdutta" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                <div style={{ padding: 6, background: 'var(--c-surface)', borderRadius: 6, border: '1px solid var(--c-border)' }}>
                  <Code2 size={16} color="var(--c-primary)" />
                </div>
                <span style={{ color: 'var(--c-text-2)' }}>github.com/pratickdutta</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{ borderTop: '1px solid var(--c-border)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, fontSize: '0.8rem', color: 'var(--c-text-3)' }}>
          <div>© {new Date().getFullYear()} TrustChain Protocol Foundation. All rights reserved.</div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Shield size={14}/> Secure</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Globe size={14}/> Decentralized</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
