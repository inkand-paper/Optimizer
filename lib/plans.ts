export const PLAN_LIMITS = {
  FREE: {
    assets: 1,
    checks: 500,
    interval: 60,
    retentionDays: 7,
    allowApiKeys: false,
    features: ['Discord Alerts', 'Standard Monitoring']
  },
  PRO: {
    assets: 10,
    checks: 25000,
    interval: 30,
    retentionDays: 30,
    allowApiKeys: true,
    features: ['Slack/Discord Alerts', 'Performance Diagnosis', 'API Access']
  },
  BUSINESS: {
    assets: 'Unlimited',
    checks: 'Unlimited',
    interval: 10,
    retentionDays: 365,
    allowApiKeys: true,
    features: ['White-label Portals', 'Priority Support', 'Profit Recovery Audit']
  }
} as const;

export type PlanType = keyof typeof PLAN_LIMITS;
