'use client';
import { useEffect, useState } from 'react';

const TIER_CONFIG: Record<string, { color: string; label: string; emoji: string; glow: string }> = {
  platinum:    { color: '#A78BFA', label: 'Platinum',    emoji: '💎', glow: 'rgba(167,139,250,0.4)' },
  gold:        { color: '#F59E0B', label: 'Gold',        emoji: '🥇', glow: 'rgba(245,158,11,0.4)'  },
  silver:      { color: '#94A3B8', label: 'Silver',      emoji: '🥈', glow: 'rgba(148,163,184,0.4)' },
  bronze:      { color: '#D97706', label: 'Bronze',      emoji: '🥉', glow: 'rgba(217,119,6,0.4)'   },
  building:    { color: '#F97316', label: 'Building',    emoji: '🏗️', glow: 'rgba(249,115,22,0.4)'  },
  establishing:{ color: '#EF4444', label: 'Establishing',emoji: '🌱', glow: 'rgba(239,68,68,0.4)'   },
};

interface ScoreGaugeProps {
  totalScore: number;
  trustScore: number;
  behaviorScore: number;
  activityScore: number;
  tier: string;
  size?: 'sm' | 'md' | 'lg';
}

const BARS = [
  { key: 'trust',    label: 'Trust Score',    max: 400, color: '#6C63FF', bg: 'rgba(108,99,255,0.08)' },
  { key: 'behavior', label: 'Behavior Score', max: 400, color: '#00D9A6', bg: 'rgba(0,217,166,0.08)'  },
  { key: 'activity', label: 'Activity Score', max: 200, color: '#FFB347', bg: 'rgba(255,179,71,0.08)' },
];

export default function ScoreGauge({ totalScore, trustScore, behaviorScore, activityScore, tier, size = 'md' }: ScoreGaugeProps) {
  const [animate, setAnimate] = useState(false);
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    setTimeout(() => setAnimate(true), 100);
    // Count-up animation
    const duration = 1200;
    const steps = 60;
    const step = totalScore / steps;
    let current = 0;
    const interval = setInterval(() => {
      current = Math.min(current + step, totalScore);
      setDisplayScore(Math.round(current));
      if (current >= totalScore) clearInterval(interval);
    }, duration / steps);
    return () => clearInterval(interval);
  }, [totalScore]);

  const cfg = TIER_CONFIG[tier] || TIER_CONFIG.establishing;

  const R   = size === 'lg' ? 96 : size === 'md' ? 76 : 56;
  const SW  = size === 'lg' ? 10  : 8;
  const SVG = (R + SW + 6) * 2;
  const C   = SVG / 2;
  const circ = 2 * Math.PI * R;
  const ARC  = circ * 0.75; // 270° arc
  const OFFSET = circ * 0.125; // start at 7 o'clock (135° = 225° from top)

  const filled = animate ? (totalScore / 1000) * ARC : 0;

  const vals: Record<string, number> = {
    trust: trustScore, behavior: behaviorScore, activity: activityScore,
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Gauge */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24, position: 'relative' }}>
        {/* Glow behind gauge */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          width: R * 2 + 20, height: R * 2 + 20,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${cfg.glow} 0%, transparent 70%)`,
          opacity: animate ? 1 : 0,
          transition: 'opacity 0.8s ease',
          pointerEvents: 'none',
        }} />

        <svg width={SVG} height={SVG * 0.8} viewBox={`0 0 ${SVG} ${SVG}`} style={{ overflow: 'visible', display: 'block' }}>
          <defs>
            <linearGradient id="scoreArcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6C63FF" />
              <stop offset="50%" stopColor="#A855F7" />
              <stop offset="100%" stopColor={cfg.color} />
            </linearGradient>
            <filter id="scoreGlow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* BG track */}
          <circle
            cx={C} cy={C} r={R}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={SW}
            strokeDasharray={`${ARC} ${circ - ARC}`}
            strokeDashoffset={-OFFSET}
            strokeLinecap="round"
            transform={`rotate(135, ${C}, ${C})`}
          />

          {/* Filled arc */}
          <circle
            cx={C} cy={C} r={R}
            fill="none"
            stroke="url(#scoreArcGrad)"
            strokeWidth={SW}
            strokeDasharray={`${filled} ${circ - filled}`}
            strokeDashoffset={-OFFSET}
            strokeLinecap="round"
            transform={`rotate(135, ${C}, ${C})`}
            filter="url(#scoreGlow)"
            style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.4,0,0.2,1)' }}
          />

          {/* Center: score number */}
          <text x={C} y={C - 12} textAnchor="middle"
            fill={cfg.color}
            fontSize={size === 'lg' ? 40 : 30}
            fontWeight="900"
            fontFamily="'Space Grotesk', sans-serif"
            style={{ filter: `drop-shadow(0 0 8px ${cfg.glow})` }}
          >
            {displayScore}
          </text>

          {/* / 1000 */}
          <text x={C} y={C + 12} textAnchor="middle"
            fill="rgba(255,255,255,0.2)"
            fontSize={11} fontWeight="500"
            fontFamily="'JetBrains Mono', monospace"
          >/ 1000</text>

          {/* Tier */}
          <text x={C} y={C + 32} textAnchor="middle"
            fill={cfg.color}
            fontSize={13} fontWeight="700"
            fontFamily="'Space Grotesk', sans-serif"
          >
            {cfg.emoji} {cfg.label}
          </text>
        </svg>
      </div>

      {/* Score breakdown bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {BARS.map(bar => {
          const val = vals[bar.key];
          const pct = Math.min(100, (val / bar.max) * 100);
          return (
            <div key={bar.key} style={{ padding: '14px 16px', background: bar.bg, border: `1px solid ${bar.color}20`, borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--c-text-2)' }}>{bar.label}</span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--c-text-3)', marginLeft: 4 }}>(T)</span>
                </div>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '0.9rem', color: bar.color }}>
                  {val}
                  <span style={{ fontWeight: 400, fontSize: '0.72rem', color: 'var(--c-text-3)', marginLeft: 2 }}>/{bar.max}</span>
                </div>
              </div>
              <div className="progress-bar" style={{ height: 5 }}>
                <div className="progress-fill" style={{
                  width: `${animate ? pct : 0}%`,
                  background: bar.color,
                  boxShadow: `0 0 8px ${bar.color}80`,
                  transition: 'width 1s cubic-bezier(0.4,0,0.2,1)',
                }} />
              </div>
              <div style={{ textAlign: 'right', marginTop: 4, fontSize: '0.68rem', color: 'var(--c-text-3)' }}>
                {Math.round(pct)}% of max
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
