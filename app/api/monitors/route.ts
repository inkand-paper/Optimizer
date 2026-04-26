import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTokenFromRequest } from '@/lib/auth';
import { performCheck } from '@/lib/monitoring';
import { PLAN_LIMITS, PlanType } from '@/lib/plans';
import { z } from 'zod';

const createMonitorSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name cannot exceed 100 characters"),
  url: z.string().url("Must be a valid URL").max(2048, "URL cannot exceed 2048 characters")
});

export async function GET(req: NextRequest) {
  try {
    const decoded = getTokenFromRequest(req);
    
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const monitors = await prisma.monitor.findMany({
      where: { userId: decoded.userId },
      include: {
        checks: {
          orderBy: { createdAt: 'desc' },
          take: 40
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Proactive Health Checks: If last check is older than 30s, trigger a fresh one in the background
    try {
      const thirtySecondsAgo = new Date(Date.now() - 30 * 1000);
      monitors.forEach(monitor => {
        const needsCheck = !monitor.lastChecked || new Date(monitor.lastChecked) < thirtySecondsAgo;
        
        if (needsCheck) {
          console.log(`[PROACTIVE] Triggering check for ${monitor.name}`);
          // Fire and forget background check - completely isolated
          performCheck(monitor.id, monitor.url).catch(err => 
            console.error(`[PROACTIVE ERROR] ${monitor.name}:`, err)
          );
        }
      });
    } catch (proactiveError) {
      console.error('[PROACTIVE SYSTEM ERROR]:', proactiveError);
      // We don't return 500 here because the data fetch was successful
    }
    
    return NextResponse.json({ success: true, monitors });
  } catch (error) {
    console.error('CRITICAL ERROR Fetching Monitors:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      message: error instanceof Error ? error.message : 'Unknown database error' 
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const decoded = getTokenFromRequest(req);
    
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await req.json();
    
    // [PRODUCTION SECURE] Strict payload validation
    const parsedResult = createMonitorSchema.safeParse(body);
    if (!parsedResult.success) {
      return NextResponse.json({ 
        error: 'Bad Request', 
        message: parsedResult.error.errors[0].message 
      }, { status: 400 });
    }

    const { name, url } = parsedResult.data;


    // [MONETIZATION] Enforce Plan Limits
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { 
        role: true,
        plan: true,
        _count: {
          select: { monitors: true }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Admins have unlimited monitors
    if (user.role !== 'ADMIN') {
      const planLimit = PLAN_LIMITS[user.plan as PlanType].monitors;
      if (user._count.monitors >= planLimit) {
        return NextResponse.json({ 
          error: 'Limit Reached', 
          message: `Your ${user.plan} plan is limited to ${planLimit} monitors. Please upgrade to add more targets.` 
        }, { status: 403 });
      }
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
