import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User, Loan, Score } from '@/lib/models';
import { requireAuth, unauthorized } from '@/lib/apiAuth';

// GET /api/lender/inbox
export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth) return unauthorized();
  await connectDB();
  const user = await User.findOne({ stellarPublicKey: auth.pubKey });
  if (!user?.isLender) return NextResponse.json({ error: 'Not registered as a lender' }, { status: 403 });

  const loans = await Loan.find({ lenderKey: auth.pubKey }).sort({ createdAt: -1 });
  const enriched = await Promise.all(loans.map(async l => {
    const borrower = await User.findOne({ stellarPublicKey: l.borrowerId });
    const score = await Score.findOne({ userId: l.borrowerId });
    return {
      ...l.toObject(),
      borrowerName: borrower?.displayName || l.borrowerId.slice(0, 8) + '...',
      borrowerScore: score?.totalScore || 0,
      borrowerTier: score?.tier || 'establishing',
    };
  }));
  return NextResponse.json(enriched);
}
