import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTokenFromRequest } from '@/lib/auth';
import { PLAN_LIMITS, PlanType } from '@/lib/plans';
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

    // [MONETIZATION] Enforce Plan Limits
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { 
        role: true,
        plan: true,
        _count: {
          select: { webhooks: true }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.role !== 'ADMIN') {
      const planLimit = PLAN_LIMITS[user.plan as PlanType].webhooks;
      if (user._count.webhooks >= planLimit) {
        return NextResponse.json({ 
          error: 'Limit Reached', 
          message: `Your ${user.plan} plan is limited to ${planLimit} webhooks. Please upgrade to add more endpoints.` 
        }, { status: 403 });
      }
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
