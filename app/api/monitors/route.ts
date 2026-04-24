import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJwt } from '@/lib/auth';
import { performCheck } from '@/lib/monitoring';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = verifyJwt(token);
    
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const monitors = await prisma.monitor.findMany({
      where: { userId: decoded.userId },
      include: {
        checks: {
          orderBy: { createdAt: 'desc' },
          take: 30
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json({ success: true, monitors });
  } catch (error) {
    console.error('Fetch monitors error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = verifyJwt(token);
    
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await req.json();
    const { name, url } = body;
    
    if (!name || !url) {
      return NextResponse.json({ error: 'Bad Request', message: 'Name and URL are required' }, { status: 400 });
    }
    
    const monitor = await prisma.monitor.create({
      data: {
        name,
        url,
        userId: decoded.userId,
        status: 'UP'
      }
    });

    // Perform initial check
    try {
      await performCheck(monitor.id, url);
    } catch (checkError) {
      console.error('Initial monitor check failed:', checkError);
    }
    
    return NextResponse.json({ success: true, monitor }, { status: 201 });
  } catch (error) {
    console.error('Create monitor error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
