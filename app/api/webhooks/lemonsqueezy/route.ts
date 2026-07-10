import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

/**
 * LemonSqueezy Webhook Handler
 *
 * Events handled:
 *   order_created / order_paid          → upgrade user plan
 *   subscription_created                → upgrade + save subscriptionId
 *   subscription_updated                → handle plan change mid-cycle
 *   subscription_cancelled              → schedule downgrade to FREE
 *   subscription_expired                → downgrade to FREE immediately
 *   subscription_payment_failed         → log, alert (grace period managed by LS)
 *   subscription_payment_success        → confirm plan still active
 */

function verifySignature(rawBody: string, signature: string): boolean {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET || '';
  const hmac = crypto.createHmac('sha256', secret);
  const digest = Buffer.from(hmac.update(rawBody).digest('hex'), 'utf8');
  const sigBuffer = Buffer.from(signature, 'utf8');
  return digest.length === sigBuffer.length && crypto.timingSafeEqual(digest, sigBuffer);
}

// Map LemonSqueezy variant/product names to our plan enum values
function resolvePlan(customPlan?: string, variantName?: string): 'PRO' | 'BUSINESS' | null {
  const raw = (customPlan || variantName || '').toUpperCase();
  if (raw.includes('BUSINESS') || raw.includes('AGENCY')) return 'BUSINESS';
  if (raw.includes('PRO') || raw.includes('PROFESSIONAL')) return 'PRO';
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const headersList = await headers();
    const signature = headersList.get('x-signature');

    if (!signature) {
      return new Response('Webhook signature missing', { status: 401 });
    }

    if (!verifySignature(rawBody, signature)) {
      console.error('[WEBHOOK] Invalid signature — possible spoofed request');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const eventName: string = payload.meta?.event_name;
    const customData = payload.meta?.custom_data;
    const attrs = payload.data?.attributes;

    console.log(`[WEBHOOK] Event: ${eventName}`);

    // ── Resolve user ──────────────────────────────────────────────────────────
    const userId = customData?.userId || customData?.user_id;
    const userEmail = attrs?.user_email || customData?.email;

    // Look up by userId first, fall back to email
    const user = userId
      ? await prisma.user.findUnique({ where: { id: userId } })
      : userEmail
      ? await prisma.user.findUnique({ where: { email: userEmail } })
      : null;

    if (!user && ['order_created', 'order_paid', 'subscription_created', 'subscription_updated',
                   'subscription_cancelled', 'subscription_expired', 'subscription_payment_success',
                   'subscription_payment_failed'].includes(eventName)) {
      console.error(`[WEBHOOK] Could not find user — userId: ${userId}, email: ${userEmail}`);
      // Return 200 so LS doesn't keep retrying for unfixable mismatches
      return NextResponse.json({ error: 'User not found', received: true }, { status: 200 });
    }

    const { sendPaymentConfirmationEmail, sendSubscriptionCancelledEmail } = await import('@/lib/mail');

    // ── Event routing ─────────────────────────────────────────────────────────

    if (eventName === 'order_created' || eventName === 'order_paid') {
      // One-time order or first payment — upgrade plan
      const plan = resolvePlan(customData?.plan, attrs?.first_order_item?.variant_name);
      if (!plan || !user) return NextResponse.json({ received: true });

      await prisma.user.update({
        where: { id: user.id },
        data: { plan },
      });

      console.log(`[WEBHOOK] ✅ order upgrade → ${user.email} → ${plan}`);
      sendPaymentConfirmationEmail({ email: user.email, userName: user.name || 'Operator', plan }).catch(console.error);
    }

    else if (eventName === 'subscription_created') {
      const plan = resolvePlan(customData?.plan, attrs?.variant_name);
      if (!plan || !user) return NextResponse.json({ received: true });

      const subscriptionId = String(payload.data?.id || '');
      const lemonSqueezyId = String(attrs?.customer_id || '');

      await prisma.user.update({
        where: { id: user.id },
        data: {
          plan,
          subscriptionId,
          lemonSqueezyId: lemonSqueezyId || undefined,
        },
      });

      console.log(`[WEBHOOK] ✅ subscription_created → ${user.email} → ${plan} (sub: ${subscriptionId})`);
      sendPaymentConfirmationEmail({ email: user.email, userName: user.name || 'Operator', plan }).catch(console.error);
    }

    else if (eventName === 'subscription_updated') {
      // Handles mid-cycle plan changes (upgrade/downgrade between PRO and BUSINESS)
      if (!user) return NextResponse.json({ received: true });

      const plan = resolvePlan(customData?.plan, attrs?.variant_name);
      const status: string = attrs?.status || '';

      // If the subscription is now cancelled/expired via an update event, downgrade
      if (status === 'cancelled' || status === 'expired') {
        await prisma.user.update({
          where: { id: user.id },
          data: { plan: 'FREE', subscriptionId: null },
        });
        console.log(`[WEBHOOK] subscription_updated → status=${status} → downgraded ${user.email} to FREE`);
      } else if (plan) {
        await prisma.user.update({
          where: { id: user.id },
          data: { plan },
        });
        console.log(`[WEBHOOK] subscription_updated → ${user.email} → ${plan}`);
      }
    }

    else if (eventName === 'subscription_cancelled') {
      // User cancelled — LemonSqueezy keeps access until period ends, then fires subscription_expired
      // We mark them now but don't downgrade until subscription_expired
      if (!user) return NextResponse.json({ received: true });

      const endsAt = attrs?.ends_at
        ? new Date(attrs.ends_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : undefined;

      console.log(`[WEBHOOK] subscription_cancelled → ${user.email}, access until: ${endsAt || 'unknown'}`);

      // Send cancellation email — don't downgrade yet, wait for subscription_expired
      sendSubscriptionCancelledEmail({
        email: user.email,
        userName: user.name || 'Operator',
        plan: user.plan,
        endsAt,
      }).catch(console.error);
    }

    else if (eventName === 'subscription_expired') {
      // Subscription period has ended — downgrade to FREE now
      if (!user) return NextResponse.json({ received: true });

      await prisma.user.update({
        where: { id: user.id },
        data: { plan: 'FREE', subscriptionId: null },
      });

      console.log(`[WEBHOOK] ✅ subscription_expired → ${user.email} downgraded to FREE`);
    }

    else if (eventName === 'subscription_payment_failed') {
      // LemonSqueezy handles retry logic — we just log it
      // They'll fire subscription_expired if all retries fail
      console.warn(`[WEBHOOK] subscription_payment_failed → ${user?.email || userEmail}`);
    }

    else if (eventName === 'subscription_payment_success') {
      // Recurring payment succeeded — ensure plan is still correct
      if (!user) return NextResponse.json({ received: true });

      const plan = resolvePlan(customData?.plan, attrs?.variant_name);
      if (plan && user.plan !== plan) {
        await prisma.user.update({ where: { id: user.id }, data: { plan } });
        console.log(`[WEBHOOK] subscription_payment_success → corrected ${user.email} plan to ${plan}`);
      }
    }

    else {
      console.log(`[WEBHOOK] Unhandled event: ${eventName} — ignored`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('[WEBHOOK] Unhandled error:', error);
    // Return 500 so LemonSqueezy retries genuine failures
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
