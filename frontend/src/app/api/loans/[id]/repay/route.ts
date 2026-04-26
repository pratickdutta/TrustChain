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

  const PLATFORM_FEE_RATE = 0.002; // 0.2%
  const repayAmount = parseFloat(amount);
  if (!repayAmount || repayAmount <= 0) return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });

  loan.repaidAmount += repayAmount;
  loan.stellarTxHash = txHash || undefined;

  const totalOwed = loan.amount + (loan.amount * loan.feePercent / 100);
  const isOnTime = new Date(loan.dueDate) >= new Date();

  let message = '';
  
  if (loan.repaidAmount >= totalOwed) {
    loan.status = 'REPAID';
    loan.repaidAmount = totalOwed; // cap it
    
    // Calculate and store platform fee
    const platformFee = loan.amount * PLATFORM_FEE_RATE;
    loan.platformFeeCollected = platformFee;

    await User.updateOne(
      { stellarPublicKey: auth.pubKey },
      { $inc: { trustTokens: isOnTime ? 50 : 20 } }
    );
    
    message = `✅ Loan contract settled. +${isOnTime ? 50 : 20} TRUST tokens earned. (Protocol fee of $${platformFee.toFixed(2)} collected)`;
  } else {
    loan.status = 'REPAYING';
    message = `Partial repayment recorded. Remaining: $${(totalOwed - loan.repaidAmount).toFixed(2)}`;
  }

  await loan.save();
  computeScore(auth.pubKey).catch(console.error);

  return NextResponse.json({ loan, message });
}
