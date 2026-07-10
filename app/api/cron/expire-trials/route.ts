import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Called daily by Vercel Cron — expires student trials and downgrades plan
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const now = new Date();

    // Find expired trials where user is still on PRO
    const expiredTrials = await prisma.studentTrial.findMany({
      where: { expiresAt: { lt: now } },
      include: { user: true },
    });

    // Downgrade each expired trial user (if they haven't paid in the meantime)
    // Only downgrade if they have no active subscriptionId (i.e. not a paying customer)
    const toDowngrade = expiredTrials.filter(
      (t: { user: { plan: string; subscriptionId: string | null } }) =>
        t.user.plan === 'PRO' && !t.user.subscriptionId
    );

    if (toDowngrade.length > 0) {
      await prisma.user.updateMany({
        where: { id: { in: toDowngrade.map((t: { userId: string }) => t.userId) } },
        data: { plan: 'FREE' as never },
      });
      console.log(`[CRON] Expired ${toDowngrade.length} student trial(s) → downgraded to FREE`);
    }

    // Also auto-deactivate promotions past their end date
    const deactivated = await prisma.promotion.updateMany({
      where: { isActive: true, endsAt: { lt: now } },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      trialsExpired: toDowngrade.length,
      promotionsDeactivated: deactivated.count,
    });
  } catch (error) {
    console.error('[CRON] expire-trials error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
