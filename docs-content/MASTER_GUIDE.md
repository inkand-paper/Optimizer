# NexPulse Master Guide

Comprehensive technical and architectural reference for operators and contributors.
Last updated: July 2025 (v2.0)

---

## 1. Platform Overview

NexPulse is a unified infrastructure monitoring and auditing platform for engineering teams. It provides:

- **Uptime Monitoring** — Health checks for any public URL with Discord/Slack alerts
- **Cache Pulse Engine** — Remote cache revalidation for Next.js, Nuxt, and Remix
- **SEO and Performance Audit** — Deep crawl of live URLs for Web Vitals, meta tags, security headers, and structured data
- **Neural Code Audit** — AI-powered analysis of source code from GitHub repos, ZIP archives, or pasted code
- **Intelligence Bank** — Hash-based incremental auditing that skips unchanged files on repeat audits
- **Pulse-AI Assistant** — AI technical assistant embedded in the dashboard
- **Webhooks** — Discord and Slack alerts for monitoring events
- **Activity Logs** — Full audit trail of all platform events
- **Promotions System** — Admin-managed sales and discount codes surfaced as dashboard banners with live countdown timers
- **Student Trial** — 30-day PRO trial for users who verify a valid academic email (.edu, .ac.uk, .edu.bd, etc.)

---

## 2. Architecture

NexPulse is a Next.js 16 App Router application with a three-layer structure:

```
┌─────────────────────────────────────────────┐
│              Command Center (UI)             │
│   Dashboard  Login  Docs  Landing Page      │
└───────────────────┬─────────────────────────┘
                    │ HTTP / SSE
┌───────────────────▼─────────────────────────┐
│              Pulse Engine (API)              │
│  /api/revalidate   /api/code-review          │
│  /api/monitors     /api/analyze              │
│  /api/ai/chat      /api/auth/*               │
│  /api/promotions   /api/student/verify       │
│  /api/webhooks/lemonsqueezy                  │
└──────────┬──────────────────┬───────────────┘
           │                  │
┌──────────▼───────┐  ┌───────▼───────────────┐
│  PostgreSQL DB   │  │  External Services     │
│  (Prisma ORM)    │  │  Groq  Gemini  Redis   │
│  Supabase hosted │  │  GitHub  Resend  LS    │
└──────────────────┘  └───────────────────────┘
```

### Authentication System (Dual-Layer)

NexPulse runs two parallel auth systems:

| System | Used By | Token Type |
|---|---|---|
| Custom JWT | Email/password login | HttpOnly `token` cookie |
| NextAuth v4 | Google / GitHub social login | `next-auth.session-token` cookie (DB session) |

`getTokenFromRequest()` in `lib/auth.ts` checks both automatically, in priority order:
1. Custom JWT cookie
2. NextAuth database session via `getServerSession`
3. Bearer token header for API clients

**Rule**: Every API route handler must call `getTokenFromRequest(req)`. Never read cookies manually.

---

## 3. Database Schema (All Tables)

| Table | Purpose |
|---|---|
| `User` | User accounts with email/password or OAuth |
| `Account` | NextAuth OAuth account links |
| `Session` | NextAuth database sessions |
| `ApiKey` | Machine API keys (SHA-256 hash only, never plain text) |
| `Monitor` | Monitored URLs with check interval configuration |
| `MonitorEvent` | Historical uptime and latency data points |
| `CodeReview` | Saved code audit reports |
| `AuditCache` | Intelligence Bank — per-file hash-to-review cache |
| `ActivityLog` | Full audit trail of all platform events |
| `Webhook` | User-configured Discord/Slack alert endpoints |
| `Promotion` | Admin-managed time-limited discount promotions |
| `StudentTrial` | .edu email verifications for 30-day PRO trials |

### Key Field Notes

- `User.subscriptionId` — LemonSqueezy subscription ID, saved on `subscription_created` webhook
- `User.lemonSqueezyId` — LemonSqueezy customer ID
- `User.plan` — enum: `FREE`, `PRO`, `BUSINESS`
- `User.role` — enum: `ADMIN`, `DEVELOPER`, `VIEWER`
- `User.twoFactorEnabled` — TOTP-based MFA flag
- `StudentTrial.expiresAt` — 30 days from verification; daily cron downgrades expired trials
- `Promotion.isActive` — daily cron auto-sets to false when `endsAt` passes

---

## 4. Plan Limits

All plan limits are defined in `lib/plans.ts` as the single source of truth. Never hardcode limits elsewhere.

| Limit | FREE | PRO | BUSINESS |
|---|---|---|---|
| Monitors | 1 | 10 | Unlimited |
| Health checks/month | 500 | 25,000 | Unlimited |
| Code audits/month | 3 | 50 | Unlimited |
| Webhooks | 1 | 5 | 50 |
| Check interval (seconds) | 60 | 30 | 10 |
| Log retention (days) | 7 | 30 | 365 |
| API keys | No | Yes | Yes |
| Cache revalidation | No | Yes | Yes |
| AI features | Basic | Full | Full (priority) |
| Intelligence Bank | No | Yes | Yes |

Admins (`role === 'ADMIN'`) bypass all plan limits on every route.

---

## 5. Neural Code Audit Engine

### How It Works

1. User provides source via GitHub repo, ZIP upload, or code paste
2. Files are filtered by extension: `.ts`, `.tsx`, `.js`, `.jsx`, `.py`, `.go`, `.java`, `.cs`, `.json`, `.yaml`, `.yml`, `.md`, `.txt`
3. Each file is hashed with SHA-256 and checked against the AuditCache (Intelligence Bank)
4. Cache hits are returned instantly. Cache misses are sent to Groq `llama-3.3-70b` for analysis
5. Issues are aggregated by category: Security, Performance, Standards, Refactor
6. A synthesis pass generates the overall Code Health Score and report

