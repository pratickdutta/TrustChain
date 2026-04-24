import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Circle } from '@/lib/models';
import { recalculateCircleMemberScores } from '@/lib/creditEngine';
import { requireAuth, unauthorized } from '@/lib/apiAuth';

// POST /api/circles/[id]/approve-join
// Body: { targetPubKey: string, action: 'APPROVE' | 'REJECT' }
// Only circle owner can call this
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req);
  if (!auth) return unauthorized();
  const { id } = await params;

  const { targetPubKey, action } = await req.json();
  if (!targetPubKey || !action) {
    return NextResponse.json({ error: 'targetPubKey and action required' }, { status: 400 });
  }
  if (!['APPROVE', 'REJECT'].includes(action)) {
    return NextResponse.json({ error: 'action must be APPROVE or REJECT' }, { status: 400 });
  }

  await connectDB();
  const circle = await Circle.findById(id);
  if (!circle) return NextResponse.json({ error: 'Circle not found' }, { status: 404 });
  if (circle.creatorId !== auth.pubKey) {
    return NextResponse.json({ error: 'Only the circle owner can approve join requests' }, { status: 403 });
  }

  const pending = circle.pendingJoinRequests || [];
  if (!pending.includes(targetPubKey)) {
    return NextResponse.json({ error: 'No pending request from this user' }, { status: 404 });
  }

  // Remove from pending
  circle.pendingJoinRequests = pending.filter((k: string) => k !== targetPubKey);

  if (action === 'APPROVE') {
    if (circle.members.length >= 20) {
      await circle.save();
      return NextResponse.json({ error: 'Circle is full' }, { status: 400 });
    }
    circle.members.push(targetPubKey);
    await circle.save();
    recalculateCircleMemberScores(id).catch(console.error);
    return NextResponse.json({ message: 'Member approved and added to circle', status: 'APPROVED' });
  } else {
    await circle.save();
    return NextResponse.json({ message: 'Join request rejected', status: 'REJECTED' });
  }
}
