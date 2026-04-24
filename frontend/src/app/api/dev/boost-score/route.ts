import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User, Score } from '@/lib/models';
import { computeScore } from '@/lib/creditEngine';
import { requireAuth, unauthorized } from '@/lib/apiAuth';

// POST /api/dev/boost-score — DEV ONLY
export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth) return unauthorized();

  const ADMIN_PUBKEY = 'GAXY2BE75O3RAWQI3JJBDSNARQZTZE2C32IMGGNJFMZAUARTDVNTMGMT';
  if (auth.pubKey !== ADMIN_PUBKEY) {
    return NextResponse.json({ error: 'Not authorized for dev privileges' }, { status: 403 });
  }

  await connectDB();
  await Score.findOneAndUpdate(
    { userId: auth.pubKey },
    { totalScore: 800, trustScore: 300, behaviorScore: 300, activityScore: 200, tier: 'gold' },
    { upsert: true, new: true }
  );
  const score = await computeScore(auth.pubKey);
  return NextResponse.json({ message: 'Score boosted to 800', score });
}
