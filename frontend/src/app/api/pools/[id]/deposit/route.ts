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
  if (!circle.isPool) return NextResponse.json({ error: 'This circle is not a MoneyPool' }, { status: 400 });

  // In a real app, this would trigger a Stellar transfer to the pool's escrow wallet.
  // For now, we update the virtual balance.
  
  await PoolDeposit.create({
    userId: auth.pubKey,
    circleId: id,
    amount: parseFloat(amount),
  });

  circle.poolBalance = (circle.poolBalance || 0) + parseFloat(amount);
  await circle.save();

  return NextResponse.json({ success: true, newBalance: circle.poolBalance });
}

// GET /api/pools/[id]/deposit — get user's deposit in this pool
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req);
  if (!auth) return unauthorized();
  const { id } = await params;

  await connectDB();
  const deposits = await PoolDeposit.find({ userId: auth.pubKey, circleId: id });
  const total = deposits.reduce((sum, d) => sum + d.amount, 0);

  return NextResponse.json({ total, deposits });
}
