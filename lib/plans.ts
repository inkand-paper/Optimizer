export const PLAN_LIMITS = {
  FREE: {
    monitors: 5,
    webhooks: 1,
    interval: 60, // 60 seconds minimum
    retentionDays: 7,
    allowRevalidate: false,
    allowApiKeys: false,
    features: ['Discord Alerts', 'Basic SEO Audit']
  },
  PRO: {
    monitors: 50,
    webhooks: 5,
    interval: 30, // 30 seconds minimum
    retentionDays: 30,
    allowRevalidate: false,
    allowApiKeys: true,
    features: ['Discord/Slack Alerts', 'Full Audit Suite', 'API Access']
  },
  BUSINESS: {
    monitors: 500,
    webhooks: 50,
    interval: 10, // 10 seconds minimum
    retentionDays: 365,
    allowRevalidate: true,
    allowApiKeys: true,
    features: ['Priority Support', 'White-label Reports', 'Edge Cache Purge']
  }
} as const;

export type PlanType = keyof typeof PLAN_LIMITS;
