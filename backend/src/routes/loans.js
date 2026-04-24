const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { authMiddleware } = require('../middleware/auth');
const db = require('../db');
const { computeScore } = require('../services/creditEngine');

const LOAN_TIERS = {
  establishing: { minScore: 0, maxAmount: 0, canBorrow: false },
  building: { minScore: 300, maxAmount: 0, canBorrow: false },
  bronze: { minScore: 450, maxAmount: 50, durationDays: 14, feePercent: 2 },
  silver: { minScore: 600, maxAmount: 200, durationDays: 30, feePercent: 1.5 },
  gold: { minScore: 750, maxAmount: 1000, durationDays: 90, feePercent: 1 },
  platinum: { minScore: 900, maxAmount: 5000, durationDays: 180, feePercent: 0.5 },
};

// POST /api/loans - Request a loan
router.post('/', authMiddleware, (req, res) => {
  const { amount, currency, durationDays, purpose, fundingSource, lenderKey, poolId } = req.body;
  if (!amount || !purpose) {
    return res.status(400).json({ error: 'amount and purpose are required' });
  }

  const source = fundingSource || 'defi'; // 'defi' | 'individual' | 'pool'
  const score = db.scores.get(req.pubKey);
  if (!score) return res.status(400).json({ error: 'Credit score not computed yet' });

  const tier = LOAN_TIERS[score.tier];
  if (!tier || !tier.canBorrow) {
    return res.status(400).json({
      error: `Credit score too low. Need at least 450 (Bronze tier). Current: ${score.totalScore}`,
      currentScore: score.totalScore,
      requiredScore: 450,
    });
  }

  if (amount > tier.maxAmount) {
    return res.status(400).json({
      error: `Loan amount exceeds tier limit of $${tier.maxAmount} for ${score.tier} tier`,
    });
  }

  // Check for existing active loan
  const activeLoan = [...db.loans.values()].find(
    l => l.borrowerId === req.pubKey && ['DISBURSED', 'REPAYING', 'APPROVED', 'PENDING_LENDER', 'PENDING_POOL'].includes(l.status)
  );
  if (activeLoan) {
    return res.status(400).json({ error: 'You already have an active or pending loan.' });
  }

  // Validate individual lender if specified
  if (source === 'individual') {
    if (!lenderKey) return res.status(400).json({ error: 'lenderKey required for individual funding' });
    const lender = db.users.get(lenderKey);
    if (!lender || !lender.isLender) return res.status(400).json({ error: 'Target is not a registered lender' });
    if (score.totalScore < (lender.lenderMinScore || 0)) {
      return res.status(400).json({ error: `Your score (${score.totalScore}) is below this lender's minimum (${lender.lenderMinScore})` });
    }
  }

  // Validate pool if specified
  if (source === 'pool') {
    if (!poolId) return res.status(400).json({ error: 'poolId required for pool funding' });
    const pool = db.circles.get(poolId);
    if (!pool || !pool.isPool) return res.status(400).json({ error: 'Target is not an active MoneyPool' });
    if (!pool.poolOpenToOutside && !pool.members.includes(req.pubKey)) {
      return res.status(403).json({ error: 'This pool only lends to its own members' });
    }
    if (score.totalScore < (pool.poolMinBorrowerScore || 300)) {
      return res.status(400).json({ error: `Score too low for this pool (needs ${pool.poolMinBorrowerScore})` });
    }
    if (amount > (pool.poolMaxLoanPerBorrower || 500)) {
      return res.status(400).json({ error: `Amount exceeds this pool's per-borrower cap of $${pool.poolMaxLoanPerBorrower}` });
    }
  }

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + (durationDays || tier.durationDays));

  // Determine status based on funding source and approval rules
  let loanStatus = 'APPROVED'; // Default: DeFi auto-approves
  if (source === 'individual') {
    const lender = db.users.get(lenderKey);
    loanStatus = lender?.lenderManualReview ? 'PENDING_LENDER' : 'APPROVED';
  } else if (source === 'pool') {
    const pool = db.circles.get(poolId);
    loanStatus = pool?.poolManualApproval ? 'PENDING_POOL' : 'APPROVED';
  }

  const loan = {
    id: require('crypto').randomUUID ? require('crypto').randomUUID() : require('uuid').v4(),
    borrowerId: req.pubKey,
    amount: parseFloat(amount),
    currency: currency || 'XLM',
    durationDays: durationDays || tier.durationDays,
    purpose,
    fundingSource: source,
    lenderKey: source === 'individual' ? lenderKey : null,
    poolId: source === 'pool' ? poolId : null,
    approvedBy: loanStatus === 'APPROVED' ? 'smart_contract' : null,
    status: loanStatus,
    disbursedAt: loanStatus === 'APPROVED' ? new Date().toISOString() : null,
    dueDate: dueDate.toISOString(),
    repaidAmount: 0,
    feePercent: tier.feePercent,
    stellarTxHash: null,
    createdAt: new Date().toISOString(),
    scoreTierAtRequest: score.tier,
  };

  db.loans.set(loan.id, loan);

  const message = loanStatus === 'APPROVED'
    ? `Loan of $${amount} auto-approved via smart contract. Due: ${dueDate.toDateString()}`
    : loanStatus === 'PENDING_LENDER'
    ? `Loan request sent to lender for review. Awaiting approval.`
    : `Loan request submitted to pool. Awaiting pool owner review.`;

  res.status(201).json({ loan, message,
    explorerNote: 'On mainnet, disbursement executed via Stellar payment operation.',
  });
});

