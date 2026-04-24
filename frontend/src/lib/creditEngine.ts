import { connectDB } from './mongodb';
import { User, Score, Circle, Loan, Attestation } from './models';

function getTier(score: number): string {
  if (score >= 900) return 'platinum';
  if (score >= 750) return 'gold';
  if (score >= 600) return 'silver';
  if (score >= 450) return 'bronze';
  if (score >= 300) return 'building';
  return 'establishing';
}

async function computeTrustScore(pubKey: string): Promise<number> {
  const attestations = await Attestation.find({ toUserId: pubKey });
  if (attestations.length === 0) return 0;

  let score = 0;
  for (const att of attestations) {
    const attesterScore = await Score.findOne({ userId: att.fromUserId });
    const attesterTotal = attesterScore ? attesterScore.totalScore : 300;
    const normalized = attesterTotal / 1000;
    const timeBonus = att.timeBonus || 0;
    const credBonus = att.credibilityBonus || 0;
    score += att.weight * normalized * (1 + timeBonus + credBonus);
  }
  return Math.min(1000, Math.round(score * 400));
}

async function computeBehaviorScore(pubKey: string): Promise<number> {
  const loans = await Loan.find({ borrowerId: pubKey });
  if (loans.length === 0) return 200;

  const repaid = loans.filter(l => l.status === 'REPAID').length;
  const defaulted = loans.filter(l => l.status === 'DEFAULTED').length;
  const overdue = loans.filter(l => l.status === 'OVERDUE').length;

  const onTimeRate = repaid / loans.length;
  let score = Math.round(onTimeRate * 320);
  score -= defaulted * 80;
  score -= overdue * 20;
  return Math.max(0, Math.min(400, score));
}

async function computeActivityScore(pubKey: string): Promise<number> {
  const user = await User.findOne({ stellarPublicKey: pubKey });
  if (!user) return 0;

  const walletAgeDays = Math.floor((Date.now() - new Date(user.createdAt).getTime()) / 86400000);
  const circleCount = await Circle.countDocuments({ members: pubKey });
  const attestationsGiven = await Attestation.countDocuments({ fromUserId: pubKey });

  let score = 0;
  score += Math.min(80, walletAgeDays * 0.5);
  score += Math.min(60, circleCount * 20);
  score += Math.min(60, attestationsGiven * 10);
  return Math.round(Math.min(200, score));
}

export async function computeScore(pubKey: string) {
  await connectDB();

  const T = await computeTrustScore(pubKey);
  const B = await computeBehaviorScore(pubKey);
  const A = await computeActivityScore(pubKey);
  const total = Math.min(1000, T + B + A);
  const tier = getTier(total);

  const existing = await Score.findOne({ userId: pubKey });
  const version = (existing?.version || 0) + 1;

  const scoreEntry = await Score.findOneAndUpdate(
    { userId: pubKey },
    { totalScore: total, trustScore: T, behaviorScore: B, activityScore: A, tier, computedAt: new Date(), version },
    { upsert: true, new: true }
  );

  return scoreEntry;
}

export async function recalculateCircleMemberScores(circleId: string) {
  const circle = await Circle.findById(circleId);
  if (!circle) return;
  await Promise.all(circle.members.map((m: string) => computeScore(m)));
}

export { getTier };
