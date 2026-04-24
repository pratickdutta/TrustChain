import { NextRequest, NextResponse } from 'next/server';
import { Horizon } from '@stellar/stellar-sdk';

const HORIZON_URL = process.env.STELLAR_HORIZON_URL || 'https://horizon-testnet.stellar.org';
const EXPLORER_BASE = 'https://stellar.expert/explorer/testnet';

const server = new Horizon.Server(HORIZON_URL);

async function getAccountInfo(pubKey: string) {
  try {
    const account = await server.loadAccount(pubKey);
    const xlmBalance = account.balances.find((b: any) => b.asset_type === 'native');
    const trustBalance = account.balances.find((b: any) => b.asset_code === 'TRUST');
    return {
      exists: true,
      xlmBalance: parseFloat(xlmBalance?.balance || '0'),
      trustBalance: parseFloat(trustBalance?.balance || '0'),
      sequence: account.sequence,
    };
  } catch {
    return { exists: false, xlmBalance: 0, trustBalance: 0 };
  }
}

// GET /api/stellar/account/[pubKey]
export async function GET(req: NextRequest, { params }: { params: Promise<{ pubKey: string }> }) {
  const { pubKey } = await params;
  try {
    const info = await getAccountInfo(pubKey);
    return NextResponse.json({ ...info, explorerLink: `${EXPLORER_BASE}/account/${pubKey}` });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
