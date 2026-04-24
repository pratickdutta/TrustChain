import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Circle, PoolDeposit } from '@/lib/models';
import { requireAuth, unauthorized } from '@/lib/apiAuth';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req);
  if (!auth) return unauthorized();
  const { id } = await params;

  const { amount } = await req.json();
  if (!amount || amount <= 0) return NextResponse.json({ error: 'Valid amount required' }, { status: 400 });

  await connectDB();
  const circle = await Circle.findById(id);
  if (!circle) return NextResponse.json({ error: 'Circle not found' }, { status: 404 });

  // Calculate user's current total deposit
  const deposits = await PoolDeposit.find({ userId: auth.pubKey, circleId: id });
  const userTotal = deposits.reduce((sum, d) => sum + d.amount, 0);

  if (amount > userTotal) {
    return NextResponse.json({ error: 'Insufficient deposited balance' }, { status: 400 });
  }

  if (amount > circle.poolBalance) {
    return NextResponse.json({ error: 'Insufficient pool liquidity (funds may be locked in active loans)' }, { status: 400 });
  }

  // Create a negative deposit record to track withdrawal
  await PoolDeposit.create({
    userId: auth.pubKey,
    circleId: id,
    amount: -parseFloat(amount),
  });

  circle.poolBalance = (circle.poolBalance || 0) - parseFloat(amount);
  await circle.save();

  return NextResponse.json({ success: true, newBalance: circle.poolBalance, userRemaining: userTotal - amount });
}
