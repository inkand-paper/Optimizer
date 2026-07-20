import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Called every Monday at 8am UTC via cron-job.org
// Sends weekly digest to all users with weeklyDigestEnabled = true
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const now = new Date();
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const weekStartLabel = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const weekEndLabel = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    // Find all users with digest enabled who haven't received one in the last 6 days
    // (6-day window prevents double-sends if cron fires slightly early)
    const sixDaysAgo = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
    const users = await prisma.user.findMany({
      where: {
        weeklyDigestEnabled: true,
        emailVerified: { not: null },
        OR: [
          { lastDigestSentAt: null },
          { lastDigestSentAt: { lt: sixDaysAgo } },
        ],
      },
      select: {
        id: true,
        email: true,
        name: true,
        monitors: {
          where: { isPublic: true },
          select: {
            id: true,
            name: true,
            url: true,
            status: true,
            checks: {
              where: { createdAt: { gte: weekStart } },
              select: { status: true, latency: true },
            },
          },
        },
        codeReviews: {
          where: {
            createdAt: { gte: weekStart },
            status: 'COMPLETED',
          },
          select: {
            repoName: true,
            score: true,
            language: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nextjs-optimizer-suite.vercel.app';
    const { sendWeeklyDigestEmail } = await import('@/lib/mail');

    let sent = 0;
    let skipped = 0;

    for (const user of users) {
      // Skip users with no activity at all this week (no monitors + no audits)
      if (user.monitors.length === 0 && user.codeReviews.length === 0) {
        skipped++;
        continue;
      }

      // Build monitor summaries
      const monitorSummaries = user.monitors.map((m: {
        id: string; name: string; url: string; status: string;
        checks: { status: string; latency: number | null }[];
      }) => {
        const total = m.checks.length;
        const up = m.checks.filter((c: { status: string }) => c.status === 'UP').length;
        const down = m.checks.filter((c: { status: string }) => c.status === 'DOWN').length;
        const withLatency = m.checks.filter((c: { status: string; latency: number | null }) => c.latency !== null);
        const avgLatency = withLatency.length > 0
          ? Math.round(withLatency.reduce((s: number, c: { latency: number | null }) => s + (c.latency || 0), 0) / withLatency.length)
          : null;

        return {
          name: m.name,
          url: m.url,
          status: m.status,
          uptimePct: total > 0 ? Math.round((up / total) * 1000) / 10 : null,
          avgLatency,
          incidents: down,
        };
      });

      // Build audit summaries with grade
      const auditSummaries = user.codeReviews.map((r: {
        repoName: string | null; score: number | null; language: string | null; createdAt: Date;
      }) => {
        const score = r.score || 0;
        const grade = score >= 90 ? 'A' : score >= 75 ? 'B' : score >= 60 ? 'C' : 'D';
        return {
          repoName: r.repoName || 'Code Snippet',
          score,
          grade,
          language: r.language || 'Unknown',
          createdAt: r.createdAt.toISOString(),
        };
      });

      const totalIncidents = monitorSummaries.reduce((s: number, m: { incidents: number }) => s + m.incidents, 0);

      try {
        await sendWeeklyDigestEmail({
          email: user.email,
          userName: user.name || 'there',
          weekStart: weekStartLabel,
          weekEnd: weekEndLabel,
          monitors: monitorSummaries,
          audits: auditSummaries,
          totalIncidents,
          dashboardUrl: appUrl,
        });

        await prisma.user.update({
          where: { id: user.id },
          data: { lastDigestSentAt: now },
        });

        sent++;
      } catch (emailError) {
        console.error(`[DIGEST] Failed to send to ${user.email}:`, emailError);
      }
    }

    console.log(`[DIGEST] Sent: ${sent}, Skipped (no activity): ${skipped}`);
    return NextResponse.json({ success: true, sent, skipped });

  } catch (error) {
    console.error('[DIGEST] Cron error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
