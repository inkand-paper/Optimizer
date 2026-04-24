import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { performCheck } from '@/lib/monitoring';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow more time for checking multiple URLs

export async function GET(request: Request) {
  try {
    // Optional: Protect this route with a secret key
    // const authHeader = request.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //   return new Response('Unauthorized', { status: 401 });
    // }

    const monitors = await prisma.monitor.findMany();
    
    if (monitors.length === 0) {
      return NextResponse.json({ success: true, message: 'No active monitors found', checked: 0 });
    }

    const checkPromises = monitors.map(monitor => performCheck(monitor.id, monitor.url));
    const results = await Promise.allSettled(checkPromises);

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

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
