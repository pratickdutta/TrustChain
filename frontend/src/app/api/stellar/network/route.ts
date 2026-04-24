import { NextRequest, NextResponse } from 'next/server';

// GET /api/stellar/network
export async function GET(req: NextRequest) {
  return NextResponse.json({
    network: process.env.STELLAR_NETWORK || 'TESTNET',
    horizonUrl: process.env.STELLAR_HORIZON_URL || 'https://horizon-testnet.stellar.org',
    explorerBase: 'https://stellar.expert/explorer/testnet',
  });
}
