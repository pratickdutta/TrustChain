import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User, Score, Circle } from '@/lib/models';

// GET /api/users/[pubKey]
export async function GET(req: NextRequest, { params }: { params: Promise<{ pubKey: string }> }) {
  const { pubKey } = await params;
  await connectDB();

  const user = await User.findOne({ stellarPublicKey: pubKey });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const score = await Score.findOne({ userId: pubKey });
  const circleCount = await Circle.countDocuments({ members: pubKey });

  return NextResponse.json({
    stellarPublicKey: user.stellarPublicKey,
    displayName: user.displayName,
    createdAt: user.createdAt,
    score: score ? { totalScore: score.totalScore, tier: score.tier } : null,
    circleCount,
  });
}
