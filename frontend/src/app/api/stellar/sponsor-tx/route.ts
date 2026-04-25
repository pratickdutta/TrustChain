import { NextRequest, NextResponse } from 'next/server';
import {
  Keypair,
  TransactionBuilder,
  Networks,
  FeeBumpTransaction,
  Transaction,
} from '@stellar/stellar-sdk';
import { Horizon } from '@stellar/stellar-sdk';
import { verifyToken } from '@/lib/apiAuth';

const HORIZON_URL = process.env.STELLAR_HORIZON_URL || 'https://horizon-testnet.stellar.org';
const SPONSOR_SECRET = process.env.STELLAR_SPONSOR_SECRET_KEY || '';

const server = new Horizon.Server(HORIZON_URL);

/**
 * POST /api/stellar/sponsor-tx
 *
 * Advanced Feature: Fee Bump (Gasless) Transaction Sponsorship
 *
 * How it works:
 * 1. The client builds a regular Stellar transaction and signs it with their Freighter wallet.
 * 2. The client sends the signed XDR envelope to this endpoint.
 * 3. The server wraps it in a FeeBumpTransaction, which pays the network fee on behalf of the user.
 * 4. The server signs and submits the fee-bump transaction to Horizon.
 * 5. The user's loan/payment is recorded on-chain WITHOUT them spending any XLM for gas.
 *
 * This implements the Stellar SEP Gasless pattern using the FeeBump Transaction type.
 */
export async function POST(req: NextRequest) {
  // Auth guard
  const auth = verifyToken(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!SPONSOR_SECRET) {
    return NextResponse.json(
      { error: 'Sponsorship not configured on this server. Set STELLAR_SPONSOR_SECRET_KEY.' },
      { status: 503 }
    );
  }

  try {
    const { signedXdr } = await req.json();
    if (!signedXdr) {
      return NextResponse.json({ error: 'signedXdr is required' }, { status: 400 });
    }

    // Parse the inner signed transaction from the user
    const innerTx = new Transaction(signedXdr, Networks.TESTNET);
    const sponsorKeypair = Keypair.fromSecret(SPONSOR_SECRET);

    // Build the Fee Bump wrapper - the sponsor pays all network fees
    const feeBumpTx = TransactionBuilder.buildFeeBumpTransaction(
      sponsorKeypair,         // Sponsor pays the fee
      '200',                  // Max fee in stroops (0.00002 XLM = negligible)
      innerTx,                // The user's original signed transaction
      Networks.TESTNET
    );

    // Sign the FeeBump envelope with the protocol's treasury key
    feeBumpTx.sign(sponsorKeypair);

    // Submit the wrapped transaction to the Stellar network
    const result = await server.submitTransaction(feeBumpTx);

    return NextResponse.json({
      success: true,
      hash: result.hash,
      sponsored: true,
      message: 'Transaction sponsored and submitted successfully. No XLM gas fees charged to user.',
      explorerLink: `https://stellar.expert/explorer/testnet/tx/${result.hash}`,
    });
  } catch (err: any) {
    const stellarError = err?.response?.data?.extras?.result_codes;
    return NextResponse.json(
      {
        error: stellarError
          ? `Stellar Error: ${JSON.stringify(stellarError)}`
          : err.message || 'Sponsorship failed',
      },
      { status: 500 }
    );
  }
}
