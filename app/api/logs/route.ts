import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTokenFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const decoded = getTokenFromRequest(req);
    
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Fetch user to check role
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    // Admins see their own logs + anonymous system telemetry
    const whereClause = user.role === 'ADMIN'
      ? { OR: [{ userId: decoded.userId }, { userId: null, type: 'SYSTEM_TELEMETRY' }] }
      : { userId: decoded.userId };

    const logs = await prisma.activityLog.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: 50 // Limit to last 50 logs
    });
    
    return NextResponse.json({ success: true, logs });
  } catch (error) {
    console.error('Fetch logs error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
