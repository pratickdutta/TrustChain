import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { PoolPayout } from '@/lib/models';
import { requireAuth, unauthorized } from '@/lib/apiAuth';

// GET /api/pools/payouts — get current user's payout history
export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth) return unauthorized();

  await connectDB();
  const payouts = await PoolPayout.find({ userId: auth.pubKey }).sort({ createdAt: -1 });
  return NextResponse.json(payouts);
}
