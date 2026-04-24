import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Circle } from '@/lib/models';
import { recalculateCircleMemberScores } from '@/lib/creditEngine';
import { requireAuth, unauthorized } from '@/lib/apiAuth';

// POST /api/circles/[id]/join
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req);
  if (!auth) return unauthorized();
  const { id } = await params;

  const { inviteCode } = await req.json().catch(() => ({}));
  await connectDB();
  const circle = await Circle.findById(id);
  if (!circle) return NextResponse.json({ error: 'Circle not found' }, { status: 404 });

  if (!circle.isPublic && inviteCode !== circle.inviteCode) {
    return NextResponse.json({ error: 'Invalid invite code' }, { status: 403 });
  }
  if (circle.members.includes(auth.pubKey)) {
    return NextResponse.json({ error: 'Already a member' }, { status: 400 });
  }
  if (circle.members.length >= 20) {
    return NextResponse.json({ error: 'Circle is full' }, { status: 400 });
  }

  circle.members.push(auth.pubKey);
  await circle.save();
  recalculateCircleMemberScores(id).catch(console.error);

  return NextResponse.json({ message: 'Joined circle successfully', circle });
}
