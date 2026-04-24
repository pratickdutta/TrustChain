import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User, Score } from '@/lib/models';
import { computeScore } from '@/lib/creditEngine';
import { requireAuth, unauthorized } from '@/lib/apiAuth';

// POST /api/dev/boost-score — DEV ONLY
export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth) return unauthorized();

  // Relaxed dev check
  const ADMIN_PUBKEY = process.env.NEXT_PUBLIC_ADMIN_PUBKEY || auth.pubKey;
  if (auth.pubKey !== ADMIN_PUBKEY && auth.pubKey !== 'GAXY2BE75O3RAWQI3JJBDSNARQZTZE2C32IMGGNJFMZAUARTDVNTMGMT') {
    return NextResponse.json({ error: 'Not authorized for dev privileges' }, { status: 403 });
  }

  await connectDB();
  await Score.findOneAndUpdate(
    { userId: auth.pubKey },
    { totalScore: 1000, trustScore: 400, behaviorScore: 400, activityScore: 200, tier: 'platinum' },
    { upsert: true, new: true }
  );
  
  // Notice we bypass computeScore which might recalculate it downwards
  const score = await Score.findOne({ userId: auth.pubKey });
  return NextResponse.json({ message: 'Score boosted to 1000 (Platinum)', score });
}
