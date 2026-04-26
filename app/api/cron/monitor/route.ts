import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { performCheck } from '@/lib/monitoring';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow more time for checking multiple URLs

const BATCH_SIZE = 50;

export async function GET(request: Request) {
  try {
    // [PRODUCTION SECURE] Enforce Cron Secret to prevent unauthorized DoS
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response('Unauthorized', { status: 401 });
    }

    const monitors = await prisma.monitor.findMany({
      select: { id: true, url: true }
    });
    
    if (monitors.length === 0) {
      return NextResponse.json({ success: true, message: 'No active monitors found', checked: 0 });
    }

    // [PRODUCTION SCALE] Batch execution to prevent connection pool exhaustion and memory spikes
    let successful = 0;
    let failed = 0;

    for (let i = 0; i < monitors.length; i += BATCH_SIZE) {
      const batch = monitors.slice(i, i + BATCH_SIZE);
      const checkPromises = batch.map(monitor => performCheck(monitor.id, monitor.url));
      
      const results = await Promise.allSettled(checkPromises);
      successful += results.filter(r => r.status === 'fulfilled').length;
      failed += results.filter(r => r.status === 'rejected').length;
    }

    return NextResponse.json({
      success: true,
      message: 'Monitoring cycle completed',
      checked: monitors.length,
      successful,
      failed
    });
  } catch (error) {
    console.error('Monitoring cron failed:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
