import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Loan, User, Score } from '@/lib/models';
import { computeScore } from '@/lib/creditEngine';
import { requireAuth, unauthorized } from '@/lib/apiAuth';

const LOAN_TIERS: Record<string, any> = {
  establishing: { canBorrow: false },
  building:     { canBorrow: false },
  bronze:   { canBorrow: true, maxAmount: 50,   durationDays: 14,  feePercent: 2 },
  silver:   { canBorrow: true, maxAmount: 200,  durationDays: 30,  feePercent: 1.5 },
  gold:     { canBorrow: true, maxAmount: 1000, durationDays: 90,  feePercent: 1 },
  platinum: { canBorrow: true, maxAmount: 5000, durationDays: 180, feePercent: 0.5 },
};

// GET /api/loans
export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth) return unauthorized();
  await connectDB();
  const loans = await Loan.find({ borrowerId: auth.pubKey }).sort({ createdAt: -1 });
  return NextResponse.json(loans);
}

// POST /api/loans
export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth) return unauthorized();

  const { amount, currency, durationDays, purpose, fundingSource, lenderKey, poolId } = await req.json();
  if (!amount || !purpose) return NextResponse.json({ error: 'amount and purpose are required' }, { status: 400 });

  await connectDB();
  const score = await Score.findOne({ userId: auth.pubKey });
  if (!score) return NextResponse.json({ error: 'Credit score not computed yet' }, { status: 400 });

  let tier = LOAN_TIERS[score.tier];
  
  // TEMPORARY FOR HACKATHON: Allow anyone >= 150 to borrow as if they were Bronze
  if (score.totalScore >= 150 && !tier?.canBorrow) {
    tier = LOAN_TIERS['bronze'];
  }

  if (!tier?.canBorrow) {
    return NextResponse.json({
      error: `Credit score too low. Need at least 150. Current: ${score.totalScore}`,
      currentScore: score.totalScore,
      requiredScore: 150,
    }, { status: 400 });
  }

  if (amount > tier.maxAmount) {
    return NextResponse.json({ error: `Loan amount exceeds tier limit of $${tier.maxAmount}` }, { status: 400 });
  }

  const existingLoan = await Loan.findOne({
    borrowerId: auth.pubKey,
    status: { $in: ['DISBURSED', 'REPAYING', 'APPROVED', 'PENDING_LENDER', 'PENDING_POOL'] },
  });
  if (existingLoan) return NextResponse.json({ error: 'You already have an active or pending loan.' }, { status: 400 });

  const source = fundingSource || 'defi';
  let loanStatus = 'APPROVED';

  if (source === 'individual' && lenderKey) {
    const lender = await User.findOne({ stellarPublicKey: lenderKey });
    if (!lender?.isLender) return NextResponse.json({ error: 'Target is not a registered lender' }, { status: 400 });
    loanStatus = lender.lenderManualReview ? 'PENDING_LENDER' : 'APPROVED';
  }

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + (durationDays || tier.durationDays));

  const loan = await Loan.create({
    borrowerId: auth.pubKey,
    amount: parseFloat(amount),
    currency: currency || 'XLM',
    durationDays: durationDays || tier.durationDays,
    purpose,
    fundingSource: source,
    lenderKey: source === 'individual' ? lenderKey : undefined,
    poolId: source === 'pool' ? poolId : undefined,
    approvedBy: loanStatus === 'APPROVED' ? 'smart_contract' : undefined,
    status: loanStatus,
    disbursedAt: loanStatus === 'APPROVED' ? new Date() : undefined,
    dueDate,
    repaidAmount: 0,
    feePercent: tier.feePercent,
    scoreTierAtRequest: score.tier,
  });

  const message = loanStatus === 'APPROVED'
    ? `Loan of $${amount} auto-approved via smart contract. Due: ${dueDate.toDateString()}`
    : `Loan request sent for review. Awaiting approval.`;

  return NextResponse.json({ loan, message }, { status: 201 });
}
