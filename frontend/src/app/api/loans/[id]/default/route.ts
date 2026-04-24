import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Loan, User, Score, Attestation } from '@/lib/models';
import { requireAuth, unauthorized } from '@/lib/apiAuth';

// POST /api/loans/[id]/default
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req);
  if (!auth) return unauthorized();
  const { id } = await params;

  await connectDB();
  const loan = await Loan.findById(id);
  if (!loan) return NextResponse.json({ error: 'Loan not found' }, { status: 404 });
  if (loan.borrowerId !== auth.pubKey) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  const isOverdue = new Date(loan.dueDate) < new Date();
  if (!isOverdue) return NextResponse.json({ error: 'Loan is not yet overdue' }, { status: 400 });

  loan.status = 'DEFAULTED';
  loan.defaultedAt = new Date();
  await loan.save();

  // 1. Seize all TRUST tokens from borrower
  await User.updateOne({ stellarPublicKey: auth.pubKey }, { trustTokens: 0 });

  // 2. Massive BehaviorScore penalty on borrower
  await Score.updateOne(
    { userId: auth.pubKey },
    [{ $set: { behaviorScore: { $max: [0, { $subtract: ['$behaviorScore', 150] }] } } },
     { $set: { totalScore: { $add: ['$trustScore', '$behaviorScore', '$activityScore'] } } }]
  );

  // 3. SOCIAL SLASHING — penalize all attesters
  const attestations = await Attestation.find({ toUserId: auth.pubKey });
  await Promise.all(attestations.map(async (att) => {
    await User.updateOne(
      { stellarPublicKey: att.fromUserId },
      [{ $set: { trustTokens: { $max: [0, { $subtract: ['$trustTokens', 100] }] } } }]
    );
    await Score.updateOne(
      { userId: att.fromUserId },
      [{ $set: { behaviorScore: { $max: [0, { $subtract: ['$behaviorScore', 40] }] } } },
       { $set: { totalScore: { $add: ['$trustScore', '$behaviorScore', '$activityScore'] } } }]
    );
  }));

  return NextResponse.json({ message: 'Default processed: Social Slashing initiated and TRUST tokens burned.', loan });
}
