import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Loan } from '@/lib/models';
import { requireAuth, unauthorized } from '@/lib/apiAuth';

// GET /api/loans/[id]
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req);
  if (!auth) return unauthorized();
  const { id } = await params;

  await connectDB();
  const loan = await Loan.findById(id);
  if (!loan) return NextResponse.json({ error: 'Loan not found' }, { status: 404 });
  if (loan.borrowerId !== auth.pubKey) return NextResponse.json({ error: 'Not your loan' }, { status: 403 });

  const remaining = loan.amount - loan.repaidAmount;
  const isOverdue = new Date(loan.dueDate) < new Date() && loan.status !== 'REPAID';

  return NextResponse.json({
    ...loan.toObject(),
    remaining: Math.max(0, remaining),
    isOverdue,
    progressPercent: Math.round((loan.repaidAmount / loan.amount) * 100),
  });
}
