const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const db = require('../db');
const { computeScore } = require('../services/creditEngine');

// GET /api/score/me
router.get('/me', authMiddleware, (req, res) => {
  let score = db.scores.get(req.pubKey);
  if (!score) {
    score = computeScore(req.pubKey);
  }
  res.json(score);
});

// GET /api/score/:pubKey - Public score
router.get('/:pubKey', (req, res) => {
  const score = db.scores.get(req.params.pubKey);
  if (!score) return res.status(404).json({ error: 'Score not found' });
  res.json({
    totalScore: score.totalScore,
    tier: score.tier,
    computedAt: score.computedAt,
  });
});

// POST /api/score/recalculate - Trigger recalculation
router.post('/recalculate', authMiddleware, (req, res) => {
  const score = computeScore(req.pubKey);
  res.json({ message: 'Score recalculated', score });
});

module.exports = router;
