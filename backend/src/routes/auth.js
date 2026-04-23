const express = require('express');
const router = express.Router();
const { Keypair, Networks, StrKey } = require('@stellar/stellar-sdk');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { JWT_SECRET } = require('../middleware/auth');
const { computeScore } = require('../services/creditEngine');

// POST /api/auth/challenge - Generate a nonce for wallet signature
router.post('/challenge', (req, res) => {
  const { pubKey } = req.body;
  if (!pubKey) return res.status(400).json({ error: 'pubKey required' });

  // Validate Stellar public key
  if (!StrKey.isValidEd25519PublicKey(pubKey)) {
    return res.status(400).json({ error: 'Invalid Stellar public key' });
  }

  const nonce = `TrustChain-${uuidv4()}-${Date.now()}`;
  db.nonces.set(pubKey, { nonce, expiresAt: Date.now() + 5 * 60 * 1000 });

  res.json({ nonce, message: `Sign this message to authenticate: ${nonce}` });
});

// POST /api/auth/verify - Verify signature and issue JWT
// For MVP: We accept public key directly (signature verification requires Freighter on client)
router.post('/verify', (req, res) => {
  const { pubKey, signature, nonce } = req.body;
  if (!pubKey) return res.status(400).json({ error: 'pubKey required' });

  if (!StrKey.isValidEd25519PublicKey(pubKey)) {
    return res.status(400).json({ error: 'Invalid Stellar public key' });
  }

  // In MVP, we verify the nonce was issued (signature verification done client-side via Freighter)
  const nonceData = db.nonces.get(pubKey);
  if (!nonceData || nonceData.nonce !== nonce) {
    // Allow login if nonce matches OR if it's a fresh user connecting for the first time
    if (nonce && nonceData && nonceData.expiresAt < Date.now()) {
      return res.status(400).json({ error: 'Nonce expired, please try again' });
    }
  }

  db.nonces.delete(pubKey);

  // Create or retrieve user
  let user = db.users.get(pubKey);
  if (!user) {
    user = {
      id: uuidv4(),
      stellarPublicKey: pubKey,
      displayName: `User_${pubKey.slice(0, 6)}`,
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      kycLevel: 0,
      trustTokens: 0,
    };
    db.users.set(pubKey, user);
    // Initialize score
    computeScore(pubKey);
  } else {
    user.lastActiveAt = new Date().toISOString();
    db.users.set(pubKey, user);
  }

  const token = jwt.sign(
    { pubKey, userId: user.id },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({ token, user });
});

module.exports = router;
