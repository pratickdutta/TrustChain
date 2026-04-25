import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User, Loan, Circle, Attestation, Score } from '@/lib/models';

const start = Date.now();

/**
 * GET /api/metrics
 *
 * Phase 2 (Black Belt): Metrics Dashboard + Data Indexing endpoint.
 *
 * Returns aggregated protocol statistics from our MongoDB data layer,
 * which serves as our indexed data store for on-chain activity.
 *
 * Data Indexing Approach:
 * - On-chain events (loan creation, repayment) are indexed into MongoDB
 *   via our API routes at write time, giving us O(1) query performance.
 * - The Stellar Horizon API is the source of truth for balances/hashes.
 * - Our MongoDB acts as a queryable, structured index over raw blockchain data.
 */
export async function GET(req: NextRequest) {
  await connectDB();

  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 86400000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);

  const [
    totalUsers,
    dauCount,
    wauCount,
    mauCount,
    totalLoans,
    activeLoans,
    repaidLoans,
    defaultedLoans,
    totalCircles,
    totalAttestations,
    loanAggResult,
    tierDist,
    recentLoans,
    topScorers,
    newUsersToday,
    newUsersThisWeek,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ lastActiveAt: { $gte: oneDayAgo } }),
    User.countDocuments({ lastActiveAt: { $gte: sevenDaysAgo } }),
    User.countDocuments({ lastActiveAt: { $gte: thirtyDaysAgo } }),
    Loan.countDocuments(),
    Loan.countDocuments({ status: { $in: ['APPROVED', 'DISBURSED', 'REPAYING'] } }),
    Loan.countDocuments({ status: 'REPAID' }),
    Loan.countDocuments({ status: 'DEFAULTED' }),
    Circle.countDocuments(),
    Attestation.countDocuments(),
    Loan.aggregate([
      { $group: { _id: null, totalDisbursed: { $sum: '$amount' }, totalRepaid: { $sum: '$repaidAmount' } } },
    ]),
    Score.aggregate([
      { $group: { _id: '$tier', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    Loan.find().sort({ createdAt: -1 }).limit(7).lean(),
    Score.find().sort({ totalScore: -1 }).limit(5).populate('userId').lean(),
    User.countDocuments({ createdAt: { $gte: oneDayAgo } }),
    User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
  ]);

  const totalDisbursed = loanAggResult[0]?.totalDisbursed || 0;
  const totalRepaid = loanAggResult[0]?.totalRepaid || 0;
  const repaymentRate = totalLoans > 0 ? Math.round((repaidLoans / totalLoans) * 100) : 0;
  const defaultRate = totalLoans > 0 ? Math.round((defaultedLoans / totalLoans) * 100) : 0;

  return NextResponse.json({
    // User Metrics
    users: {
      total: totalUsers,
      dau: dauCount,
      wau: wauCount,
      mau: mauCount,
      newToday: newUsersToday,
      newThisWeek: newUsersThisWeek,
      retentionRate: totalUsers > 0 ? Math.round((mauCount / totalUsers) * 100) : 0,
    },
    // Loan Metrics
    loans: {
      total: totalLoans,
      active: activeLoans,
      repaid: repaidLoans,
      defaulted: defaultedLoans,
      repaymentRate,
      defaultRate,
      totalDisbursed: parseFloat(totalDisbursed.toFixed(2)),
      totalRepaid: parseFloat(totalRepaid.toFixed(2)),
      tvl: parseFloat((totalDisbursed - totalRepaid).toFixed(2)),
    },
    // Network Metrics
    network: {
      circles: totalCircles,
      attestations: totalAttestations,
      tierDistribution: tierDist,
    },
    // Recent Activity (for timeline/table)
    recentLoans: recentLoans.map((l: any) => ({
      id: l._id,
      amount: l.amount,
      status: l.status,
      purpose: l.purpose,
      createdAt: l.createdAt,
    })),
    // System Info
    system: {
      uptimeSeconds: Math.floor((Date.now() - start) / 1000),
      indexingApproach: 'MongoDB write-time indexing with Stellar Horizon as source-of-truth for tx hashes and balances.',
      dataFreshness: now.toISOString(),
    },
  });
}
