import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User, Loan } from '@/lib/models';
import { requireAuth, unauthorized } from '@/lib/apiAuth';

// POST /api/lender/inbox/[loanId]/decide
export async function POST(req: NextRequest, { params }: { params: Promise<{ loanId: string }> }) {
  const auth = requireAuth(req);
  if (!auth) return unauthorized();
  const { loanId } = await params;

  const { decision, note } = await req.json();
  await connectDB();

  const user = await User.findOne({ stellarPublicKey: auth.pubKey });
  if (!user?.isLender) return NextResponse.json({ error: 'Not a lender' }, { status: 403 });

  const loan = await Loan.findById(loanId);
  if (!loan) return NextResponse.json({ error: 'Loan not found' }, { status: 404 });
  if (loan.lenderKey !== auth.pubKey) return NextResponse.json({ error: 'Not your inbox item' }, { status: 403 });
  if (loan.status !== 'PENDING_LENDER') return NextResponse.json({ error: 'Loan already decided' }, { status: 400 });

  if (decision === 'APPROVE') {
    loan.status = 'APPROVED';
    loan.approvedBy = auth.pubKey;
    loan.disbursedAt = new Date();
  } else if (decision === 'REJECT') {
    loan.status = 'REJECTED';
  } else {
    return NextResponse.json({ error: 'decision must be APPROVE or REJECT' }, { status: 400 });
  }

  await loan.save();
  return NextResponse.json({ message: `Loan ${decision}D`, loan });
}
