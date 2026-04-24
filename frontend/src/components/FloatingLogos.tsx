'use client';

export default function FloatingLogos() {
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: 0.15, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      {/* Stellar Logo */}
      <svg
        style={{
          position: 'absolute', top: '15%', left: '10%',
          width: 80, height: 80, color: 'var(--c-text)',
          animation: 'float 12s ease-in-out infinite'
        }}
        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
      >
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>

      {/* Bitcoin Logo */}
      <svg
        style={{
          position: 'absolute', top: '25%', right: '15%',
          width: 100, height: 100, color: '#F7931A',
          animation: 'float 14s ease-in-out infinite reverse'
        }}
        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
      >
        <path d="M11.75 3.5V6M15.25 3.5V6M8 8h9.5A3.5 3.5 0 0 1 17.5 11.5A3.5 3.5 0 0 1 14.5 15H8V8z" />
        <path d="M14.5 15h1a4 4 0 0 1 4 4 4 4 0 0 1-4 4H8v-7" />
        <path d="M8 6h-3" />
        <path d="M11.75 20v2.5M15.25 20v2.5" />
      </svg>

      {/* Ethereum Logo */}
      <svg
        style={{
          position: 'absolute', bottom: '20%', left: '18%',
          width: 90, height: 90, color: '#627EEA',
          animation: 'float 15s ease-in-out infinite 2s'
        }}
        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"
      >
        <path d="M12 2L6 13l6 3 6-3-6-11z" />
        <path d="M12 22l-6-8 6 3 6-3-6 8z" />
      </svg>

      {/* Generic Multi-chain Chain Node */}
      <svg
        style={{
          position: 'absolute', bottom: '25%', right: '10%',
          width: 110, height: 110, color: 'var(--c-primary)',
          animation: 'float 18s ease-in-out infinite alternate 1s'
        }}
        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"
      >
        <circle cx="6" cy="6" r="3" />
        <circle cx="18" cy="18" r="3" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="6" r="3" />
        <path d="M8.5 8.5l7 7M15.5 8.5l-7 7M6 9v6M18 9v6M9 6h6M9 18h6" />
      </svg>
    </div>
  );
}
