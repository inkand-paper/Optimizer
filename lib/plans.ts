export const PLAN_LIMITS = {
  FREE: {
    name: 'Starter',
    price: '$0',
    description: 'Perfect for personal projects, quick audits, and learning the platform.',
    assets: 1,
    checks: 500,
    webhooks: 1,
    interval: 60,
    retentionDays: 7,
    allowRevalidate: false,
    allowApiKeys: false,
    allowAi: false,
    features: [
      { text: '1 Monitored Site', active: true },
      { text: '500 Health Checks / mo', active: true },
      { text: 'Code Audit (GitHub / Zip / Paste)', active: true },
      { text: 'SEO & Performance Analyser', active: true },
      { text: 'Pulse-AI Assistant', active: true },
      { text: 'Intelligence Bank (Incremental Audits)', active: false },
      { text: 'API Keys & Revalidation Pulses', active: false },
      { text: 'Webhook Alerts (Discord / Slack)', active: false },
    ]
  },
  PRO: {
    name: 'Professional',
    price: '$29',
    description: 'The AI-driven choice for production-grade assets and active development teams.',
    assets: 10,
    checks: 25000,
    webhooks: 5,
    interval: 30,
    retentionDays: 30,
    allowRevalidate: true,
    allowApiKeys: true,
    allowAi: true,
    features: [
      { text: '10 Monitored Sites', active: true },
      { text: '25,000 Health Checks / mo', active: true },
      { text: 'Code Audit (GitHub / Zip / Paste)', active: true },
      { text: 'Intelligence Bank (Incremental Audits)', active: true },
      { text: 'Pulse-AI Assistant', active: true },
      { text: 'API Keys & Revalidation Pulses', active: true },
      { text: '5 Webhook Alerts (Discord / Slack)', active: true },
      { text: 'White-label Portals', active: false },
    ]
  },
  BUSINESS: {
    name: 'Agency',
    price: '$129',
    description: 'Unlimited scale for agencies, teams, and profit-focused engineering orgs.',
    assets: 999999,
    checks: 999999999,
    webhooks: 50,
    interval: 10,
    retentionDays: 365,
    allowRevalidate: true,
    allowApiKeys: true,
    allowAi: true,
    features: [
      { text: 'Unlimited Sites', active: true },
      { text: 'Unlimited Health Checks', active: true },
      { text: 'Code Audit + Intelligence Bank', active: true },
      { text: 'Pulse-AI Assistant (Priority)', active: true },
      { text: 'Unlimited API Keys & Pulses', active: true },
      { text: '50 Webhook Alerts (Discord / Slack)', active: true },
      { text: '1-Click Reporting', active: true },
      { text: 'White-label Portals', active: true },
    ]
  }
} as const;

export type PlanType = keyof typeof PLAN_LIMITS;
