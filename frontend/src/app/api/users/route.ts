import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User, Score, Circle } from '@/lib/models';
import { getAuthPayload } from '@/lib/apiAuth';

// GET /api/users — leaderboard
export async function GET(req: NextRequest) {
  await connectDB();
  const filter = req.nextUrl.searchParams.get('filter');
  const auth = getAuthPayload(req);

  let pubKeysFilter: string[] | null = null;

  if (filter === 'my-circles' && auth?.pubKey) {
    const circles = await Circle.find({ members: auth.pubKey });
    const memberSet = new Set<string>();
    circles.forEach(c => c.members.forEach((m: string) => memberSet.add(m)));
    pubKeysFilter = Array.from(memberSet);
  }

  const query = pubKeysFilter ? { stellarPublicKey: { $in: pubKeysFilter } } : {};
  const users = await User.find(query).limit(50).lean();

  const withScores = await Promise.all(users.map(async u => {
    const score = await Score.findOne({ userId: u.stellarPublicKey }).lean();
    return {
      stellarPublicKey: u.stellarPublicKey,
      displayName: u.displayName,
      score: score ? { totalScore: (score as any).totalScore, tier: (score as any).tier } : null,
      createdAt: u.createdAt,
    };
  }));

  withScores.sort((a, b) => (b.score?.totalScore || 0) - (a.score?.totalScore || 0));
  return NextResponse.json(withScores);
}
