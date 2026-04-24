/**
 * [SaaS INFRA] - Alert Dispatcher
 * Handles sending notifications to various channels.
 */

interface AlertOptions {
  type: 'DOWNTIME' | 'RESTORED';
  monitorName: string;
  url: string;
  details?: string;
}

export async function sendAlert({ type, monitorName, url, details }: AlertOptions) {
  const message = type === 'DOWNTIME' 
    ? `🚨 ALERT: Monitor "${monitorName}" is DOWN!\nURL: ${url}\nDetails: ${details || 'N/A'}`
    : `✅ RESTORED: Monitor "${monitorName}" is back UP.\nURL: ${url}`;

  console.log(`[ALERT DISPATCHED] ${message}`);

  // 1. Discord Webhook (if configured)
  const discordWebhook = process.env.DISCORD_WEBHOOK_URL;
  if (discordWebhook) {
    try {
      await fetch(discordWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: message })
      });
    } catch (err) {
      console.error('Discord alert failed:', err);
    }
  }

  // 2. Email (Future: Integration with Resend)
  // if (process.env.RESEND_API_KEY) { ... }
}
