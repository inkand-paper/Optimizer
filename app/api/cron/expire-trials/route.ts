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

    // ── 1. Send reminder emails for trials expiring in 1–3 days ─────────────
    const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const in1Day  = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);

    const soonExpiring = await prisma.studentTrial.findMany({
      where: {
        status: 'APPROVED',
        expiresAt: { gt: now, lte: in3Days },
      },
      include: { user: { select: { email: true, name: true, subscriptionId: true } } },
    });

    const { sendStudentTrialReminderEmail } = await import('@/lib/mail');

    let remindersSent = 0;
    for (const trial of soonExpiring) {
      // Skip users who have already paid
      if (trial.user.subscriptionId) continue;
      if (!trial.expiresAt) continue;

      const msLeft = trial.expiresAt.getTime() - now.getTime();
      const daysLeft = Math.ceil(msLeft / (24 * 60 * 60 * 1000));

      // Only send on exact day-boundaries (1 day out or 3 days out) to avoid spam
      if (daysLeft === 3 || daysLeft === 1) {
        const expiresAt = trial.expiresAt.toLocaleDateString('en-US', {
          year: 'numeric', month: 'long', day: 'numeric',
        });
        sendStudentTrialReminderEmail({
          email: trial.user.email,
          userName: trial.user.name || 'Student',
          expiresAt,
          daysLeft,
        }).catch(console.error);
        remindersSent++;
      }
    }

    // ── 2. Expire trials and downgrade plan ──────────────────────────────────
    const expiredTrials = await prisma.studentTrial.findMany({
      where: { status: 'APPROVED', expiresAt: { lt: now } },
      include: { user: true },
    });

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

      // Send "trial ended" notification to each downgraded user
      const { sendStudentTrialExpiredEmail } = await import('@/lib/mail');
      for (const t of toDowngrade) {
        sendStudentTrialExpiredEmail({
          email: t.user.email,
          userName: t.user.name || 'Student',
        }).catch(console.error);
      }
    }

    // ── 3. Auto-deactivate promotions past their end date ────────────────────
    const deactivated = await prisma.promotion.updateMany({
      where: { isActive: true, endsAt: { lt: now } },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      remindersSent,
      trialsExpired: toDowngrade.length,
      promotionsDeactivated: deactivated.count,
    });
  } catch (error) {
    console.error('[CRON] expire-trials error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

