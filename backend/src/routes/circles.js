const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { authMiddleware } = require('../middleware/auth');
const db = require('../db');
const { computeScore, recalculateCircleMemberScores } = require('../services/creditEngine');

// POST /api/circles - Create a circle
router.post('/', authMiddleware, (req, res) => {
  const { name, description, isPublic } = req.body;
  if (!name) return res.status(400).json({ error: 'Circle name is required' });

  const circleId = uuidv4();
  const circle = {
    id: circleId,
    name: name.slice(0, 80),
    description: description?.slice(0, 300) || '',
    creatorId: req.pubKey,
    isPublic: isPublic !== false,
    maxMembers: 20,
    status: 'ACTIVE',
    members: [req.pubKey],
    attestations: [],
    reliabilityScore: 0,
    createdAt: new Date().toISOString(),
    inviteCode: uuidv4().slice(0, 8).toUpperCase(),
  };

  db.circles.set(circleId, circle);
  computeScore(req.pubKey);

  res.status(201).json(circle);
});

// GET /api/circles - List user's circles
router.get('/', authMiddleware, (req, res) => {
  const userCircles = [...db.circles.values()].filter(c =>
    c.members.includes(req.pubKey)
  );
  res.json(userCircles);
});

// GET /api/circles/public - Public circles
router.get('/public', (req, res) => {
  const publicCircles = [...db.circles.values()]
    .filter(c => c.isPublic && c.status === 'ACTIVE')
    .map(c => ({
      id: c.id,
      name: c.name,
      description: c.description,
      memberCount: c.members.length,
      reliabilityScore: c.reliabilityScore,
      createdAt: c.createdAt,
    }));
  res.json(publicCircles);
});

// GET /api/circles/:id - Circle details
router.get('/:id', authMiddleware, (req, res) => {
  const circle = db.circles.get(req.params.id);
  if (!circle) return res.status(404).json({ error: 'Circle not found' });

  const enrichedMembers = circle.members.map(pubKey => {
    const user = db.users.get(pubKey);
    const score = db.scores.get(pubKey);
    const attestationsReceived = circle.attestations.filter(a => a.toUserId === pubKey);
    return {
      stellarPublicKey: pubKey,
      displayName: user?.displayName || pubKey.slice(0, 8) + '...',
      score: score?.totalScore || 0,
      tier: score?.tier || 'establishing',
      role: pubKey === circle.creatorId ? 'creator' : 'member',
      attestationCount: attestationsReceived.length,
    };
  });

  res.json({ ...circle, enrichedMembers });
});

// POST /api/circles/:id/join - Join a circle
router.post('/:id/join', authMiddleware, (req, res) => {
  const circle = db.circles.get(req.params.id);
  if (!circle) return res.status(404).json({ error: 'Circle not found' });
  if (!circle.isPublic) {
    const { inviteCode } = req.body;
    if (inviteCode !== circle.inviteCode) {
      return res.status(403).json({ error: 'Invalid invite code' });
    }
  }
  if (circle.members.includes(req.pubKey)) {
    return res.status(400).json({ error: 'Already a member' });
  }
  if (circle.members.length >= circle.maxMembers) {
    return res.status(400).json({ error: 'Circle is full' });
  }

  circle.members.push(req.pubKey);
  db.circles.set(circle.id, circle);
  recalculateCircleMemberScores(circle.id);

  res.json({ message: 'Joined circle successfully', circle });
});

// POST /api/circles/:id/attest - Attest a member
router.post('/:id/attest', authMiddleware, (req, res) => {
  const { targetPubKey, weight } = req.body;
  const circle = db.circles.get(req.params.id);

  if (!circle) return res.status(404).json({ error: 'Circle not found' });
  if (!circle.members.includes(req.pubKey)) {
    return res.status(403).json({ error: 'Not a circle member' });
  }
  if (!circle.members.includes(targetPubKey)) {
    return res.status(400).json({ error: 'Target is not a circle member' });
  }
  if (req.pubKey === targetPubKey) {
    return res.status(400).json({ error: 'Cannot attest yourself' });
  }

  const attestWeight = Math.min(1.0, Math.max(0.1, parseFloat(weight) || 0.5));

  // Remove existing attestation if any
  circle.attestations = circle.attestations.filter(
    a => !(a.fromUserId === req.pubKey && a.toUserId === targetPubKey)
  );

  const attestation = {
    id: uuidv4(),
    fromUserId: req.pubKey,
    toUserId: targetPubKey,
    circleId: circle.id,
    weight: attestWeight,
    timeBonus: 0,
    credibilityBonus: 0,
    createdAt: new Date().toISOString(),
  };

  circle.attestations.push(attestation);
  db.circles.set(circle.id, circle);
  db.attestations.set(attestation.id, attestation);

  // Recompute scores for both parties
  computeScore(req.pubKey);
  computeScore(targetPubKey);

  res.json({ message: 'Attestation recorded', attestation });
});

// DELETE /api/circles/:id/leave
router.delete('/:id/leave', authMiddleware, (req, res) => {
  const circle = db.circles.get(req.params.id);
  if (!circle) return res.status(404).json({ error: 'Circle not found' });
  if (circle.creatorId === req.pubKey) {
    return res.status(400).json({ error: 'Creator cannot leave; dissolve the circle instead' });
  }

  circle.members = circle.members.filter(m => m !== req.pubKey);
  circle.attestations = circle.attestations.filter(
    a => a.fromUserId !== req.pubKey && a.toUserId !== req.pubKey
  );
  db.circles.set(circle.id, circle);
  recalculateCircleMemberScores(circle.id);

  res.json({ message: 'Left circle successfully' });
});

module.exports = router;
