import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTokenFromRequest } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';

// GET /api/status?slug=xxx — public, no auth required
// Returns the status page data for a given slug
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json({ error: 'slug is required' }, { status: 400 });
    }

    // Rate limit public endpoint: 60 requests per minute per IP
    const ip = req.headers.get('x-forwarded-for')?.split(',').pop()?.trim() || '127.0.0.1';
    const rl = await checkRateLimit(`status_page_${ip}`, { maxRequests: 60, windowMs: 60 * 1000 });
    if (!rl.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    // Find user by slug OR by name (username fallback)
    const user = await prisma.user.findFirst({
      where: {
        statusPageEnabled: true,
        OR: [
          { statusPageSlug: slug },
          { name: { equals: slug, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        statusPageSlug: true,
        monitors: {
          where: { isPublic: true },
          select: {
            id: true,
            name: true,
            url: true,
            status: true,
            lastChecked: true,
            checks: {
              orderBy: { createdAt: 'desc' },
              take: 90, // last 90 checks = ~7.5 hours of history at 5-min intervals
              select: {
                status: true,
                latency: true,
                createdAt: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Status page not found' }, { status: 404 });
    }

    type CheckRecord = { status: string; latency: number | null; createdAt: Date };
    type MonitorRecord = {
      id: string; name: string; url: string; status: string;
      lastChecked: Date | null; checks: CheckRecord[];
    };

    // Calculate uptime % for each monitor over the last 90 checks
    const monitors = user.monitors.map((m: MonitorRecord) => {
      const total = m.checks.length;
      const up = m.checks.filter((c: CheckRecord) => c.status === 'UP').length;
      const uptimePct = total > 0 ? Math.round((up / total) * 1000) / 10 : null;
      const withLatency = m.checks.filter((c: CheckRecord) => c.latency !== null);
      const avgLatency = withLatency.length > 0
        ? Math.round(withLatency.reduce((sum: number, c: CheckRecord) => sum + (c.latency || 0), 0) / withLatency.length)
        : null;

      return {
        id: m.id,
        name: m.name,
        url: m.url,
        status: m.status,
        lastChecked: m.lastChecked,
        uptimePct,
        avgLatency,
        history: m.checks.map((c: CheckRecord) => ({
          status: c.status,
          latency: c.latency,
          time: c.createdAt,
        })),
      };
    });

    // Overall system status
    const allUp = monitors.every((m: { status: string }) => m.status === 'UP' || m.status === 'UNKNOWN');
    const anyDown = monitors.some((m: { status: string }) => m.status === 'DOWN');
    const overallStatus = monitors.length === 0 ? 'NO_MONITORS'
      : anyDown ? 'DEGRADED'
      : allUp ? 'OPERATIONAL'
      : 'DEGRADED';

    return NextResponse.json({
      owner: user.name || slug,
      slug: user.statusPageSlug || slug,
      overallStatus,
      monitors,
      generatedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error('GET /api/status error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH /api/status — authenticated: update status page settings
export async function PATCH(req: NextRequest) {
  try {
    const token = await getTokenFromRequest(req);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { enabled, slug } = await req.json();

    const user = await prisma.user.findUnique({
      where: { id: token.userId },
      select: { name: true, email: true, statusPageSlug: true },
    });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // If enabling for first time with no slug, auto-generate one from name/email
    let resolvedSlug = slug;
    if (enabled && !resolvedSlug && !user.statusPageSlug) {
      const base = (user.name || user.email.split('@')[0])
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 30);
      resolvedSlug = base;
    }

    // Validate slug format if provided
    if (resolvedSlug !== undefined && resolvedSlug !== null) {
      if (!/^[a-z0-9-]{3,30}$/.test(resolvedSlug)) {
        return NextResponse.json({
          error: 'Slug must be 3-30 characters, lowercase letters, numbers, and hyphens only'
        }, { status: 400 });
      }

      // Check slug not taken by another user
      const taken = await prisma.user.findFirst({
        where: { statusPageSlug: resolvedSlug, NOT: { id: token.userId } },
      });
      if (taken) {
        return NextResponse.json({ error: 'This slug is already taken. Try another.' }, { status: 409 });
      }
    }

    const updated = await prisma.user.update({
      where: { id: token.userId },
      data: {
        ...(enabled !== undefined && { statusPageEnabled: enabled }),
        ...(resolvedSlug !== undefined && { statusPageSlug: resolvedSlug }),
      },
      select: { statusPageEnabled: true, statusPageSlug: true },
    });

    return NextResponse.json({ success: true, ...updated });

  } catch (error) {
    console.error('PATCH /api/status error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
