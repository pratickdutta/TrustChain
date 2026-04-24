import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User, Loan, Score } from '@/lib/models';
import { requireAuth, unauthorized } from '@/lib/apiAuth';

// GET /api/lender/settings
export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth) return unauthorized();
  await connectDB();
  const user = await User.findOne({ stellarPublicKey: auth.pubKey });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  return NextResponse.json({
    isLender: user.isLender,
    maxExposure: user.lenderMaxExposure,
    manualReview: user.lenderManualReview,
    minBorrowerScore: user.lenderMinScore,
  });
}

// PUT /api/lender/settings
export async function PUT(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth) return unauthorized();
  const { isLender, maxExposure, manualReview, minBorrowerScore } = await req.json();
  await connectDB();

  const update: any = {};
  if (typeof isLender === 'boolean') update.isLender = isLender;
  if (maxExposure !== undefined) update.lenderMaxExposure = parseFloat(maxExposure) || 0;
  if (typeof manualReview === 'boolean') update.lenderManualReview = manualReview;
  if (minBorrowerScore !== undefined) update.lenderMinScore = parseInt(minBorrowerScore) || 0;

  const user = await User.findOneAndUpdate({ stellarPublicKey: auth.pubKey }, update, { new: true });
  return NextResponse.json({ message: 'Lender settings updated', user });
}
