import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Circle, Attestation } from '@/lib/models';
import { computeScore } from '@/lib/creditEngine';
import { requireAuth, unauthorized } from '@/lib/apiAuth';

// POST /api/circles/[id]/attest
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req);
  if (!auth) return unauthorized();
  const { id } = await params;

  const { targetPubKey, weight } = await req.json();
  await connectDB();

  const circle = await Circle.findById(id);
  if (!circle) return NextResponse.json({ error: 'Circle not found' }, { status: 404 });
  if (!circle.members.includes(auth.pubKey)) return NextResponse.json({ error: 'Not a circle member' }, { status: 403 });
  if (!circle.members.includes(targetPubKey)) return NextResponse.json({ error: 'Target is not a circle member' }, { status: 400 });
  if (auth.pubKey === targetPubKey) return NextResponse.json({ error: 'Cannot attest yourself' }, { status: 400 });

  const attestWeight = Math.min(1.0, Math.max(0.1, parseFloat(weight) || 0.5));

  const attestation = await Attestation.findOneAndUpdate(
    { fromUserId: auth.pubKey, toUserId: targetPubKey, circleId: id },
    { weight: attestWeight, timeBonus: 0, credibilityBonus: 0, createdAt: new Date() },
    { upsert: true, new: true }
  );

  computeScore(auth.pubKey).catch(console.error);
  computeScore(targetPubKey).catch(console.error);

  return NextResponse.json({ message: 'Attestation recorded', attestation });
}
