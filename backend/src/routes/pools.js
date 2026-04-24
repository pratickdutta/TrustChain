const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const db = require('../db');

// Ensure pool deposits map exists
if (!db.poolDeposits) db.poolDeposits = new Map();

// ── PUT /api/pools/:circleId/settings — Owner enables MoneyPool (Platinum only)
router.put('/:circleId/settings', authMiddleware, (req, res) => {
  const circle = db.circles.get(req.params.circleId);
  if (!circle) return res.status(404).json({ error: 'Circle not found' });
  if (circle.creatorId !== req.pubKey) return res.status(403).json({ error: 'Only the circle owner can configure pool settings' });

  const score = db.scores.get(req.pubKey);
  const { openToOutside, manualApproval, minBorrowerScore, maxLoanPerBorrower } = req.body;

  // Manual approval is a Platinum-only governance feature
  if (manualApproval === true && score?.tier !== 'platinum') {
    return res.status(403).json({
      error: 'Manual approval control requires Platinum tier. Your current tier: ' + (score?.tier || 'establishing'),
    });
  }

  circle.isPool = true;
  circle.poolOpenToOutside = openToOutside !== false;
  circle.poolManualApproval = score?.tier === 'platinum' ? (manualApproval || false) : false;
  circle.poolMinBorrowerScore = parseInt(minBorrowerScore) || 300;
  circle.poolMaxLoanPerBorrower = parseFloat(maxLoanPerBorrower) || 500;

  db.circles.set(circle.id, circle);
  res.json({ message: 'MoneyPool settings updated', circle });
});

// ── DELETE /api/pools/:circleId/settings — Owner disables MoneyPool
router.delete('/:circleId/settings', authMiddleware, (req, res) => {
  const circle = db.circles.get(req.params.circleId);
  if (!circle) return res.status(404).json({ error: 'Circle not found' });
  if (circle.creatorId !== req.pubKey) return res.status(403).json({ error: 'Only the owner can disable MoneyPool' });

  circle.isPool = false;
  db.circles.set(circle.id, circle);
  res.json({ message: 'MoneyPool disabled' });
});

// ── GET /api/pools/browse — Browse all active money pools
router.get('/browse', authMiddleware, (req, res) => {
  const pools = [...db.circles.values()]
    .filter(c => c.isPool && c.status === 'ACTIVE')
    .map(c => {
      const ownerScore = db.scores.get(c.creatorId);
      const deposits = [...(db.poolDeposits || new Map()).values()].filter(d => d.circleId === c.id);
      const totalDeposited = deposits.reduce((s, d) => s + d.amount, 0);
      return {
        id: c.id,
        name: c.name,
        description: c.description,
        memberCount: c.members.length,
        openToOutside: c.poolOpenToOutside,
        manualApproval: c.poolManualApproval,
        minBorrowerScore: c.poolMinBorrowerScore,
        maxLoanPerBorrower: c.poolMaxLoanPerBorrower,
        totalDeposited: totalDeposited.toFixed(2),
        ownerTier: ownerScore?.tier || 'establishing',
      };
    });
  res.json(pools);
});

// ── POST /api/pools/:circleId/deposit — Member deposits into pool
router.post('/:circleId/deposit', authMiddleware, (req, res) => {
  const { amount } = req.body;
  const circle = db.circles.get(req.params.circleId);
  if (!circle) return res.status(404).json({ error: 'Circle not found' });
  if (!circle.isPool) return res.status(400).json({ error: 'Circle is not a MoneyPool' });
  if (!circle.members.includes(req.pubKey)) return res.status(403).json({ error: 'Not a circle member' });

  const depositAmount = parseFloat(amount);
  if (!depositAmount || depositAmount <= 0) return res.status(400).json({ error: 'Invalid amount' });

  if (!db.poolDeposits) db.poolDeposits = new Map();
  const deposit = {
    id: require('crypto').randomUUID(),
    circleId: circle.id,
    depositorKey: req.pubKey,
    amount: depositAmount,
    depositedAt: new Date().toISOString(),
  };
  db.poolDeposits.set(deposit.id, deposit);
  res.status(201).json({ message: `Deposited ${depositAmount} XLM into pool`, deposit });
});

// ── GET /api/pools/:circleId/inbox — Pending pool loan applications (Platinum owner only)
router.get('/:circleId/inbox', authMiddleware, (req, res) => {
  const circle = db.circles.get(req.params.circleId);
  if (!circle) return res.status(404).json({ error: 'Circle not found' });
  if (circle.creatorId !== req.pubKey) return res.status(403).json({ error: 'Only the pool owner can view the inbox' });

  const score = db.scores.get(req.pubKey);
  if (score?.tier !== 'platinum') {
    return res.status(403).json({ error: 'Pool approval inbox requires Platinum tier' });
  }

  const pending = [...db.loans.values()]
    .filter(l => l.poolId === circle.id && l.status === 'PENDING_POOL')
    .map(l => {
      const borrower = db.users.get(l.borrowerId);
      const borrowerScore = db.scores.get(l.borrowerId);
      return {
        ...l,
        borrowerName: borrower?.displayName || l.borrowerId.slice(0, 8) + '...',
        borrowerScore: borrowerScore?.totalScore || 0,
        borrowerTier: borrowerScore?.tier || 'establishing',
        isCircleMember: circle.members.includes(l.borrowerId),
      };
    });

  res.json(pending);
});

// ── POST /api/pools/:circleId/inbox/:loanId/decide — Approve or reject pool application
router.post('/:circleId/inbox/:loanId/decide', authMiddleware, (req, res) => {
  const { decision, note } = req.body;
  const circle = db.circles.get(req.params.circleId);
  if (!circle) return res.status(404).json({ error: 'Circle not found' });
  if (circle.creatorId !== req.pubKey) return res.status(403).json({ error: 'Not the pool owner' });

  const score = db.scores.get(req.pubKey);
  if (score?.tier !== 'platinum') {
    return res.status(403).json({ error: 'Platinum tier required for manual approval' });
  }

  const loan = db.loans.get(req.params.loanId);
  if (!loan) return res.status(404).json({ error: 'Loan not found' });
  if (loan.poolId !== circle.id) return res.status(403).json({ error: 'Loan not from this pool' });
  if (loan.status !== 'PENDING_POOL') return res.status(400).json({ error: 'Loan already decided' });

  if (decision === 'APPROVE') {
    loan.status = 'APPROVED';
    loan.approvedBy = req.pubKey;
    loan.approvedAt = new Date().toISOString();
    loan.disbursedAt = new Date().toISOString();
    loan.approverNote = note || null;
  } else if (decision === 'REJECT') {
    loan.status = 'REJECTED';
    loan.rejectedBy = req.pubKey;
    loan.rejectedAt = new Date().toISOString();
    loan.approverNote = note || null;
  } else {
    return res.status(400).json({ error: 'decision must be APPROVE or REJECT' });
  }

  db.loans.set(loan.id, loan);
  res.json({ message: `Pool loan ${decision}D`, loan });
});

module.exports = router;
