import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Circle, User, Score, Attestation } from '@/lib/models';
import { computeScore, recalculateCircleMemberScores } from '@/lib/creditEngine';
import { requireAuth, unauthorized } from '@/lib/apiAuth';

// GET /api/circles/[id]
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req);
  if (!auth) return unauthorized();
  const { id } = await params;

  await connectDB();
  const circle = await Circle.findById(id);
  if (!circle) return NextResponse.json({ error: 'Circle not found' }, { status: 404 });

  const enrichedMembers = await Promise.all(circle.members.map(async (pubKey: string) => {
    const user = await User.findOne({ stellarPublicKey: pubKey });
    const score = await Score.findOne({ userId: pubKey });
    const attestCount = await Attestation.countDocuments({ toUserId: pubKey, circleId: id });
    return {
      stellarPublicKey: pubKey,
      displayName: user?.displayName || pubKey.slice(0, 8) + '...',
      score: score?.totalScore || 0,
      tier: score?.tier || 'establishing',
      role: pubKey === circle.creatorId ? 'creator' : 'member',
      attestationCount: attestCount,
    };
  }));

  return NextResponse.json({ ...circle.toObject(), enrichedMembers });
}
