export const PLAN_LIMITS = {
  FREE: {
    monitors: 5,
    interval: 60, // 60 seconds minimum
    retentionDays: 7,
    features: ['Discord Alerts', 'Basic SEO Audit']
  },
  PRO: {
    monitors: 50,
    interval: 30, // 30 seconds minimum
    retentionDays: 30,
    features: ['Discord/Slack Alerts', 'Full Audit Suite', 'API Access']
  },
  BUSINESS: {
    monitors: 500,
    interval: 10, // 10 seconds minimum
    retentionDays: 365,
    features: ['Priority Support', 'White-label Reports', 'Edge Cache Purge']
  }
} as const;

export type PlanType = keyof typeof PLAN_LIMITS;
