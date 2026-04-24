import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Loan, User } from '@/lib/models';
import { computeScore } from '@/lib/creditEngine';
import { requireAuth, unauthorized } from '@/lib/apiAuth';

// POST /api/loans/[id]/repay
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req);
  if (!auth) return unauthorized();
  const { id } = await params;

  const { amount, txHash } = await req.json();
  await connectDB();

  const loan = await Loan.findById(id);
  if (!loan) return NextResponse.json({ error: 'Loan not found' }, { status: 404 });
  if (loan.borrowerId !== auth.pubKey) return NextResponse.json({ error: 'Not your loan' }, { status: 403 });
  if (loan.status === 'REPAID') return NextResponse.json({ error: 'Already repaid' }, { status: 400 });

  const repayAmount = parseFloat(amount);
  if (!repayAmount || repayAmount <= 0) return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });

  loan.repaidAmount = Math.min(loan.amount, loan.repaidAmount + repayAmount);
  loan.stellarTxHash = txHash || undefined;

  const isOnTime = new Date(loan.dueDate) >= new Date();

  if (loan.repaidAmount >= loan.amount) {
    loan.status = 'REPAID';
    await User.updateOne(
      { stellarPublicKey: auth.pubKey },
      { $inc: { trustTokens: isOnTime ? 50 : 20 } }
    );
  } else {
    loan.status = 'REPAYING';
  }

  await loan.save();
  computeScore(auth.pubKey).catch(console.error);

  return NextResponse.json({
    loan,
    message: loan.status === 'REPAID'
      ? `🎉 Loan fully repaid! +${isOnTime ? 50 : 20} TRUST tokens earned.`
      : `Partial repayment recorded. Remaining: $${(loan.amount - loan.repaidAmount).toFixed(2)}`,
  });
}
