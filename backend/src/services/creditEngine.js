const db = require('../db');
const { v4: uuidv4 } = require('uuid');

/**
 * TrustChain Credit Scoring Engine v1
 * Final Score (0-1000) = 0.4 * T + 0.4 * B + 0.2 * A
 */

function computeTrustScore(pubKey) {
  const attestations = [...db.attestations.values()].filter(a => a.toUserId === pubKey);
  if (attestations.length === 0) return 0;

  let score = 0;
  for (const att of attestations) {
    const attesterScore = db.scores.get(att.fromUserId);
    const attesterTotal = attesterScore ? attesterScore.totalScore : 300;
    const normalizedAttesterScore = attesterTotal / 1000;
    const timeBonus = att.timeBonus || 0;
    const credBonus = att.credibilityBonus || 0;
    score += att.weight * normalizedAttesterScore * (1 + timeBonus + credBonus);
  }

  return Math.min(1000, Math.round(score * 400)); // Scale to 0-400 (40% weight)
}

function computeBehaviorScore(pubKey) {
  const loans = [...db.loans.values()].filter(l => l.borrowerId === pubKey);
  if (loans.length === 0) return 200; // Baseline for new users

  const repaid = loans.filter(l => l.status === 'REPAID');
  const defaulted = loans.filter(l => l.status === 'DEFAULTED');
  const overdue = loans.filter(l => l.status === 'OVERDUE');

  const onTimeRate = loans.length > 0 ? repaid.length / loans.length : 0;
  let score = Math.round(onTimeRate * 320);
  score -= defaulted.length * 80;
  score -= overdue.length * 20;
  score = Math.max(0, Math.min(400, score)); // Scale to 0-400 (40% weight)

  return score;
}

function computeActivityScore(pubKey) {
  const user = db.users.get(pubKey);
  if (!user) return 0;

  const createdAt = new Date(user.createdAt);
  const walletAgeDays = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

  const userCircles = [...db.circles.values()].filter(c =>
    c.members && c.members.includes(pubKey)
  );
  const attestationsGiven = [...db.attestations.values()].filter(a => a.fromUserId === pubKey);

  let score = 0;
  score += Math.min(80, walletAgeDays * 0.5);          // wallet age: up to 80
  score += Math.min(60, userCircles.length * 20);       // circles: up to 60
  score += Math.min(60, attestationsGiven.length * 10); // attestations: up to 60

  return Math.round(Math.min(200, score)); // Scale to 0-200 (20% weight)
}

function computeScore(pubKey) {
  const T = computeTrustScore(pubKey);
  const B = computeBehaviorScore(pubKey);
  const A = computeActivityScore(pubKey);
  const total = Math.min(1000, T + B + A);

  const tier = getTier(total);

  const scoreEntry = {
    id: uuidv4(),
    userId: pubKey,
    totalScore: total,
    trustScore: T,
    behaviorScore: B,
    activityScore: A,
    tier,
    computedAt: new Date().toISOString(),
    version: (db.scores.get(pubKey)?.version || 0) + 1,
  };

  db.scores.set(pubKey, scoreEntry);
  return scoreEntry;
}

function getTier(score) {
  if (score >= 900) return 'platinum';
  if (score >= 750) return 'gold';
  if (score >= 600) return 'silver';
  if (score >= 450) return 'bronze';
  if (score >= 300) return 'building';
  return 'establishing';
}

function recalculateCircleMemberScores(circleId) {
  const circle = db.circles.get(circleId);
  if (!circle) return;
  circle.members.forEach(m => computeScore(m));
}

module.exports = { computeScore, getTier, recalculateCircleMemberScores };
