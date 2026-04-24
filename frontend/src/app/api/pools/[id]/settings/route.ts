import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Circle, PoolDeposit, PoolPayout, Loan } from '@/lib/models';
import { requireAuth, unauthorized } from '@/lib/apiAuth';

// PUT /api/pools/[id]/settings
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req);
  if (!auth) return unauthorized();
  const { id } = await params;

  await connectDB();
  const circle = await Circle.findById(id);
  if (!circle) return NextResponse.json({ error: 'Circle not found' }, { status: 404 });
  if (circle.creatorId !== auth.pubKey) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  const body = await req.json();
  const update: any = { isPool: true };
  if (body.openToOutside !== undefined) update.poolOpenToOutside = body.openToOutside;
  if (body.manualApproval !== undefined) update.poolManualApproval = body.manualApproval;
  if (body.minBorrowerScore !== undefined) update.poolMinBorrowerScore = body.minBorrowerScore;
  if (body.maxLoanPerBorrower !== undefined) update.poolMaxLoanPerBorrower = body.maxLoanPerBorrower;

  const updated = await Circle.findByIdAndUpdate(id, { $set: update }, { new: true });
  return NextResponse.json(updated);
}

// DELETE /api/pools/[id]/settings — dissolve the MoneyPool, distribute capital + interest to depositors
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req);
  if (!auth) return unauthorized();
  const { id } = await params;

  await connectDB();
  const circle = await Circle.findById(id);
  if (!circle) return NextResponse.json({ error: 'Circle not found' }, { status: 404 });
  if (circle.creatorId !== auth.pubKey) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  // Block dissolution if there are active/pending loans funded by this pool
  const activeLoans = await Loan.find({
    poolId: id,
    status: { $in: ['APPROVED', 'DISBURSED', 'REPAYING', 'PENDING_POOL'] },
  });
  if (activeLoans.length > 0) {
    return NextResponse.json(
      { error: `Cannot dissolve pool while ${activeLoans.length} loan(s) are still active. Wait for all loans to be repaid or defaulted.` },
      { status: 400 }
    );
  }

  // ── Calculate total interest earned by the pool ──────────────────────────
  // Interest = sum of all repaid loan amounts – sum of principal advanced from this pool
  const repaidLoans = await Loan.find({ poolId: id, status: 'REPAID' });
  let totalPrincipalLent = 0;
  let totalRepaid = 0;
  for (const loan of repaidLoans) {
    totalPrincipalLent += loan.amount;
    totalRepaid += loan.repaidAmount;
  }
  const totalInterestEarned = Math.max(0, totalRepaid - totalPrincipalLent);

  // ── Aggregate each depositor's net balance ───────────────────────────────
  const deposits = await PoolDeposit.find({ circleId: id });
  const userTotals: Record<string, number> = {};
  for (const d of deposits) {
    userTotals[d.userId] = (userTotals[d.userId] || 0) + d.amount;
  }

  // Total deposited across all users (net of any prior withdrawals)
  const grandTotal = Object.values(userTotals).reduce((s, v) => s + v, 0);

  // ── Build payout records ─────────────────────────────────────────────────
  const payouts: Array<{
    userId: string;
    principal: number;
    interest: number;
    total: number;
  }> = [];

  if (grandTotal > 0) {
    for (const [userId, principal] of Object.entries(userTotals)) {
      if (principal <= 0) continue; // skip users who withdrew everything
      const share = principal / grandTotal; // proportional share
      const interestShare = parseFloat((totalInterestEarned * share).toFixed(4));
      const totalPayout = parseFloat((principal + interestShare).toFixed(4));

      payouts.push({ userId, principal, interest: interestShare, total: totalPayout });

      // Persist the payout record so each user can see it in their history
      await PoolPayout.create({
        userId,
        circleId: id,
        circleName: circle.name,
        principal,
        interest: interestShare,
        total: totalPayout,
      });
    }
  }

  // ── Dissolve the pool ────────────────────────────────────────────────────
  // Zero the balance, clear the isPool flag, and wipe deposit ledger
  await PoolDeposit.deleteMany({ circleId: id });
  await Circle.findByIdAndUpdate(id, {
    $set: { isPool: false, poolBalance: 0 },
  });

  return NextResponse.json({
    success: true,
    message: `MoneyPool dissolved. ${payouts.length} lender(s) paid out.`,
    totalInterestEarned,
    payouts,
  });
}
