export const PLAN_LIMITS = {
  FREE: {
    assets: 1,
    checks: 500,
    webhooks: 1,
    interval: 60,
    retentionDays: 7,
    allowRevalidate: false,
    allowApiKeys: false,
    features: ['Discord Alerts', 'Standard Monitoring']
  },
  PRO: {
    assets: 10,
    checks: 25000,
    webhooks: 5,
    interval: 30,
    retentionDays: 30,
    allowRevalidate: false,
    allowApiKeys: true,
    features: ['Slack/Discord Alerts', 'Performance Diagnosis', 'API Access']
  },
  BUSINESS: {
    assets: 999999, // Representing Unlimited as a large number for easier comparison
    checks: 999999999,
    webhooks: 50,
    interval: 10,
    retentionDays: 365,
    allowRevalidate: true,
    allowApiKeys: true,
    features: ['White-label Portals', 'Priority Support', 'Profit Recovery Audit']
  }
} as const;

export type PlanType = keyof typeof PLAN_LIMITS;
