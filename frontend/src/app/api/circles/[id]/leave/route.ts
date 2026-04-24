import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Circle, Attestation } from '@/lib/models';
import { recalculateCircleMemberScores } from '@/lib/creditEngine';
import { requireAuth, unauthorized } from '@/lib/apiAuth';

// DELETE /api/circles/[id]/leave
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req);
  if (!auth) return unauthorized();
  const { id } = await params;

  await connectDB();
  const circle = await Circle.findById(id);
  if (!circle) return NextResponse.json({ error: 'Circle not found' }, { status: 404 });
  if (circle.creatorId === auth.pubKey) {
    return NextResponse.json({ error: 'Creator cannot leave; dissolve the circle instead' }, { status: 400 });
  }

  circle.members = circle.members.filter((m: string) => m !== auth.pubKey);
  await circle.save();
  await Attestation.deleteMany({
    circleId: id,
    $or: [{ fromUserId: auth.pubKey }, { toUserId: auth.pubKey }],
  });
  recalculateCircleMemberScores(id).catch(console.error);

  return NextResponse.json({ message: 'Left circle successfully' });
}
