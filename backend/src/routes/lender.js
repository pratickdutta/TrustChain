const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const db = require('../db');
const { computeScore } = require('../services/creditEngine');

// ── PUT /api/lender/settings — Toggle lender mode & preferences
router.put('/settings', authMiddleware, (req, res) => {
  const user = db.users.get(req.pubKey);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { isLender, maxExposure, manualReview, minBorrowerScore } = req.body;

  if (typeof isLender === 'boolean') user.isLender = isLender;
  if (maxExposure !== undefined) user.lenderMaxExposure = parseFloat(maxExposure) || 0;
  if (typeof manualReview === 'boolean') user.lenderManualReview = manualReview;
  if (minBorrowerScore !== undefined) user.lenderMinScore = parseInt(minBorrowerScore) || 0;

  db.users.set(req.pubKey, user);
  res.json({ message: 'Lender settings updated', user });
});

// ── GET /api/lender/settings — Get current lender settings
router.get('/settings', authMiddleware, (req, res) => {
  const user = db.users.get(req.pubKey);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({
    isLender: user.isLender || false,
    maxExposure: user.lenderMaxExposure || 0,
    manualReview: user.lenderManualReview || false,
    minBorrowerScore: user.lenderMinScore || 0,
  });
});

// ── GET /api/lender/inbox — Loan applications directed at this lender
router.get('/inbox', authMiddleware, (req, res) => {
  const user = db.users.get(req.pubKey);
  if (!user || !user.isLender) {
    return res.status(403).json({ error: 'Not registered as a lender' });
  }

  const pendingLoans = [...db.loans.values()]
    .filter(l => l.lenderKey === req.pubKey && l.status === 'PENDING_LENDER')
    .map(l => {
      const borrower = db.users.get(l.borrowerId);
      const score = db.scores.get(l.borrowerId);
      return {
        ...l,
        borrowerName: borrower?.displayName || l.borrowerId.slice(0, 8) + '...',
        borrowerScore: score?.totalScore || 0,
        borrowerTier: score?.tier || 'establishing',
      };
    });

  res.json(pendingLoans);
});

// ── POST /api/lender/inbox/:loanId/decide — Approve or reject
router.post('/inbox/:loanId/decide', authMiddleware, (req, res) => {
  const { decision, note } = req.body; // decision: 'APPROVE' | 'REJECT'
  const user = db.users.get(req.pubKey);
  if (!user || !user.isLender) {
    return res.status(403).json({ error: 'Not registered as a lender' });
  }

  const loan = db.loans.get(req.params.loanId);
  if (!loan) return res.status(404).json({ error: 'Loan not found' });
  if (loan.lenderKey !== req.pubKey) return res.status(403).json({ error: 'Not your inbox item' });
  if (loan.status !== 'PENDING_LENDER') return res.status(400).json({ error: 'Loan already decided' });

  if (decision === 'APPROVE') {
    loan.status = 'APPROVED';
    loan.approvedBy = req.pubKey;
    loan.approvedAt = new Date().toISOString();
    loan.disbursedAt = new Date().toISOString();
    loan.lenderNote = note || null;
  } else if (decision === 'REJECT') {
    loan.status = 'REJECTED';
    loan.rejectedBy = req.pubKey;
    loan.rejectedAt = new Date().toISOString();
    loan.lenderNote = note || null;
  } else {
    return res.status(400).json({ error: 'decision must be APPROVE or REJECT' });
  }

  db.loans.set(loan.id, loan);
  res.json({ message: `Loan ${decision}D`, loan });
});

// ── GET /api/lender/portfolio — Stats for the lender
router.get('/portfolio', authMiddleware, (req, res) => {
  const user = db.users.get(req.pubKey);
  if (!user || !user.isLender) {
    return res.status(403).json({ error: 'Not registered as a lender' });
  }

  const myLoans = [...db.loans.values()].filter(l => l.lenderKey === req.pubKey);
  const active = myLoans.filter(l => ['APPROVED', 'DISBURSED', 'REPAYING'].includes(l.status));
  const repaid = myLoans.filter(l => l.status === 'REPAID');
  const defaulted = myLoans.filter(l => l.status === 'DEFAULTED');

  const totalLent = myLoans.filter(l => l.status !== 'PENDING_LENDER' && l.status !== 'REJECTED')
    .reduce((s, l) => s + l.amount, 0);
  const totalReturned = repaid.reduce((s, l) => s + l.amount, 0);

  res.json({
    totalLent: totalLent.toFixed(2),
    totalReturned: totalReturned.toFixed(2),
    activeLoans: active.length,
    repaidLoans: repaid.length,
    defaultedLoans: defaulted.length,
    repaymentRate: myLoans.length > 0
      ? Math.round((repaid.length / myLoans.filter(l => l.status !== 'PENDING_LENDER' && l.status !== 'REJECTED').length) * 100)
      : 100,
  });
});

// ── GET /api/lender/browse — Browse verified lenders for a borrower
router.get('/browse', authMiddleware, (req, res) => {
  const lenders = [...db.users.values()]
    .filter(u => u.isLender)
    .map(u => {
      const score = db.scores.get(u.stellarPublicKey);
      return {
        pubKey: u.stellarPublicKey,
        displayName: u.displayName,
        maxExposure: u.lenderMaxExposure || 0,
        manualReview: u.lenderManualReview || false,
        minBorrowerScore: u.lenderMinScore || 0,
        score: score?.totalScore || 0,
        tier: score?.tier || 'establishing',
      };
    });
  res.json(lenders);
});

module.exports = router;
