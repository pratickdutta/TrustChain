import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Circle } from '@/lib/models';
import { recalculateCircleMemberScores } from '@/lib/creditEngine';
import { requireAuth, unauthorized } from '@/lib/apiAuth';

// POST /api/circles/[id]/join
// Public circles: join immediately
// Private circles: adds to pendingJoinRequests, owner must approve
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req);
  if (!auth) return unauthorized();
  const { id } = await params;

  const body = await req.json().catch(() => ({}));
  const { inviteCode } = body;

  await connectDB();
  const circle = await Circle.findById(id);
  if (!circle) return NextResponse.json({ error: 'Circle not found' }, { status: 404 });

  if (circle.members.includes(auth.pubKey)) {
    return NextResponse.json({ error: 'Already a member' }, { status: 400 });
  }
  if ((circle.pendingJoinRequests || []).includes(auth.pubKey)) {
    return NextResponse.json({ error: 'Join request already pending — awaiting owner approval' }, { status: 400 });
  }
  if (circle.members.length >= 20) {
    return NextResponse.json({ error: 'Circle is full (max 20 members)' }, { status: 400 });
  }

  // Use invite code to bypass approval
  if (inviteCode && inviteCode === circle.inviteCode) {
    circle.members.push(auth.pubKey);
    await circle.save();
    recalculateCircleMemberScores(id).catch(console.error);
    return NextResponse.json({ message: 'Joined circle successfully via invite code', status: 'JOINED' });
  }

  // Otherwise, add to pending queue for owner approval (even if public, public just means listed in search)
  if (!circle.pendingJoinRequests) circle.pendingJoinRequests = [];
  circle.pendingJoinRequests.push(auth.pubKey);
  await circle.save();
  return NextResponse.json({ message: 'Join request sent. Awaiting owner approval.', status: 'PENDING' });
}
