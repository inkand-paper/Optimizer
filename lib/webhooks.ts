import { prisma } from './prisma';
import crypto from 'crypto';
import { validateSafeUrl } from './ssrf';

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
      let bodyText = JSON.stringify({
        event,
        payload,
        timestamp: new Date().toISOString()
      });

      // Special handling for Discord Webhooks to make them look nice
      if (webhook.url.includes('discord.com/api/webhooks')) {
        let color = 3447003; // Blue
        if (event.includes('DOWN') || event.includes('FAILURE')) color = 15158332; // Red
        if (event.includes('UP') || event.includes('SUCCESS')) color = 3066993; // Green
        
        bodyText = JSON.stringify({
          embeds: [{
            title: `System Alert: ${event.replace('_', ' ')}`,
            description: `**Target:** ${payload.name || payload.url || 'Unknown'}\n**Details:** ${payload.message || 'No details provided'}\n**Latency:** ${payload.latency ? payload.latency + 'ms' : 'N/A'}`,
            color: color,
            timestamp: new Date().toISOString()
          }]
        });
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'User-Agent': 'NextOptimizerWebhook/1.0'
      };

      // Sign payload if secret exists (Discord ignores this, but custom APIs use it)
      if (webhook.secret) {
        const signature = crypto
          .createHmac('sha256', webhook.secret)
          .update(bodyText)
          .digest('hex');
        headers['X-NJO-Signature'] = signature;
      }

      const safeUrl = await validateSafeUrl(webhook.url);

      await fetch(safeUrl, {
        method: 'POST',
        headers,
        body: bodyText
      });
      
      console.log(`[WEBHOOK DISPATCHED] Event: ${event} to ${webhook.url}`);
    } catch (err) {
      console.error(`[WEBHOOK FAILED] ${webhook.url}:`, err);
    }
  }
}
