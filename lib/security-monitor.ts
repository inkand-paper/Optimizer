/**
 * [SECURITY] NexPulse Neural Security Monitor
 * This engine tracks system health, detects anomalies, and dispatches 
 * critical alerts to administrative channels (Discord/Slack).
 */

export const SECURITY_THRESHOLDS = {
  FAILED_LOGINS_PER_HOUR: 10,      // Brute force detection
  RATE_LIMIT_HITS_PER_MINUTE: 60,  // Scraper detection
  AI_FALLBACK_TO_GEMINI: 5,        // Primary AI provider degradation
  UNUSUAL_API_KEY_USAGE: 100,      // Possible key leak
};

export interface SecurityIncident {
  type: 'BRUTE_FORCE_DETECTED' | 'AI_FALLBACK' | 'API_KEY_ABUSE' | 'SYSTEM_ERROR' | 'UNAUTHORIZED_ACCESS';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  metadata?: Record<string, any>;
}

/**
 * Dispatches a rich security alert to the configured Discord webhook.
 */
export async function dispatchSecurityAlert(incident: SecurityIncident) {
  const webhookUrl = process.env.DISCORD_SECURITY_WEBHOOK;
  
  if (!webhookUrl) {
    console.warn('[SECURITY_MONITOR] No Discord webhook configured. Alert suppressed:', incident.type);
    return;
  }

  const colors = {
    critical: 0xFF0000, // Red
    high: 0xFFA500,     // Orange
    medium: 0xFFFF00,   // Yellow
    low: 0x00FF00,      // Green
  };

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [{
          title: `🛡️ NEX-PULSE SECURITY: ${incident.type.replace(/_/g, ' ')}`,
          color: colors[incident.severity],
          description: incident.message,
          fields: Object.entries(incident.metadata || {}).map(([k, v]) => ({
            name: k,
            value: `\`${String(v)}\``,
            inline: true
          })),
          footer: { text: 'NexPulse Total Hardening Engine' },
          timestamp: new Date().toISOString()
        }]
      })
    });
  } catch (err) {
    console.error('[SECURITY_MONITOR] Failed to dispatch alert:', err);
  }
}

/**
 * Lightweight anomaly detection for AI performance.
 * Tracks how often we fail over to secondary providers.
 */
export async function trackAiPerformance(provider: string, isFallback: boolean) {
  if (isFallback) {
    console.warn(`[SECURITY_MONITOR] AI Fallback triggered: ${provider}`);
    // In production, you would increment a counter in Redis here.
    // If (count > THRESHOLD), dispatchSecurityAlert(...);
  }
}
