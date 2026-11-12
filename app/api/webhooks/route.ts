import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTokenFromRequest } from '@/lib/auth';
import { PLAN_LIMITS, PlanType } from '@/lib/plans';
import crypto from 'crypto';
import { validateSafeUrl } from '@/lib/ssrf';
import { z } from 'zod';

// [SECURITY — M3] Allowlist of valid webhook event types.
// Never store arbitrary user-supplied event strings in the DB.
const ALLOWED_WEBHOOK_EVENTS = [
  'REVALIDATE_SUCCESS',
  'REVALIDATE_FAILURE',
  'MONITOR_DOWN',
  'MONITOR_UP',
] as const;

type WebhookEvent = (typeof ALLOWED_WEBHOOK_EVENTS)[number];

const createWebhookSchema = z.object({
  url: z.string().url('A valid URL is required'),
  events: z
    .array(z.enum(ALLOWED_WEBHOOK_EVENTS))
    .min(1, 'At least one event type is required')
    .max(ALLOWED_WEBHOOK_EVENTS.length, 'Too many event types'),
});

export async function GET(req: NextRequest) {
  try {
    const decoded = await getTokenFromRequest(req);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const webhooks = await prisma.webhook.findMany({
      where: { userId: decoded.userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, webhooks, allowedEvents: ALLOWED_WEBHOOK_EVENTS });
  } catch (error) {
    console.error('Fetch webhooks error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const decoded = await getTokenFromRequest(req);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // [SECURITY — M3] Validate URL and events against the allowlist via Zod.
    let parsed: { url: string; events: WebhookEvent[] };
    try {
      parsed = createWebhookSchema.parse(await req.json());
    } catch (err) {
      if (err instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Validation Error', message: err.issues[0].message },
          { status: 400 }
        );
      }
      return NextResponse.json({ error: 'Bad Request', message: 'Invalid request body' }, { status: 400 });
    }

    const { url, events } = parsed;

    // [SECURITY] SSRF Prevention: block webhook URLs that resolve to internal IPs
    try {
      await validateSafeUrl(url);
    } catch (ssrfError) {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: ssrfError instanceof Error ? ssrfError.message : 'Invalid or unsafe webhook URL',
        },
        { status: 400 }
      );
    }

    // [MONETIZATION] Enforce Plan Limits
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        role: true,
        plan: true,
        _count: {
          select: { webhooks: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.role !== 'ADMIN') {
      const userPlan = (user.plan || 'FREE') as PlanType;
      const planLimit = PLAN_LIMITS[userPlan].webhooks;
      if (user._count.webhooks >= planLimit) {
        return NextResponse.json(
          {
            error: 'Limit Reached',
            message: `Your ${userPlan} plan is limited to ${planLimit} webhooks. Please upgrade to add more endpoints.`,
          },
          { status: 403 }
        );
      }
    }

    // Generate a secret for payload signing
    const secret = crypto.randomBytes(32).toString('hex');

    const webhook = await prisma.webhook.create({
      data: {
        url,
        events,
        secret,
        userId: decoded.userId,
      },
    });

    return NextResponse.json({ success: true, webhook }, { status: 201 });
  } catch (error) {
    console.error('Create webhook error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
