import { NextRequest, NextResponse } from 'next/server';
import { StrKey } from '@stellar/stellar-sdk';
import { v4 as uuidv4 } from 'uuid';
import { connectDB } from '@/lib/mongodb';
import { Nonce } from '@/lib/models';

export async function POST(req: NextRequest) {
  try {
    const { pubKey } = await req.json();
    if (!pubKey) return NextResponse.json({ error: 'pubKey required' }, { status: 400 });
    if (!StrKey.isValidEd25519PublicKey(pubKey)) {
      return NextResponse.json({ error: 'Invalid Stellar public key' }, { status: 400 });
    }

    await connectDB();
    const nonce = `TrustChain-${uuidv4()}-${Date.now()}`;
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await Nonce.findOneAndUpdate(
      { pubKey },
      { nonce, expiresAt },
      { upsert: true }
    );

    return NextResponse.json({ nonce, message: `Sign this message to authenticate: ${nonce}` });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
