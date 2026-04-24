import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Loan } from '@/lib/models';

// GET /api/loans/stats/global
export async function GET(req: NextRequest) {
  await connectDB();
  const allLoans = await Loan.find({});
  const repaid = allLoans.filter(l => l.status === 'REPAID');
  const active = allLoans.filter(l => ['DISBURSED', 'REPAYING', 'APPROVED'].includes(l.status));
  const defaulted = allLoans.filter(l => l.status === 'DEFAULTED');

  return NextResponse.json({
    totalLoans: allLoans.length,
    totalDisbursed: allLoans.reduce((s, l) => s + l.amount, 0).toFixed(2),
    totalRepaid: repaid.length,
    activeLoans: active.length,
    defaulted: defaulted.length,
    repaymentRate: allLoans.length > 0 ? Math.round((repaid.length / allLoans.length) * 100) : 100,
  });
}
