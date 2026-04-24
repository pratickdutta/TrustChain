import { NextRequest, NextResponse } from 'next/server';
import { StrKey } from '@stellar/stellar-sdk';
import { v4 as uuidv4 } from 'uuid';
import { connectDB } from '@/lib/mongodb';
import { User, Nonce } from '@/lib/models';
import { computeScore } from '@/lib/creditEngine';
import { signToken } from '@/lib/apiAuth';

export async function POST(req: NextRequest) {
  try {
    const { pubKey, nonce } = await req.json();
    if (!pubKey) return NextResponse.json({ error: 'pubKey required' }, { status: 400 });
    if (!StrKey.isValidEd25519PublicKey(pubKey)) {
      return NextResponse.json({ error: 'Invalid Stellar public key' }, { status: 400 });
    }

    await connectDB();

    // Verify nonce
    const nonceDoc = await Nonce.findOne({ pubKey });
    if (!nonceDoc || nonceDoc.nonce !== nonce) {
      if (nonceDoc && new Date(nonceDoc.expiresAt) < new Date()) {
        return NextResponse.json({ error: 'Nonce expired, please try again' }, { status: 400 });
      }
    }
    await Nonce.deleteOne({ pubKey });

    // Create or retrieve user
    let user = await User.findOne({ stellarPublicKey: pubKey });
    let isNew = false;
    if (!user) {
      isNew = true;
      user = await User.create({
        stellarPublicKey: pubKey,
        displayName: `User_${pubKey.slice(0, 6)}`,
        createdAt: new Date(),
        lastActiveAt: new Date(),
        kycLevel: 0,
        trustTokens: 0,
      });
    } else {
      await User.updateOne({ stellarPublicKey: pubKey }, { lastActiveAt: new Date() });
    }

    if (isNew) {
      await computeScore(pubKey).catch(console.error);
    }

    const token = signToken({ pubKey, userId: user._id.toString() });
    return NextResponse.json({ token, user });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
