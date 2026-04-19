import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJwt } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized', message: 'Missing token' }, { status: 401 });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = verifyJwt(token);
    
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized', message: 'Invalid or expired token' }, { status: 401 });
    }
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
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
