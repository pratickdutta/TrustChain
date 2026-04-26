import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User, Loan } from '@/lib/models';
import { requireAuth, unauthorized } from '@/lib/apiAuth';

// GET /api/lender/portfolio
export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth) return unauthorized();
  await connectDB();
  const user = await User.findOne({ stellarPublicKey: auth.pubKey });
  if (!user?.isLender) return NextResponse.json({ error: 'Not a lender' }, { status: 403 });

  const myLoans = await Loan.find({ lenderKey: auth.pubKey });
  const active = myLoans.filter(l => ['APPROVED', 'DISBURSED', 'REPAYING'].includes(l.status));
  const repaid = myLoans.filter(l => l.status === 'REPAID');
  const defaulted = myLoans.filter(l => l.status === 'DEFAULTED');
  const decided = myLoans.filter(l => !['PENDING_LENDER', 'REJECTED'].includes(l.status));

  return NextResponse.json({
    totalLent: decided.reduce((s, l) => s + l.amount, 0).toFixed(2),
    totalReturned: repaid.reduce((s, l) => s + ((l.repaidAmount || l.amount) - (l.platformFeeCollected || 0)), 0).toFixed(2),
    totalInterestEarned: repaid.reduce((s, l) => s + ((l.repaidAmount || l.amount) - l.amount - (l.platformFeeCollected || 0)), 0).toFixed(2),
    activeLoans: active.length,
    repaidLoans: repaid.length,
    defaultedLoans: defaulted.length,
    repaymentRate: decided.length > 0 ? Math.round((repaid.length / decided.length) * 100) : 100,
  });
}
