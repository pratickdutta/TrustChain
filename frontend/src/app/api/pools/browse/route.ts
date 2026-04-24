import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Circle } from '@/lib/models';
import { requireAuth, unauthorized } from '@/lib/apiAuth';

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth) return unauthorized();

  await connectDB();
  const pools = await Circle.find({ isPool: true, isPublic: true });

  const formatted = pools.map(p => {
    const obj = p.toObject();
    obj.id = obj._id.toString();
    delete obj._id;
    return obj;
  });

  return NextResponse.json(formatted);
}
