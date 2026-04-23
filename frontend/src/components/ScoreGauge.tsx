'use client';

const TIER_CONFIG: Record<string, { color: string; label: string; emoji: string }> = {
  platinum:    { color: '#818CF8', label: 'Platinum', emoji: '💎' },
  gold:        { color: '#F59E0B', label: 'Gold',     emoji: '🥇' },
  silver:      { color: '#94A3B8', label: 'Silver',   emoji: '🥈' },
  bronze:      { color: '#D97706', label: 'Bronze',   emoji: '🥉' },
  building:    { color: '#F97316', label: 'Building', emoji: '🏗️' },
  establishing:{ color: '#EF4444', label: 'Establishing', emoji: '🌱' },
};

interface ScoreGaugeProps {
  totalScore: number;
  trustScore: number;
  behaviorScore: number;
  activityScore: number;
  tier: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function ScoreGauge({ totalScore, trustScore, behaviorScore, activityScore, tier, size = 'md' }: ScoreGaugeProps) {
  const cfg = TIER_CONFIG[tier] || TIER_CONFIG.establishing;
  const radius = size === 'lg' ? 90 : size === 'md' ? 70 : 50;
  const strokeWidth = size === 'lg' ? 10 : 8;
  const svgSize = (radius + strokeWidth + 4) * 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (totalScore / 1000) * circumference;
  const gap = circumference * 0.25; // 25% gap at bottom

  const bars = [
    { label: 'Trust (T)', value: trustScore, max: 400, color: '#6C63FF' },
    { label: 'Behavior (B)', value: behaviorScore, max: 400, color: '#00D9A6' },
    { label: 'Activity (A)', value: activityScore, max: 200, color: '#FFB347' },
  ];

  return (
    <div style={{ width: '100%' }}>
      {/* Gauge */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
        <svg width={svgSize} height={svgSize * 0.8} viewBox={`0 0 ${svgSize} ${svgSize}`} style={{ overflow: 'visible' }}>
          {/* Background arc */}
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference - gap} ${gap}`}
            strokeDashoffset={gap / 2}
            strokeLinecap="round"
            transform={`rotate(135, ${svgSize / 2}, ${svgSize / 2})`}
          />
          {/* Progress arc */}
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            fill="none"
            stroke="url(#scoreGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={`${progress * 0.75} ${circumference}`}
            strokeDashoffset={gap / 2}
            strokeLinecap="round"
            transform={`rotate(135, ${svgSize / 2}, ${svgSize / 2})`}
            style={{ transition: 'stroke-dasharray 1s ease' }}
          />
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6C63FF" />
              <stop offset="100%" stopColor="#00D9A6" />
            </linearGradient>
          </defs>
          {/* Center text */}
          <text
            x={svgSize / 2}
            y={svgSize / 2 - 8}
            textAnchor="middle"
            fill={cfg.color}
            fontSize={size === 'lg' ? 36 : 28}
            fontWeight="800"
            fontFamily="Space Grotesk, sans-serif"
          >
            {totalScore}
          </text>
          <text
            x={svgSize / 2}
            y={svgSize / 2 + 16}
            textAnchor="middle"
            fill="#9899A8"
            fontSize={12}
            fontWeight="500"
          >
            / 1000
          </text>
          <text
            x={svgSize / 2}
            y={svgSize / 2 + 34}
            textAnchor="middle"
            fill={cfg.color}
            fontSize={13}
            fontWeight="600"
          >
            {cfg.emoji} {cfg.label}
          </text>
        </svg>
      </div>

      {/* Score breakdowns */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {bars.map(bar => (
          <div key={bar.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>{bar.label}</span>
              <span style={{ color: bar.color, fontWeight: 700 }}>{bar.value} <span style={{ color: 'var(--color-muted)' }}>/ {bar.max}</span></span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${(bar.value / bar.max) * 100}%`,
                  background: bar.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
