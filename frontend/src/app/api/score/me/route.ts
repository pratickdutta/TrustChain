import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Score } from '@/lib/models';
import { computeScore } from '@/lib/creditEngine';
import { requireAuth, unauthorized } from '@/lib/apiAuth';

// GET /api/score/me
export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth) return unauthorized();

  await connectDB();
  const score = await Score.findOne({ userId: auth.pubKey });
  if (!score) return NextResponse.json({ error: 'Score not found' }, { status: 404 });
  return NextResponse.json(score);
}
