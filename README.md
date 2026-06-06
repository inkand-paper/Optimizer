<div align="center">

# NexPulse

**Infrastructure intelligence engine for modern development teams.**

[![CI/CD](https://github.com/inkand-paper/Optimizer/actions/workflows/ci.yml/badge.svg)](https://github.com/inkand-paper/Optimizer/actions/workflows/ci.yml)
[![License: BUSL-1.1](https://img.shields.io/badge/License-BUSL--1.1-blue.svg)](./LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://typescriptlang.org)

[Live Demo](https://nextjs-optimizer-suite.vercel.app) · [API Docs](./docs-content/API_DOCS.md) · [Self-Hosting](#self-hosting) · [Discord](https://discord.gg/gSw2sHxZtn)

</div>

---

NexPulse gives engineering teams a unified command center for uptime monitoring, cache revalidation, AI-powered code auditing, and SEO analysis — across any framework, any region.

## Features

| Feature | Description |
|---|---|
| **Real-Time Monitoring** | Uptime, latency, and status tracking for any public URL. No integration required. |
| **Cache Pulse Engine** | Remotely revalidate Next.js, Nuxt, and Remix caches by tag or path. |
| **SEO & Performance Audit** | Crawl any live URL for Core Web Vitals, meta coverage, security headers, and structured data. |
| **Neural Code Audit** | AI-powered source code analysis from GitHub repos, ZIP archives, or pasted snippets. |
| **Intelligence Bank** | Hash-based incremental auditing — only re-analyses files that changed since the last audit. |
| **Pulse-AI Assistant** | AI technical assistant embedded in the dashboard. Answers questions about your infrastructure and audit results. |
| **Webhooks** | Real-time Discord and Slack alerts when monitored endpoints go down or recover. |
| **Activity Logs** | Full audit trail of all API calls, revalidation pulses, and auth events. |
| **MFA** | TOTP-based two-factor authentication for all accounts. |

---

## Quick Start

```bash
# 1. Sign up at https://nextjs-optimizer-suite.vercel.app
# 2. Generate a Machine API Key from Dashboard → API Keys
# 3. Use the key to trigger cache revalidations from your CI/CD pipeline
```

### Cache Revalidation (Next.js example)

```ts
// In your deployment script or GitHub Action:
await fetch('https://nextjs-optimizer-suite.vercel.app/api/revalidate', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer opt_your_key_here',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ tag: 'products-v2' }),
});
```

Or use the CLI:

```bash
npx njo revalidate --key opt_your_key --tag products-v2
```

---

## Plans

| | Starter (Free) | Professional ($29/mo) | Agency ($129/mo) |
|---|:---:|:---:|:---:|
| Monitored Sites | 1 | 10 | Unlimited |
| Health Checks | 500/mo | 25,000/mo | Unlimited |
| Code Audits | 3/mo | 50/mo | Unlimited |
| Intelligence Bank | ❌ | ✅ | ✅ |
| AI Diagnosis | ❌ | ✅ | ✅ |
| API Keys & Pulses | ❌ | ✅ | ✅ |
| Webhooks (Discord/Slack) | 1 | 5 | 50 |
| Log Retention | 7 days | 30 days | 365 days |

---

## Self-Hosting

### Prerequisites

- Node.js ≥ 20
- PostgreSQL database (e.g. [Supabase](https://supabase.com) free tier)
- [Groq API key](https://console.groq.com) (free, for AI features)

### Setup

```bash
git clone https://github.com/inkand-paper/Optimizer
cd Optimizer
npm install
cp .env.example .env.local   # fill in your values
npx prisma migrate deploy
npm run dev
```

### Required Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `DIRECT_URL` | Direct PostgreSQL URL (for Prisma migrations) |
| `JWT_SECRET` | Secret for custom JWT signing (min 32 chars) |
| `NEXTAUTH_SECRET` | Secret for NextAuth sessions (min 32 chars) |
| `NEXTAUTH_URL` | Your deployment URL (e.g. `http://localhost:3000`) |
| `ADMIN_EMAIL` | Email that gets auto-promoted to ADMIN on first registration |

### Optional Environment Variables

| Variable | Description |
|---|---|
| `GROQ_API_KEY` | Groq API key for Code Audit engine and Pulse-AI |
| `GEMINI_API_KEY` | Google Gemini key (AI fallback) |
| `GITHUB_ID` / `GITHUB_SECRET` | GitHub OAuth app credentials |
| `GOOGLE_ID` / `GOOGLE_SECRET` | Google OAuth app credentials |
| `UPSTASH_REDIS_REST_URL` / `TOKEN` | Redis for distributed rate limiting |
| `RESEND_API_KEY` | Email sending (verification, alerts) |
| `DISCORD_SECURITY_WEBHOOK` | Discord webhook for security alerts |
| `LEMONSQUEEZY_API_KEY` | LemonSqueezy billing integration |
| `CRON_SECRET` | Secret for protecting the cron monitoring endpoint |

### Docker

```bash
docker compose up -d
```

---

## Tech Stack

- **Framework**: Next.js 16 App Router
- **Language**: TypeScript 5.9
- **Database**: PostgreSQL via Prisma ORM
- **Auth**: Custom JWT + NextAuth v4 (Google/GitHub OAuth)
- **AI**: Groq (llama-3.3-70b) with Gemini fallback
- **Rate Limiting**: Upstash Redis (in-memory fallback for dev)
- **Monitoring**: Sentry
- **Email**: Nodemailer / Resend
- **Billing**: LemonSqueezy
- **Deployment**: Vercel / Docker

---

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](./CONTRIBUTING.md) before submitting a pull request.

---

## Security

Found a vulnerability? Please do **not** open a public issue. Read the [Security Policy](./SECURITY.md) for responsible disclosure instructions.

---

## License

[Business Source License 1.1](./LICENSE) — free for non-competing use. Converts to MIT on 2030-01-01.

---

## Contact

- **Support**: nexpulse.team@gmail.com
- **Created by**: Mustak Tahsin Abir
- **Discord**: [discord.gg/gSw2sHxZtn](https://discord.gg/gSw2sHxZtn)
