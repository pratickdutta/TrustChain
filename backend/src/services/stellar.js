const { Horizon, Networks, Asset, TransactionBuilder, Operation, Memo, BASE_FEE, Keypair } = require('@stellar/stellar-sdk');

const HORIZON_URL = process.env.STELLAR_HORIZON_URL || 'https://horizon-testnet.stellar.org';
const NETWORK = process.env.STELLAR_NETWORK === 'MAINNET' ? Networks.PUBLIC : Networks.TESTNET;

const server = new Horizon.Server(HORIZON_URL);

/**
 * Fetch account info from Stellar testnet
 */
async function getAccountInfo(pubKey) {
  try {
    const account = await server.loadAccount(pubKey);
    const xlmBalance = account.balances.find(b => b.asset_type === 'native');
    const trustBalance = account.balances.find(
      b => b.asset_code === process.env.TRUST_ASSET_CODE
    );

    return {
      publicKey: pubKey,
      xlmBalance: xlmBalance ? parseFloat(xlmBalance.balance) : 0,
      trustBalance: trustBalance ? parseFloat(trustBalance.balance) : 0,
      sequence: account.sequenceNumber(),
      subentryCount: account.subentry_count,
      exists: true,
    };
  } catch (err) {
    if (err.response && err.response.status === 404) {
      return { publicKey: pubKey, xlmBalance: 0, trustBalance: 0, exists: false };
    }
    throw err;
  }
}

/**
 * Get recent transactions for an account
 */
async function getRecentTransactions(pubKey, limit = 10) {
  try {
    const payments = await server.payments()
      .forAccount(pubKey)
      .limit(limit)
      .order('desc')
      .call();

    return payments.records.map(p => ({
      id: p.id,
      type: p.type,
      amount: p.amount || '0',
      asset: p.asset_type === 'native' ? 'XLM' : `${p.asset_code}/${p.asset_issuer}`,
      from: p.from,
      to: p.to,
      createdAt: p.created_at,
      transactionHash: p.transaction_hash,
    }));
  } catch (err) {
    return [];
  }
}

/**
 * Fund a testnet account using Friendbot
 */
async function fundTestnetAccount(pubKey) {
  try {
    const response = await fetch(
      `https://friendbot.stellar.org?addr=${encodeURIComponent(pubKey)}`
    );
    const result = await response.json();
    return { success: true, result };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Get Stellar testnet explorer link
 */
function getExplorerLink(txHash) {
  return `https://stellar.expert/explorer/testnet/tx/${txHash}`;
}

function getAccountExplorerLink(pubKey) {
  return `https://stellar.expert/explorer/testnet/account/${pubKey}`;
}

module.exports = {
  server,
  NETWORK,
  getAccountInfo,
  getRecentTransactions,
  fundTestnetAccount,
  getExplorerLink,
  getAccountExplorerLink,
};
