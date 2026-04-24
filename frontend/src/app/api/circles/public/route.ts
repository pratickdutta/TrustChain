import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Circle } from '@/lib/models';

// GET /api/circles/public - list public circles
export async function GET(req: NextRequest) {
  await connectDB();
  
  const publicCircles = await Circle.find({ isPublic: true, status: 'ACTIVE' }).limit(50);
  
  const formatted = publicCircles.map(c => ({
    id: c._id.toString(),
    name: c.name,
    description: c.description,
    memberCount: c.members.length,
    poolBalance: c.poolBalance,
    createdAt: c.createdAt,
    isPublic: c.isPublic,
    uci: c.uci,
  }));
  
  return NextResponse.json(formatted);
}
