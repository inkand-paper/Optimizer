import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJwt } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const decoded = verifyJwt(authHeader.split(' ')[1]);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const logs = await prisma.activityLog.findMany({
      where: { userId: decoded.userId },
      orderBy: { createdAt: 'desc' },
      take: 50 // Limit to last 50 logs
    });
    
    return NextResponse.json({ success: true, logs });
  } catch (error) {
    console.error('Fetch logs error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
