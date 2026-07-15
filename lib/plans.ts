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
      { text: '1 Monitored Site (checked every 5 min)', active: true },
      { text: '3 Code Audits / mo', active: true },
      { text: 'SEO & Performance Analyser', active: true },
      { text: 'Pulse-AI Assistant', active: true },
      { text: 'Intelligence Bank', active: false },
      { text: 'API Keys & Cache Revalidation', active: false },
      { text: 'Discord / Slack Webhooks', active: false },
      { text: '7-day Log Retention', active: true },
    ]
  },
  PRO: {
    name: 'Professional',
    price: '$29',
    description: 'For developers running production sites who need real monitoring and AI-powered code auditing.',
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
      { text: '10 Monitored Sites (checked every 5 min)', active: true },
      { text: '50 Code Audits / mo + Intelligence Bank', active: true },
      { text: 'SEO & Performance Analyser', active: true },
      { text: 'Pulse-AI Assistant', active: true },
      { text: 'API Keys & Cache Revalidation', active: true },
      { text: '5 Discord / Slack Webhooks', active: true },
      { text: '30-day Log Retention', active: true },
      { text: 'AI Diagnosis on Audits', active: true },
    ]
  },
  BUSINESS: {
    name: 'Agency',
    price: '$129',
    description: 'Unlimited scale for agencies managing multiple client sites and codebases.',
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
      { text: 'Unlimited Sites (checked every 1 min)', active: true },
      { text: 'Unlimited Code Audits + Intelligence Bank', active: true },
      { text: 'SEO & Performance Analyser', active: true },
      { text: 'Pulse-AI Assistant', active: true },
      { text: 'Unlimited API Keys & Cache Revalidation', active: true },
      { text: '50 Discord / Slack Webhooks', active: true },
      { text: '365-day Log Retention', active: true },
      { text: 'AI Diagnosis on Audits', active: true },
    ]
  }
} as const;

export type PlanType = keyof typeof PLAN_LIMITS;
