const express = require('express');
const router = express.Router();
const { getAccountInfo, getRecentTransactions, fundTestnetAccount, getExplorerLink, getAccountExplorerLink } = require('../services/stellar');
const { authMiddleware } = require('../middleware/auth');

// GET /api/stellar/account/:pubKey
router.get('/account/:pubKey', async (req, res) => {
  try {
    const info = await getAccountInfo(req.params.pubKey);
    info.explorerLink = getAccountExplorerLink(req.params.pubKey);
    res.json(info);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/stellar/transactions/:pubKey
router.get('/transactions/:pubKey', authMiddleware, async (req, res) => {
  try {
    const txs = await getRecentTransactions(req.params.pubKey);
    res.json(txs.map(tx => ({
      ...tx,
      explorerLink: getExplorerLink(tx.transactionHash),
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/stellar/fund-testnet - Fund account via Friendbot
router.post('/fund-testnet', async (req, res) => {
  const { pubKey } = req.body;
  if (!pubKey) return res.status(400).json({ error: 'pubKey required' });
  try {
    const result = await fundTestnetAccount(pubKey);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/stellar/network
router.get('/network', (req, res) => {
  res.json({
    network: process.env.STELLAR_NETWORK || 'TESTNET',
    horizonUrl: process.env.STELLAR_HORIZON_URL || 'https://horizon-testnet.stellar.org',
    explorerBase: 'https://stellar.expert/explorer/testnet',
  });
});

module.exports = router;
