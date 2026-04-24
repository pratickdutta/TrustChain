const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

router.post('/boost-score', authMiddleware, (req, res) => {
  let score = db.scores.get(req.pubKey);
  if (!score) {
    score = require('../services/creditEngine').computeScore(req.pubKey);
  }

  // Override components
  score.trustScore = 320;
  score.behaviorScore = 320;
  score.activityScore = 160;
  score.totalScore = 800;
  score.tier = 'gold';

  db.scores.set(req.pubKey, score);

  // Update frontend globally via user response
  const user = db.users.get(req.pubKey) || { trustTokens: 0 };
  if (!user.trustTokens) user.trustTokens = 0;
  db.users.set(req.pubKey, user);

  res.json({ message: 'Score boosted to 800 (Gold)', score });
});

module.exports = router;