**Cache scoping by plan**: FREE users only benefit from their own prior submissions. PRO and BUSINESS users benefit from the shared global cache (Intelligence Bank).

### Code Health Score

| Grade | Score |
|---|---|
| A | 90-100 |
| B | 75-89 |
| C | 60-74 |
| D | Below 60 |

### Streaming

`/api/code-review` uses Server-Sent Events (SSE). Logs are streamed in real time:

```
data: {"log": "Scanning 42 files..."}
data: {"log": "Analysing security: auth.ts"}
data: {"done": true, "report": { ... }}
```

---

## 6. Pulse-AI Assistant

Embedded AI chat widget in the dashboard. Uses a 3-tier fallback chain:

| Tier | Model | When |
|---|---|---|
| 1 Primary | Groq `llama-3.3-70b-versatile` | All requests |
| 2 Buffer | Groq `llama-3.1-8b-instant` | When 70B hits daily quota |
| 3 Fallback | Google Gemini Flash then Pro | When all Groq engines are unavailable |

Requires user authentication. Rate limited to 30 messages per minute per user.

---

## 7. Billing (LemonSqueezy)

### Webhook Events Handled

All events are received at `/api/webhooks/lemonsqueezy` and verified via HMAC-SHA256 signature.

| Event | Action |
|---|---|
| `order_created` / `order_paid` | Upgrade user plan, send payment confirmation email |
| `subscription_created` | Upgrade plan, save `subscriptionId` and `lemonSqueezyId`, send email |
| `subscription_updated` | Handle mid-cycle plan change or status update |
| `subscription_cancelled` | Send cancellation email with access end date. Plan stays active until expiry |
| `subscription_expired` | Downgrade user to FREE, clear `subscriptionId` |
| `subscription_payment_failed` | Log only. LemonSqueezy handles retries and fires `expired` if all fail |
| `subscription_payment_success` | Self-heal plan if DB got out of sync |

### Student Trial

FREE users can verify an academic email to receive 30 days of PRO access at no cost:

- Supported domains: `.edu`, `.ac.uk`, `.edu.bd`, `.ac.in`, `.edu.au`, `.edu.sg`, `.edu.pk`, `.ac.nz`
- One trial per user and one trial per email address (cannot be reused)
- Daily cron at 2am UTC (`/api/cron/expire-trials`) downgrades expired trials to FREE
- Users who subscribe during their trial retain PRO (cron checks `subscriptionId` before downgrading)

### Promotions System

Admins can create time-limited discount promotions via `POST /api/promotions`. When active, a banner with a live countdown timer and click-to-copy discount code appears across the dashboard. Promotions auto-deactivate when `endsAt` passes via the daily cron.

---

## 8. Security Architecture

| Layer | Implementation |
|---|---|
| Auth cookies | HttpOnly, Secure, SameSite=Strict |
| Password storage | bcrypt with high salt rounds |
| API key storage | SHA-256 hash only, plain text shown once |
| SSRF prevention | `validateSafeUrl()` in `lib/ssrf.ts` called before every outbound fetch |
| Rate limiting | `checkRateLimit()` in `lib/rate-limit.ts` on all auth and AI endpoints |
| Input validation | Zod schemas on all API route inputs |
| MFA | TOTP via speakeasy, optional per user |
| Brute force detection | Failed login tracking with automatic Discord security alerts |
| CSP | Strict Content Security Policy without `unsafe-eval` |
| Timing attacks | `crypto.timingSafeEqual()` for secret comparisons |

---

## 9. Cron Jobs

Registered in `vercel.json`:

| Route | Schedule | Purpose |
|---|---|---|
| `/api/cron/monitor` | Every 5 minutes | Run uptime health checks in batches |
| `/api/cron/expire-trials` | Daily at 2am UTC | Expire student trials, deactivate ended promotions |

Both endpoints require `Authorization: Bearer <CRON_SECRET>`.

---

## 10. Integration Pattern

To enable Cache Revalidation Pulses from NexPulse into your app, add this endpoint to your target Next.js project:

```ts
// app/api/revalidate/route.ts (in YOUR app, not in NexPulse)
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

Then register your site URL and Machine API Key in the NexPulse dashboard under API Keys.

---

## 11. Environment Variables

See `.env.example` in the repo root for the full documented list. Key variables:

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Custom JWT signing (min 32 chars) |
| `NEXTAUTH_SECRET` | Yes | NextAuth session signing |
| `ADMIN_EMAIL` | Yes | Auto-promoted to ADMIN on first registration |
| `GROQ_API_KEY` | For AI | Groq API (free tier: 100k tokens/day) |
| `GEMINI_API_KEY` | For AI fallback | Google Gemini |
| `LEMONSQUEEZY_WEBHOOK_SECRET` | For billing | Webhook signature verification |
| `CRON_SECRET` | For cron jobs | Protects cron endpoints from unauthorized triggers |

---

## 12. Known Constraints

| Constraint | Impact | Status |
|---|---|---|
| Groq 100k tokens/day (free tier) | AI may fall back to smaller models | 3-tier fallback handles this |
| Vercel function timeout | Long audits may time out on Hobby plan | Code audits batch files; use Pro plan for large repos |
| `@react-email` packages deprecated | Build warnings (not errors) | Will migrate to new package names in a future update |
