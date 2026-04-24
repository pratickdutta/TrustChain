import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User, Loan, Score } from '@/lib/models';
import { requireAuth, unauthorized } from '@/lib/apiAuth';

// GET /api/lender/browse
export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth) return unauthorized();
  await connectDB();
  const lenders = await User.find({ isLender: true }).lean();
  const enriched = await Promise.all(lenders.map(async u => {
    const score = await Score.findOne({ userId: u.stellarPublicKey }).lean();
    return {
      pubKey: u.stellarPublicKey,
      displayName: u.displayName,
      maxExposure: u.lenderMaxExposure,
      manualReview: u.lenderManualReview,
      minBorrowerScore: u.lenderMinScore,
      score: (score as any)?.totalScore || 0,
      tier: (score as any)?.tier || 'establishing',
    };
  }));
  return NextResponse.json(enriched);
}
