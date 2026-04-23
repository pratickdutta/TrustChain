const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const db = require('../db');
const { computeScore } = require('../services/creditEngine');

// GET /api/users/me
router.get('/me', authMiddleware, (req, res) => {
  const user = req.user;
  const score = db.scores.get(req.pubKey);
  const userCircles = [...db.circles.values()].filter(c =>
    c.members && c.members.includes(req.pubKey)
  );
  const userLoans = [...db.loans.values()].filter(l => l.borrowerId === req.pubKey);

  res.json({
    ...user,
    score: score || null,
    circles: userCircles.map(c => ({ id: c.id, name: c.name, memberCount: c.members.length })),
    loans: userLoans.map(l => ({
      id: l.id, amount: l.amount, status: l.status, dueDate: l.dueDate
    })),
  });
});

// PUT /api/users/me
router.put('/me', authMiddleware, (req, res) => {
  const { displayName, avatarUrl } = req.body;
  const user = req.user;

  if (displayName) user.displayName = displayName.slice(0, 50);
  if (avatarUrl) user.avatarUrl = avatarUrl;

  db.users.set(req.pubKey, user);
  res.json(user);
});

// GET /api/users/:pubKey - Public profile
router.get('/:pubKey', (req, res) => {
  const { pubKey } = req.params;
  const user = db.users.get(pubKey);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const score = db.scores.get(pubKey);
  const userCircles = [...db.circles.values()].filter(c =>
    c.members && c.members.includes(pubKey)
  );

  res.json({
    stellarPublicKey: user.stellarPublicKey,
    displayName: user.displayName,
    createdAt: user.createdAt,
    score: score ? { totalScore: score.totalScore, tier: score.tier } : null,
    circleCount: userCircles.length,
  });
});

// GET /api/users - List all users (for leaderboard)
router.get('/', (req, res) => {
  const users = [...db.users.values()].map(u => {
    const score = db.scores.get(u.stellarPublicKey);
    return {
      stellarPublicKey: u.stellarPublicKey,
      displayName: u.displayName,
      score: score ? { totalScore: score.totalScore, tier: score.tier } : null,
      createdAt: u.createdAt,
    };
  });

  users.sort((a, b) => (b.score?.totalScore || 0) - (a.score?.totalScore || 0));
  res.json(users.slice(0, 20));
});

module.exports = router;
