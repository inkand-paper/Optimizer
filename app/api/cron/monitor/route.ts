import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { performCheck } from '@/lib/monitoring';
import { PLAN_LIMITS } from '@/lib/plans';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow more time for checking multiple URLs

const BATCH_SIZE = 10; // 10 concurrent checks — prevents timeout cascade when each probe takes up to 8s

export async function GET(request: Request) {
  try {
    // [PRODUCTION SECURE] Enforce Cron Secret to prevent unauthorized DoS
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response('Unauthorized', { status: 401 });
    }

    const now = new Date();

    // Fetch monitors with user plan so we can honour per-plan check intervals
    const monitors = await prisma.monitor.findMany({
      select: {
        id: true,
        url: true,
        lastChecked: true,
        user: { select: { plan: true } },
      },
    });

    // Filter: only check monitors whose interval has elapsed since lastChecked
    const dueMonitors = monitors.filter((m: {
      lastChecked: Date | null;
      user: { plan: string } | null;
    }) => {
      const plan = (m.user?.plan || 'FREE') as keyof typeof PLAN_LIMITS;
      const intervalMs = PLAN_LIMITS[plan].interval * 1000;
      if (!m.lastChecked) return true; // never checked — always due
      return now.getTime() - new Date(m.lastChecked).getTime() >= intervalMs;
    });
    
    if (dueMonitors.length === 0) {
      return NextResponse.json({ success: true, message: 'No monitors due for checking', checked: 0 });
    }

    // [PRODUCTION SCALE] Batch execution to prevent connection pool exhaustion and memory spikes
    let successful = 0;
    let failed = 0;

    for (let i = 0; i < dueMonitors.length; i += BATCH_SIZE) {
      const batch = dueMonitors.slice(i, i + BATCH_SIZE);
      const checkPromises = batch.map((monitor: { id: string; url: string }) => performCheck(monitor.id, monitor.url));
      
      const results = await Promise.allSettled(checkPromises);
      successful += results.filter((r: PromiseSettledResult<unknown>) => r.status === 'fulfilled').length;
      failed += results.filter((r: PromiseSettledResult<unknown>) => r.status === 'rejected').length;
    }

    return NextResponse.json({
      success: true,
      message: 'Monitoring cycle completed',
      total: monitors.length,
      checked: dueMonitors.length,
      successful,
      failed,
    });
  } catch (error) {
    console.error('Monitoring cron failed:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
