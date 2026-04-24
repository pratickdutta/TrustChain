import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Circle } from '@/lib/models';
import { requireAuth, unauthorized } from '@/lib/apiAuth';

// PUT /api/pools/[id]/settings
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req);
  if (!auth) return unauthorized();
  const { id } = await params;

  await connectDB();
  const circle = await Circle.findById(id);
  if (!circle) return NextResponse.json({ error: 'Circle not found' }, { status: 404 });
  if (circle.creatorId !== auth.pubKey) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  const body = await req.json();
  const update: any = { isPool: true };
  if (body.openToOutside !== undefined) update.poolOpenToOutside = body.openToOutside;
  if (body.manualApproval !== undefined) update.poolManualApproval = body.manualApproval;
  if (body.minBorrowerScore !== undefined) update.poolMinBorrowerScore = body.minBorrowerScore;
  if (body.maxLoanPerBorrower !== undefined) update.poolMaxLoanPerBorrower = body.maxLoanPerBorrower;

  const updated = await Circle.findByIdAndUpdate(id, { $set: update }, { new: true });
  return NextResponse.json(updated);
}

// DELETE /api/pools/[id]/settings — disable pool
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req);
  if (!auth) return unauthorized();
  const { id } = await params;

  await connectDB();
  const circle = await Circle.findById(id);
  if (!circle) return NextResponse.json({ error: 'Circle not found' }, { status: 404 });
  if (circle.creatorId !== auth.pubKey) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  await Circle.findByIdAndUpdate(id, { $set: { isPool: false } });
  return NextResponse.json({ success: true });
}
