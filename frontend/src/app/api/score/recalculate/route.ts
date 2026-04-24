import { NextRequest, NextResponse } from 'next/server';
import { computeScore } from '@/lib/creditEngine';
import { requireAuth, unauthorized } from '@/lib/apiAuth';
import { connectDB } from '@/lib/mongodb';

// POST /api/score/recalculate
export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth) return unauthorized();

  await connectDB();
  const score = await computeScore(auth.pubKey);
  return NextResponse.json(score);
}
