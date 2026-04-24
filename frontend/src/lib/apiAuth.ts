import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET || 'trustchain-secret-dev-only';

export interface AuthPayload {
  pubKey: string;
  userId: string;
}

export function getAuthPayload(req: NextRequest): AuthPayload | null {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  try {
    return jwt.verify(token, JWT_SECRET) as AuthPayload;
  } catch {
    return null;
  }
}

export function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

export function requireAuth(req: NextRequest): AuthPayload | null {
  return getAuthPayload(req);
}

export function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}
