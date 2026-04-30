export const PLAN_LIMITS = {
  FREE: {
    name: 'Starter',
    price: '$0',
    description: 'Perfect for personal projects and technical audits.',
    assets: 1,
    checks: 500,
    webhooks: 1,
    interval: 60,
    retentionDays: 7,
    allowRevalidate: false,
    allowApiKeys: false,
    allowAi: false,
    features: [
      { text: '1 Production Site', active: true },
      { text: '500 Checks / mo', active: true },
      { text: 'Technical Audits', active: true },
      { text: 'AI Genius Diagnosis', active: false },
      { text: 'White-label Portals', active: false },
    ]
  },
  PRO: {
    name: 'Professional',
    price: '$29',
    description: 'The AI-driven choice for production-grade web assets.',
    assets: 10,
    checks: 25000,
    webhooks: 5,
    interval: 30,
    retentionDays: 30,
    allowRevalidate: false,
    allowApiKeys: true,
    allowAi: true,
    features: [
      { text: '10 Universal Assets', active: true },
      { text: '25,000 Checks / mo', active: true },
      { text: 'AI Genius Diagnosis', active: true },
      { text: 'Performance Insights', active: true },
      { text: 'White-label Portals', active: false },
    ]
  },
  BUSINESS: {
    name: 'Agency',
    price: '$129',
    description: 'Scalable AI power for profit-focused agencies and teams.',
    assets: 999999,
    checks: 999999999,
    webhooks: 50,
    interval: 10,
    retentionDays: 365,
    allowRevalidate: true,
    allowApiKeys: true,
    allowAi: true,
    features: [
      { text: 'Unlimited Assets', active: true },
      { text: 'Unlimited Checks', active: true },
      { text: 'Profit Recovery AI', active: true },
      { text: 'White-label Portals', active: true },
      { text: '1-Click Reporting', active: true },
    ]
  }
} as const;

export type PlanType = keyof typeof PLAN_LIMITS;