// GET /api/loans - List user's loans
router.get('/', authMiddleware, (req, res) => {
  const userLoans = [...db.loans.values()]
    .filter(l => l.borrowerId === req.pubKey)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(userLoans);
});

// GET /api/loans/:id - Loan details
router.get('/:id', authMiddleware, (req, res) => {
  const loan = db.loans.get(req.params.id);
  if (!loan) return res.status(404).json({ error: 'Loan not found' });
  if (loan.borrowerId !== req.pubKey) return res.status(403).json({ error: 'Not your loan' });

  const remaining = loan.amount - loan.repaidAmount;
  const dueDate = new Date(loan.dueDate);
  const isOverdue = dueDate < new Date() && loan.status !== 'REPAID';

  res.json({
    ...loan,
    remaining: Math.max(0, remaining),
    isOverdue,
    progressPercent: Math.round((loan.repaidAmount / loan.amount) * 100),
  });
});

// POST /api/loans/:id/repay - Record repayment
router.post('/:id/repay', authMiddleware, (req, res) => {
  const { amount, txHash } = req.body;
  const loan = db.loans.get(req.params.id);

  if (!loan) return res.status(404).json({ error: 'Loan not found' });
  if (loan.borrowerId !== req.pubKey) return res.status(403).json({ error: 'Not your loan' });
  if (loan.status === 'REPAID') return res.status(400).json({ error: 'Already repaid' });

  const repayAmount = parseFloat(amount);
  if (!repayAmount || repayAmount <= 0) return res.status(400).json({ error: 'Invalid amount' });

  loan.repaidAmount = Math.min(loan.amount, loan.repaidAmount + repayAmount);
  loan.stellarTxHash = txHash || null;

  const isOnTime = new Date(loan.dueDate) >= new Date();

  if (loan.repaidAmount >= loan.amount) {
    loan.status = 'REPAID';
    // Reward TRUST tokens for on-time repayment
    const user = db.users.get(req.pubKey);
    if (user) {
      user.trustTokens = (user.trustTokens || 0) + (isOnTime ? 50 : 20);
      db.users.set(req.pubKey, user);
    }
  } else {
    loan.status = 'REPAYING';
  }

  db.loans.set(loan.id, loan);

  // Recompute score after repayment
  setTimeout(() => computeScore(req.pubKey), 100);

  res.json({
    loan,
    message: loan.status === 'REPAID'
      ? `🎉 Loan fully repaid! +${isOnTime ? 50 : 20} TRUST tokens earned.`
      : `Partial repayment recorded. Remaining: $${(loan.amount - loan.repaidAmount).toFixed(2)}`,
  });
});

// POST /api/loans/:id/default — Mark loan as defaulted and apply penalties
router.post('/:id/default', authMiddleware, (req, res) => {
  const loan = db.loans.get(req.params.id);
  if (!loan) return res.status(404).json({ error: 'Loan not found' });

  // Only allow admin-style call or system (for now, borrower's own loan only after due date)
  if (loan.borrowerId !== req.pubKey) return res.status(403).json({ error: 'Unauthorized' });

  const isOverdue = new Date(loan.dueDate) < new Date();
  if (!isOverdue) return res.status(400).json({ error: 'Loan is not yet overdue' });

  loan.status = 'DEFAULTED';
  loan.defaultedAt = new Date().toISOString();
  db.loans.set(loan.id, loan);

  // ── Apply default penalties ──
  // If a human approved (individual lender or platinum pool owner), penalise their B score
  const approver = loan.approvedBy;
  if (approver && approver !== 'smart_contract') {
    const approverScore = db.scores.get(approver);
    if (approverScore) {
      const maxExposure = db.users.get(approver)?.lenderMaxExposure || 500;
      const penaltyRatio = Math.min(1, loan.amount / maxExposure);
      const penalty = Math.round(penaltyRatio * 40); // Max -40 points
      approverScore.behaviorScore = Math.max(0, (approverScore.behaviorScore || 0) - penalty);
      approverScore.totalScore = (approverScore.trustScore || 0) + approverScore.behaviorScore + (approverScore.activityScore || 0);
      db.scores.set(approver, approverScore);
    }
  }

  // Borrower's own behavior score also drops
  const borrowerScore = db.scores.get(req.pubKey);
  if (borrowerScore) {
    borrowerScore.behaviorScore = Math.max(0, (borrowerScore.behaviorScore || 0) - 50);
    borrowerScore.totalScore = (borrowerScore.trustScore || 0) + borrowerScore.behaviorScore + (borrowerScore.activityScore || 0);
    db.scores.set(req.pubKey, borrowerScore);
  }

  res.json({ message: 'Loan marked as defaulted. Penalties applied.', loan });
});

// GET /api/loans/stats/global - Protocol stats
router.get('/stats/global', (req, res) => {
  const allLoans = [...db.loans.values()];
  res.json({
    totalLoans: allLoans.length,
    totalDisbursed: allLoans.reduce((s, l) => s + l.amount, 0).toFixed(2),
    totalRepaid: allLoans.filter(l => l.status === 'REPAID').length,
    activeLoans: allLoans.filter(l => ['DISBURSED', 'REPAYING', 'APPROVED'].includes(l.status)).length,
    defaulted: allLoans.filter(l => l.status === 'DEFAULTED').length,
    repaymentRate: allLoans.length > 0
      ? Math.round((allLoans.filter(l => l.status === 'REPAID').length / allLoans.length) * 100)
      : 100,
  });
});

module.exports = router;
