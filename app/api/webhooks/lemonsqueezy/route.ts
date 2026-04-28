import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

/**
 * [SECURITY] - LemonSqueezy Webhook Handler
 * Verifies signatures to ensure requests actually come from LemonSqueezy.
 * Updates user plans automatically upon successful payment.
 */

export async function POST(req: NextRequest) {
  console.log(`[WEBHOOK] Incoming request at ${new Date().toISOString()}`);
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-signature');
    
    console.log(`[WEBHOOK] Signature: ${signature ? 'Present' : 'MISSING'}`);
    console.log(`[WEBHOOK] Body Length: ${rawBody.length}`);

    const hmac = crypto.createHmac('sha256', process.env.LEMONSQUEEZY_WEBHOOK_SECRET || '');
    const digest = hmac.update(rawBody).digest('hex');
    const signature = req.headers.get('x-signature');

    if (digest !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const eventName = payload.meta.event_name;
    const customData = payload.meta.custom_data;

    console.log(`[PAYMENT DEBUG] Event: ${eventName}`);
    console.log(`[PAYMENT DEBUG] Custom Data:`, JSON.stringify(customData));

    if (eventName === 'order_created' || eventName === 'subscription_created' || eventName === 'order_paid') {
      const userId = customData?.userId || customData?.user_id; // Check both naming conventions
      const plan = customData?.plan;

      if (!userId || !plan) {
        console.error(`[PAYMENT ERROR] Missing userId (${userId}) or plan (${plan}) in webhook metadata.`);
        return NextResponse.json({ error: 'Missing metadata' }, { status: 200 }); // Still return 200 to LS
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { plan: plan }
      });
      
      console.log(`[PAYMENT SUCCESS] Upgraded ${updatedUser.email} to ${plan}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
