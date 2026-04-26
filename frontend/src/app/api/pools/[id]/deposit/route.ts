import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Circle, PoolDeposit, Loan } from '@/lib/models';
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

// GET /api/pools/[id]/deposit — get user's deposit and estimated interest in this pool
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req);
  if (!auth) return unauthorized();
  const { id } = await params;

  await connectDB();
  
  // Get user's deposits
  const deposits = await PoolDeposit.find({ userId: auth.pubKey, circleId: id });
  const userTotal = deposits.reduce((sum, d) => sum + d.amount, 0);

  // Get total pool deposits to calculate share
  const allDeposits = await PoolDeposit.find({ circleId: id });
  const poolGrandTotal = allDeposits.reduce((sum, d) => sum + d.amount, 0);

  // Calculate total interest earned by the pool so far from repaid loans
  const repaidLoans = await Loan.find({ poolId: id, status: 'REPAID' });
  let poolTotalInterest = 0;
  for (const loan of repaidLoans) {
    // Interest earned per loan = repaid amount - principal lent
    poolTotalInterest += Math.max(0, (loan.repaidAmount || 0) - loan.amount);
  }

  // Calculate user's share of interest
  let accruedInterest = 0;
  if (poolGrandTotal > 0 && userTotal > 0) {
    const share = userTotal / poolGrandTotal;
    accruedInterest = parseFloat((poolTotalInterest * share).toFixed(4));
  }

  return NextResponse.json({ 
    total: userTotal, 
    accruedInterest,
    deposits 
  });
}
