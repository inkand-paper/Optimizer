# NexPulse Master Guide

Comprehensive technical and architectural reference for operators and contributors.

---

## 1. Platform Overview

NexPulse is a unified infrastructure intelligence platform for modern development teams. It provides:

- **Real-Time Monitoring** — Uptime, latency, and status tracking for any URL
- **Cache Pulse Engine** — Remote cache revalidation for Next.js, Nuxt, and Remix
- **SEO & Performance Audit** — Deep crawl of live URLs for Web Vitals, meta, and security headers
- **Neural Code Audit** — AI-powered analysis of source code from GitHub, ZIP, or paste
- **Intelligence Bank** — Hash-based incremental auditing to skip unchanged files
- **Pulse-AI Assistant** — Embedded AI technical assistant in the dashboard
- **Webhooks** — Discord/Slack alerts for monitoring events
- **Activity Logs** — Full audit trail of all platform events

---

## 2. Architecture

NexPulse is a Next.js 16 App Router application using a decoupled three-layer system:

```
┌─────────────────────────────────────────────┐
│              Command Center (UI)             │
│  Dashboard · Login · Docs · Landing Page    │
└───────────────────┬─────────────────────────┘
                    │ HTTP / SSE
┌───────────────────▼─────────────────────────┐
│              Pulse Engine (API)              │
│  /api/revalidate · /api/code-review         │
│  /api/monitors · /api/analyze               │
│  /api/ai/chat · /api/auth/*                 │
└──────────┬──────────────────┬───────────────┘
           │                  │
┌──────────▼───────┐  ┌───────▼───────────────┐
│  PostgreSQL DB   │  │  External Services     │
│  (Prisma ORM)    │  │  Groq · Gemini · Redis │
│  Supabase hosted │  │  GitHub OAuth · Resend │
└──────────────────┘  └───────────────────────┘
```

### Authentication System (Dual-Layer)

NexPulse runs two parallel auth systems:

| System | Used By | Token Type |
|---|---|---|
| **Custom JWT** | Email/password login | HttpOnly `token` cookie |
| **NextAuth v4** | Google / GitHub social login | `next-auth.session-token` cookie (DB session) |

`getTokenFromRequest()` in `lib/auth.ts` checks both automatically, in order:
1. Custom JWT cookie
2. NextAuth database session (`getServerSession`)
3. Bearer token header (API clients)

---

## 3. Neural Code Audit Engine

### How It Works

1. User provides source code via **GitHub**, **ZIP upload**, or **paste**
2. Files are filtered by extension (`.ts`, `.tsx`, `.js`, `.jsx`, `.py`, `.go`, `.json`, `.yaml`, `.yml`, `.md`, `.txt`, etc.)
3. Each file is sent to Groq (llama-3.3-70b) for per-file analysis
4. Issues are aggregated by category: Security, Performance, Standards, Refactor
5. A final synthesis pass generates the overall report with a Code Health Score

### Intelligence Bank (Incremental Auditing)

Every audited file is fingerprinted with a SHA-256 hash and stored in the database. On subsequent audits:

- Files with unchanged hashes → **skipped** (instantly reused from cache)
- Modified files → **re-analysed**
- New files → **analysed and cached**

This makes second+ audits dramatically faster for active repositories.

### Code Health Score

The final report includes grades per category and an overall health score:

| Grade | Score |
|---|---|
| A | 90–100 |
| B | 75–89 |
| C | 60–74 |
| D | Below 60 |

---

## 4. Pulse-AI Assistant

Pulse-AI is an AI assistant embedded in the dashboard (bottom-right widget). It uses a 3-tier AI engine:

| Tier | Model | Trigger |
|---|---|---|
| 1 (Primary) | Groq `llama-3.3-70b-versatile` | All requests |
| 2 (Buffer) | Groq `llama-3.1-8b-instant` | When 70B hits daily quota (100k tokens) |
| 3 (Fallback) | Google Gemini (Flash → Pro iteration) | When all Groq engines are unavailable |

Pulse-AI knows about:
- All NexPulse features and dashboard tab names
- How to set up cache revalidation and monitoring
- How to interpret Code Audit results
- Contact/support info

---

## 5. Database Schema (Key Tables)

| Table | Purpose |
|---|---|
| `User` | User accounts (email + password OR OAuth) |
| `Account` | NextAuth OAuth account links |
| `Session` | NextAuth database sessions |
| `ApiKey` | Machine API keys (hashed, never stored plain) |
| `Monitor` | Monitored URLs with check interval config |
| `MonitorEvent` | Historical uptime/latency data points |
| `CodeReview` | Saved code audit reports |
| `ActivityLog` | Audit trail of all platform events |
| `Webhook` | User-configured Discord/Slack alert endpoints |

### API Key Security
Plain-text keys are generated once and shown to the user exactly once. Only SHA-256 hashes are stored in the database.

---

## 6. Plan Limits

| Limit | FREE | PRO | BUSINESS |
|---|---|---|---|
| `assets` (monitors) | 1 | 10 | Unlimited |
| `checks` / month | 500 | 25,000 | Unlimited |
| `webhooks` | 1 | 5 | 50 |
| `interval` (seconds) | 60 | 30 | 10 |
| `retentionDays` | 7 | 30 | 365 |
| `allowApiKeys` | ❌ | ✅ | ✅ |
| `allowRevalidate` | ❌ | ✅ | ✅ |
| `allowAi` (full) | basic | ✅ | ✅ priority |

---

## 7. Key Environment Variables

See `DEPLOYMENT_CHECKLIST.md` for the complete production variable table.

Local development uses `.env.local` (overrides `.env`). The two-file split enables running local and production OAuth apps side by side:

- `.env` — shared non-secret defaults
- `.env.local` — local-only secrets (never committed)

---

## 8. Integration Pattern

To enable Revalidation Pulses and Live Website Audits, the target app must install the NexPulse integration endpoint:

```ts
// app/api/revalidate/route.ts (in YOUR app)
import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.REVALIDATE_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { tag, path } = await req.json();
  if (tag)  revalidateTag(tag);
  if (path) revalidatePath(path);
  return NextResponse.json({ revalidated: true });
}
```

Then register the site's URL + your NexPulse Machine API Key in the dashboard.

---

## 9. Known Constraints (Vercel Hobby Plan)

| Constraint | Impact | Mitigation |
|---|---|---|
| Image Transformations | Low limit | `unoptimized: true` in `next.config.ts` |
| Function timeout | 10s (Hobby) / 60s (Pro) | Code audits chunked into small batches |
| Groq daily tokens | 100k/day (free tier) | 3-tier AI fallback (Groq 70B → 8B → Gemini) |

---

## 10. Contributing

```bash
git clone https://github.com/inkand-paper/Optimizer
cd nextjs-optimizer-suite
cp .env .env.local
# Fill in local keys
npm install
npx prisma migrate dev
npm run dev
```

- Branch from `dev`, PR to `main`
- All PRs must pass `npm run lint` and `npm run build`
- See `AGENTS.md` for AI coding assistant directives
