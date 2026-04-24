import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Circle, User, Score, Attestation } from '@/lib/models';
import { computeScore, recalculateCircleMemberScores } from '@/lib/creditEngine';
import { requireAuth, unauthorized } from '@/lib/apiAuth';

// GET /api/circles/[id]
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req);
  if (!auth) return unauthorized();
  const { id } = await params;

  await connectDB();
  let circle;
  try {
    circle = await Circle.findById(id);
  } catch (e) {
    return NextResponse.json({ error: 'Invalid circle ID' }, { status: 400 });
  }
  if (!circle) return NextResponse.json({ error: 'Circle not found' }, { status: 404 });

  const enrichedMembers = await Promise.all(circle.members.map(async (pubKey: string) => {
    const user = await User.findOne({ stellarPublicKey: pubKey });
    const score = await Score.findOne({ userId: pubKey });
    const attestCount = await Attestation.countDocuments({ toUserId: pubKey, circleId: id });
    return {
      stellarPublicKey: pubKey,
      displayName: user?.displayName || pubKey.slice(0, 8) + '...',
      score: score?.totalScore || 0,
      tier: score?.tier || 'establishing',
      role: pubKey === circle.creatorId ? 'creator' : 'member',
      attestationCount: attestCount,
    };
  }));

  // Enrich pending join requests (name + pubkey)
  const enrichedPendingRequests = await Promise.all(
    (circle.pendingJoinRequests || []).map(async (pubKey: string) => {
      const user = await User.findOne({ stellarPublicKey: pubKey });
      const score = await Score.findOne({ userId: pubKey });
      return {
        stellarPublicKey: pubKey,
        displayName: user?.displayName || pubKey.slice(0, 8) + '...',
        score: score?.totalScore || 0,
        tier: score?.tier || 'establishing',
      };
    })
  );

  const formatted = circle.toObject();
  formatted.id = formatted._id.toString();
  delete formatted._id;

  return NextResponse.json({ ...formatted, enrichedMembers, enrichedPendingRequests });
}

// PATCH /api/circles/[id] — owner edits name, description, rules, borrowApprovalEnabled
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req);
  if (!auth) return unauthorized();
  const { id } = await params;

  await connectDB();
  const circle = await Circle.findById(id);
  if (!circle) return NextResponse.json({ error: 'Circle not found' }, { status: 404 });
  if (circle.creatorId !== auth.pubKey)
    return NextResponse.json({ error: 'Only the circle owner can edit settings' }, { status: 403 });

  const body = await req.json();

  // Validate borrowApprovalEnabled — Platinum only
  if (body.borrowApprovalEnabled === true) {
    const score = await Score.findOne({ userId: auth.pubKey });
    if (score?.tier !== 'platinum') {
      return NextResponse.json({ error: 'Borrow approval requires Platinum tier' }, { status: 403 });
    }
  }

  const allowedFields: any = {};
  if (body.name !== undefined && body.name.trim()) allowedFields.name = body.name.trim();
  if (body.description !== undefined) allowedFields.description = body.description;
  if (body.circleRules !== undefined) allowedFields.circleRules = body.circleRules;
  if (body.socialLink !== undefined) allowedFields.socialLink = body.socialLink;
  if (body.isPublic !== undefined) allowedFields.isPublic = body.isPublic;
  if (body.borrowApprovalEnabled !== undefined) allowedFields.borrowApprovalEnabled = body.borrowApprovalEnabled;

  const updated = await Circle.findByIdAndUpdate(id, { $set: allowedFields }, { new: true });
  
  const formatted = updated.toObject();
  formatted.id = formatted._id.toString();
  delete formatted._id;

  return NextResponse.json(formatted);
}

// DELETE /api/circles/[id] — owner deletes circle
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req);
  if (!auth) return unauthorized();
  const { id } = await params;

  await connectDB();
  const circle = await Circle.findById(id);
  if (!circle) return NextResponse.json({ error: 'Circle not found' }, { status: 404 });
  if (circle.creatorId !== auth.pubKey) {
    return NextResponse.json({ error: 'Only the circle owner can delete this circle' }, { status: 403 });
  }

  const members = [...circle.members];

  // Delete the circle and its specific attestations
  await Circle.findByIdAndDelete(id);
  await Attestation.deleteMany({ circleId: id });

  // Re-compute scores for all former members since their attestations changed
  for (const member of members) {
    await computeScore(member);
  }

  return NextResponse.json({ success: true });
}
