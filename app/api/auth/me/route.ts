import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTokenFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const decoded = getTokenFromRequest(req);
    
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized', message: 'Missing or invalid token' }, { status: 401 });
    }
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        plan: true,
        emailVerified: true,
        createdAt: true
      }
    });
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized', message: 'User not found' }, { status: 401 });
    }
    
    return NextResponse.json({ success: true, user });
    
  } catch (error) {
    console.error('Auth /me error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to verify user' },
      { status: 500 }
    );
  }
}
