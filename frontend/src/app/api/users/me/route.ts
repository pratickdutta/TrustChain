import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User, Score, Circle, Loan } from '@/lib/models';
import { requireAuth, unauthorized } from '@/lib/apiAuth';

// GET /api/users/me
export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth) return unauthorized();

  await connectDB();
  const user = await User.findOne({ stellarPublicKey: auth.pubKey });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const score = await Score.findOne({ userId: auth.pubKey });
  const circles = await Circle.find({ members: auth.pubKey });
  const loans = await Loan.find({ borrowerId: auth.pubKey });

  return NextResponse.json({
    ...user.toObject(),
    score: score || null,
    circles: circles.map(c => ({ id: c._id, name: c.name, memberCount: c.members.length })),
    loans: loans.map(l => ({ id: l._id, amount: l.amount, status: l.status, dueDate: l.dueDate })),
  });
}

// PUT /api/users/me
export async function PUT(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth) return unauthorized();

  const { displayName, avatarUrl } = await req.json();
  await connectDB();

  const user = await User.findOneAndUpdate(
    { stellarPublicKey: auth.pubKey },
    { ...(displayName && { displayName: displayName.slice(0, 50) }), ...(avatarUrl && { avatarUrl }) },
    { new: true }
  );

  return NextResponse.json(user);
}
