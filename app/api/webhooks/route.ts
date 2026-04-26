import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJwt } from '@/lib/auth';
import crypto from 'crypto';

export async function GET(req: NextRequest) {
  try {
    const decoded = getTokenFromRequest(req);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const webhooks = await prisma.webhook.findMany({
      where: { userId: decoded.userId },
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json({ success: true, webhooks });
  } catch (error) {
    console.error('Fetch webhooks error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const decoded = getTokenFromRequest(req);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { url, events } = await req.json();
    
    if (!url || !events || !Array.isArray(events)) {
      return NextResponse.json({ error: 'Bad Request', message: 'URL and events array are required' }, { status: 400 });
    }
    
    // Generate a secret for signing
    const secret = crypto.randomBytes(32).toString('hex');
    
    const webhook = await prisma.webhook.create({
      data: {
        url,
        events,
        secret,
        userId: decoded.userId
      }
    });
    
    return NextResponse.json({ success: true, webhook }, { status: 201 });
  } catch (error) {
    console.error('Create webhook error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
