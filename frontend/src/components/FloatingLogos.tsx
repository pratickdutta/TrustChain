'use client';

export default function FloatingLogos() {
  return (
    <div style={{ position: 'fixed', inset: 0, opacity: 0.15, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      {/* Stellar / layers icon */}
      <svg
        style={{
          position: 'absolute', top: '15%', left: '10%',
          width: 80, height: 80, color: 'var(--c-text)',
          animation: 'float 12s ease-in-out infinite',
          willChange: 'transform'
        }}
        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
      >
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>

      {/* Bitcoin */}
      <svg
        style={{
          position: 'absolute', top: '25%', right: '15%',
          width: 100, height: 100, color: '#F7931A',
          animation: 'float 14s ease-in-out infinite reverse',
          willChange: 'transform'
        }}
        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
      >
        <path d="M11.75 3.5V6M15.25 3.5V6M8 8h9.5A3.5 3.5 0 0 1 17.5 11.5A3.5 3.5 0 0 1 14.5 15H8V8z" />
        <path d="M14.5 15h1a4 4 0 0 1 4 4 4 4 0 0 1-4 4H8v-7" />
        <path d="M8 6h-3" />
        <path d="M11.75 20v2.5M15.25 20v2.5" />
      </svg>

      {/* Ethereum */}
      <svg
        style={{
          position: 'absolute', bottom: '20%', left: '18%',
          width: 90, height: 90, color: '#627EEA',
          animation: 'float 15s ease-in-out infinite 2s',
          willChange: 'transform'
        }}
        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"
      >
        <path d="M12 2L6 13l6 3 6-3-6-11z" />
        <path d="M12 22l-6-8 6 3 6-3-6 8z" />
      </svg>

      {/* Multi-chain node network */}
      <svg
        style={{
          position: 'absolute', bottom: '25%', right: '10%',
          width: 110, height: 110, color: 'var(--c-primary)',
          animation: 'float 18s ease-in-out infinite alternate 1s',
          willChange: 'transform'
        }}
        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"
      >
        <circle cx="6" cy="6" r="3" />
        <circle cx="18" cy="18" r="3" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="6" r="3" />
        <path d="M8.5 8.5l7 7M15.5 8.5l-7 7M6 9v6M18 9v6M9 6h6M9 18h6" />
      </svg>

      {/* Shield / Trust */}
      <svg
        style={{
          position: 'absolute', top: '55%', left: '5%',
          width: 70, height: 70, color: 'var(--c-secondary)',
          animation: 'float 13s ease-in-out infinite 3s',
          willChange: 'transform'
        }}
        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"
      >
        <path d="M12 2L3 7v5c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V7l-9-5z" />
        <path d="M9 12l2 2 4-4" />
      </svg>

      {/* Hexagonal / diamond */}
      <svg
        style={{
          position: 'absolute', top: '8%', left: '45%',
          width: 65, height: 65, color: 'var(--c-accent)',
          animation: 'float 20s ease-in-out infinite reverse 1.5s',
          willChange: 'transform'
        }}
        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.1"
      >
        <path d="M12 2l4 7H8l4-7zM8 9l-4 7h16l-4-7H8zM8 16l4 7 4-7H8z" />
      </svg>

      {/* Orbit rings */}
      <svg
        style={{
          position: 'absolute', bottom: '8%', right: '35%',
          width: 75, height: 75, color: 'var(--c-primary)',
          animation: 'float 17s ease-in-out infinite 4s',
          willChange: 'transform'
        }}
        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"
      >
        <circle cx="12" cy="12" r="3" />
        <ellipse cx="12" cy="12" rx="10" ry="4" />
        <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" />
        <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" />
      </svg>

      {/* Fingerprint / identity */}
      <svg
        style={{
          position: 'absolute', top: '40%', right: '4%',
          width: 85, height: 85, color: '#C8E023',
          animation: 'float 16s ease-in-out infinite alternate 2.5s',
          willChange: 'transform'
        }}
        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.1"
      >
        <path d="M12 11c0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2" />
        <path d="M17.5 11c0-3-2.5-5.5-5.5-5.5S6.5 8 6.5 11c0 2 .8 3.8 2 5" />
        <path d="M21 11c0-5-4-9-9-9S3 6 3 11c0 3.4 1.7 6.4 4.3 8.2" />
        <path d="M12 11v6" />
        <path d="M15 14c0 1.7-1.3 3-3 3" />
      </svg>
    </div>
  );
}
