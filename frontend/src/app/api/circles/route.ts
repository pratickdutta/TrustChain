import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Circle, Attestation } from '@/lib/models';
import { computeScore } from '@/lib/creditEngine';
import { requireAuth, unauthorized } from '@/lib/apiAuth';
import { v4 as uuidv4 } from 'uuid';

// GET /api/circles — list user's circles
export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth) return unauthorized();
  await connectDB();
  const circles = await Circle.find({ members: auth.pubKey });
  return NextResponse.json(circles);
}

// POST /api/circles — create a circle
export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth) return unauthorized();

  const { name, description, isPublic } = await req.json();
  if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 });

  await connectDB();

  const circle = await Circle.create({
    name,
    description,
    isPublic: isPublic !== false,
    creatorId: auth.pubKey,
    members: [auth.pubKey],
    status: 'ACTIVE',
    inviteCode: Math.random().toString(36).slice(2, 10).toUpperCase(),
  });

  computeScore(auth.pubKey).catch(console.error);

  return NextResponse.json(circle, { status: 201 });
}
