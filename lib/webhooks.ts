import { prisma } from './prisma';
import crypto from 'crypto';

/**
 * [SaaS INFRA] - Webhook Dispatcher
 * Sends JSON payloads to registered external endpoints.
 */

export async function dispatchWebhook(userId: string, event: string, payload: any) {
  const webhooks = await prisma.webhook.findMany({
    where: { 
      userId,
      events: { has: event }
    }
  });

  for (const webhook of webhooks) {
    try {
      const body = JSON.stringify({
        event,
        payload,
        timestamp: new Date().toISOString()
      });

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'User-Agent': 'NextOptimizerWebhook/1.0'
      };

      // Sign payload if secret exists
      if (webhook.secret) {
        const signature = crypto
          .createHmac('sha256', webhook.secret)
          .update(body)
          .digest('hex');
        headers['X-NJO-Signature'] = signature;
      }

      await fetch(webhook.url, {
        method: 'POST',
        headers,
        body
      });
      
      console.log(`[WEBHOOK DISPATCHED] Event: ${event} to ${webhook.url}`);
    } catch (err) {
      console.error(`[WEBHOOK FAILED] ${webhook.url}:`, err);
    }
  }
}
