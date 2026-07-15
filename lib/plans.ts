export const PLAN_LIMITS = {
  FREE: {
    name: 'Starter',
    price: '$0',
    description: 'Perfect for personal projects, quick audits, and learning the platform.',
    assets: 1,
    checks: 500,
    webhooks: 1,
    audits: 3,
    interval: 300,  // 5 min — matches cron frequency
    retentionDays: 7,
    allowRevalidate: false,
    allowApiKeys: false,
    allowAi: false,
    features: [
      { text: '1 Monitored Site', active: true },
      { text: '500 Health Checks / mo', active: true },
      { text: '3 Code Audits / mo (GitHub / Zip)', active: true },
      { text: 'SEO & Performance Analyser', active: true },
      { text: 'Pulse-AI Assistant', active: true },
      { text: 'Intelligence Bank (Incremental Audits)', active: false },
      { text: 'API Keys & Revalidation Pulses', active: false },
      { text: 'Discord / Slack Webhooks', active: false },
    ]
  },
  PRO: {
    name: 'Professional',
    price: '$29',
    description: 'The AI-driven choice for production-grade assets and active development teams.',
    assets: 10,
    checks: 25000,
    webhooks: 5,
    audits: 50,
    interval: 300,  // 5 min — matches cron frequency
    retentionDays: 30,
    allowRevalidate: true,
    allowApiKeys: true,
    allowAi: true,
    features: [
      { text: '10 Monitored Sites', active: true },
      { text: '25,000 Health Checks / mo', active: true },
      { text: '50 Code Audits / mo + Intelligence Bank', active: true },
      { text: 'Pulse-AI Assistant', active: true },
      { text: 'API Keys & Revalidation Pulses', active: true },
      { text: '5 Discord / Slack Webhooks', active: true },
      { text: 'Custom Threshold Alerts', active: true },
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
    audits: 999999999,
    interval: 60,   // 1 min — honoured on Vercel Pro with 1-min cron
    retentionDays: 365,
    allowRevalidate: true,
    allowApiKeys: true,
    allowAi: true,
    features: [
      { text: 'Unlimited Sites', active: true },
      { text: 'Unlimited Health Checks', active: true },
      { text: 'Unlimited Code Audits + Bank', active: true },
      { text: 'Pulse-AI Assistant (Priority)', active: true },
      { text: 'Unlimited API Keys & Pulses', active: true },
      { text: '50 Discord / Slack Webhooks', active: true },
      { text: '1-Click Reporting', active: true },
      { text: 'White-label Portals', active: true },
    ]
  }
} as const;

export type PlanType = keyof typeof PLAN_LIMITS;
