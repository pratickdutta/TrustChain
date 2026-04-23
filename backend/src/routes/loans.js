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
  const { amount, currency, durationDays, purpose } = req.body;
  if (!amount || !purpose) {
    return res.status(400).json({ error: 'amount and purpose are required' });
  }

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
    l => l.borrowerId === req.pubKey && ['DISBURSED', 'REPAYING', 'APPROVED'].includes(l.status)
  );
  if (activeLoan) {
    return res.status(400).json({ error: 'You already have an active loan. Repay it first.' });
  }

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + (durationDays || tier.durationDays));

  const loan = {
    id: uuidv4(),
    borrowerId: req.pubKey,
    amount: parseFloat(amount),
    currency: currency || 'XLM',
    durationDays: durationDays || tier.durationDays,
    purpose,
    status: 'APPROVED', // Auto-approve for MVP (pool-backed)
    disbursedAt: new Date().toISOString(),
    dueDate: dueDate.toISOString(),
    repaidAmount: 0,
    feePercent: tier.feePercent,
    stellarTxHash: null,
    createdAt: new Date().toISOString(),
    scoreTierAtRequest: score.tier,
  };

  db.loans.set(loan.id, loan);
  res.status(201).json({
    loan,
    message: `Loan of $${amount} approved for ${score.tier} tier. Due: ${dueDate.toDateString()}`,
    explorerNote: 'On mainnet, disbursement would be executed via Stellar payment operation.',
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
