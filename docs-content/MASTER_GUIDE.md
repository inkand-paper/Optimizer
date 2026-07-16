# NexPulse Master Guide

Complete technical and architectural reference.
Last updated: July 2025

---

## 1. Platform Overview

NexPulse is a unified infrastructure monitoring and auditing platform. It provides:

- **Uptime Monitoring** — Health checks for any public URL, checked every 5 minutes via external cron. Discord/Slack alerts on status change only.
- **Cache Pulse Engine** — Remote cache revalidation for Next.js (and any framework with a revalidation endpoint). Triggered via Machine API Key.
- **SEO & Performance Audit** — Deep crawl of live URLs for Core Web Vitals signals, meta tags, security headers, and structured data.
- **Neural Code Audit** — AI-powered analysis of source code from GitHub repos, ZIP uploads, or pasted code. Streams results in real time.
- **Intelligence Bank** — SHA-256 hash-based incremental auditing. Unchanged files skip the AI entirely and return cached results.
- **Pulse-AI Assistant** — AI chat assistant embedded in the dashboard with accurate NexPulse product knowledge.
- **Webhooks** — Discord and Slack alerts for monitoring events.
- **Activity Logs** — Full audit trail of all platform events.
- **Promotions System** — Admin-managed time-limited discount promotions shown as a dashboard banner with countdown timer.
- **Student Trial** — 30-day PRO trial for users who submit an academic email + student ID card for manual admin review.
- **Gifted Trial** — Admin can gift PRO or Agency access to any user for a set number of days or permanently.

---

## 2. Architecture

```
┌─────────────────────────────────────────────┐
│              Dashboard (UI)                  │
│   Next.js 16 App Router — React components  │
└───────────────────┬─────────────────────────┘
                    │ HTTP / SSE
┌───────────────────▼─────────────────────────┐
│              API Layer                       │
│  /api/revalidate   /api/code-review (SSE)   │
│  /api/monitors     /api/analyze             │
│  /api/ai/chat      /api/auth/*              │
│  /api/promotions   /api/student/verify      │
│  /api/admin/*      /api/webhooks/lemonsqueezy│
│  /api/cron/monitor /api/cron/expire-trials  │
└──────────┬──────────────────┬───────────────┘
           │                  │
┌──────────▼───────┐  ┌───────▼───────────────┐
│  PostgreSQL DB   │  │  External Services     │
│  (Prisma ORM)    │  │  Groq · Gemini · Redis │
│  Supabase hosted │  │  GitHub · Resend       │
│                  │  │  LemonSqueezy · Blob   │
└──────────────────┘  └───────────────────────┘
```

### Authentication (Dual-Layer)

| System | Cookie | Used by |
|---|---|---|
| Custom JWT | `token` (HttpOnly) | Email/password login |
| NextAuth v4 | `next-auth.session-token` | Google / GitHub OAuth |

`getTokenFromRequest()` in `lib/auth.ts` checks both automatically — JWT first, then NextAuth session. Always use this function in route handlers. Never read cookies manually.

---

## 3. Database Schema

| Table | Purpose |
|---|---|
| `User` | Accounts with email/password or OAuth |
| `Account` | NextAuth OAuth account links |
| `Session` | NextAuth database sessions |
| `Monitor` | Registered URLs for uptime monitoring |
| `Check` | Every monitoring result (UP/DOWN, latency, message) |
| `ApiKey` | Machine API keys (SHA-256 hash only) |
| `CodeReview` | Saved code audit reports |
| `AuditCache` | Intelligence Bank — per-file hash-to-review cache |
| `ActivityLog` | Audit trail of all platform events |
| `Webhook` | User-configured Discord/Slack alert endpoints |
| `Promotion` | Admin-managed time-limited discount promotions |
| `StudentTrial` | Academic email + ID card submissions for manual review |
| `GiftedTrial` | Admin-gifted plan upgrades with optional expiry |

### Key User Fields

| Field | Description |
|---|---|
| `plan` | `FREE` / `PRO` / `BUSINESS` |
| `role` | `ADMIN` / `DEVELOPER` / `VIEWER` |
| `subscriptionId` | LemonSqueezy subscription ID (saved on subscription_created) |
| `lemonSqueezyId` | LemonSqueezy customer ID |
| `twoFactorEnabled` | TOTP-based MFA flag |

---

## 4. Plan Limits

All limits are in `lib/plans.ts` — single source of truth. Never hardcode elsewhere.

| Limit | Free | PRO | Agency |
|---|:---:|:---:|:---:|
| Monitored sites | 1 | 10 | Unlimited |
| Check frequency | Every 5 min | Every 5 min | Every 1 min* |
| Code audits/mo | 3 | 50 | Unlimited |
| Webhooks | 1 | 5 | 50 |
| Log retention | 7 days | 30 days | 365 days |
| API keys | No | Yes | Yes |
| Cache revalidation | No | Yes | Yes |
| AI diagnosis | No | Yes | Yes |
| Intelligence Bank | Own files only | Global shared | Global shared |

*Agency 1-min frequency requires Vercel Pro plan with cron every minute. Currently all plans check every 5 min via cron-job.org external cron.

Admins (`role === 'ADMIN'`) bypass all plan limits on every route.

---

## 5. Uptime Monitoring

### How It Works

1. User registers a URL (any public URL — no integration needed)
2. External cron (cron-job.org) calls `GET /api/cron/monitor` every 5 minutes with `Authorization: Bearer CRON_SECRET`
3. Cron fetches each monitor's user plan, calculates if the check interval has elapsed since `lastChecked`
4. Due monitors are checked in batches of 10 with an 8-second timeout per probe
5. Result is written to the `Check` table regardless of UP/DOWN
6. If status changed since last check, webhooks fire and alert email is sent
7. Dashboard reads stored `Check` records — it never triggers checks itself

### Critical Architecture Note

The GET `/api/monitors` route only returns stored data. It does NOT trigger any checks. All checks happen exclusively via the cron. This was a previous source of false DOWN incidents (proactive checks fired on every page load) — that code has been removed.

### Error Messages

| Raw error | Displayed as |
|---|---|
| AbortError / TimeoutError | Request timed out |
| fetch failed / ECONNREFUSED | Connection refused |
| HTTP 4xx/5xx | HTTP {status}: {statusText} |

---

## 6. Cache Revalidation

Requires PRO or Agency plan + Machine API Key.

### Setup (one time, in the user's app)

```ts
// app/api/revalidate/route.ts — add this to YOUR Next.js app
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

### Usage

```ts
// From CI/CD, CMS webhook, or GitHub Action:
await fetch('https://nextjs-optimizer-suite.vercel.app/api/revalidate', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_MACHINE_API_KEY',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ tag: 'products' }),
});
```

NexPulse forwards the request to the user's registered endpoint using their `REVALIDATE_SECRET`. The user's app calls `revalidateTag()` / `revalidatePath()` and returns immediately.

---

## 7. Neural Code Audit Engine

### Flow

1. User provides source: GitHub repo, ZIP upload, or pasted code
2. Files filtered by extension: `.ts .tsx .js .jsx .py .go .java .cs .json .yaml .yml .md .txt`
3. Each file hashed with SHA-256, checked against `AuditCache` table
4. Cache hits returned instantly. Cache misses sent to Groq `llama-3.3-70b`
5. Results stream back via SSE as each file completes
6. AI Diagnosis generated for PRO/Agency (plain-English summary of biggest risks)
7. Final report saved to `CodeReview` table

### Cache Scoping by Plan

- **Free**: only benefits from their own prior file submissions
- **PRO/Agency**: benefits from the global shared cache — if any user ever audited the same file (by hash), result is returned instantly

### Code Health Score

| Grade | Score |
|---|---|
| A | 90–100 |
| B | 75–89 |
| C | 60–74 |
| D | Below 60 |

### AI Fallback Chain

| Tier | Model | Trigger |
|---|---|---|
| 1 | Groq llama-3.3-70b-versatile | All requests |
| 2 | Groq llama-3.1-8b-instant | 70B quota exhausted |
| 3 | Gemini Flash → Gemini Pro | All Groq unavailable |

---

## 8. Pulse-AI Assistant

- Requires user authentication — anonymous visitors cannot use it
- Rate limited: 30 messages per minute per user
- Uses the same 3-tier AI fallback chain as Code Audit
- System prompt contains accurate plan pricing, feature descriptions, check frequencies, student trial info, cache revalidation setup, and what each dashboard tab does
- On mobile: goes fullscreen so keyboard doesn't cover the input
- Chat history is session-only — not persisted to DB

---

## 9. Billing (LemonSqueezy)

### Webhook Events

All received at `/api/webhooks/lemonsqueezy`, verified via HMAC-SHA256.

| Event | Action |
|---|---|
| `order_created` / `order_paid` | Upgrade plan, send confirmation email |
| `subscription_created` | Upgrade plan, save `subscriptionId` + `lemonSqueezyId`, send email |
| `subscription_updated` | Handle mid-cycle plan change |
| `subscription_cancelled` | Send cancellation email with end date. Plan stays active. |
| `subscription_expired` | Downgrade to FREE, clear `subscriptionId` |
| `subscription_payment_failed` | Log only — LS manages retries |
| `subscription_payment_success` | Self-heal plan if DB out of sync |

### Student Trial Flow

1. User submits academic email + student ID card photo/PDF via Dashboard → Profile → Student Access
2. ID card stored in Vercel Blob (private access — signed URL required to view)
3. Record created with status `PENDING`
4. Admin reviews in Admin → Student Trials tab — views ID card via signed URL (60s expiry)
5. Approve → plan set to PRO, 30-day `expiresAt` set, approval email sent
6. Reject → rejection reason + optional note saved, rejection email sent with reapply instructions
7. Rejected users can reapply with corrected information
8. Daily cron at 2am UTC checks for expired trials — downgrades to FREE unless `subscriptionId` is set

### Gifted Trial Flow

1. Admin goes to Admin → Users → clicks ⚡ icon on any user
2. Modal: pick PRO or Agency, choose 7/30/60/90 days or permanent, optional internal note
3. Plan upgraded immediately, `GiftedTrial` record created, email sent to user
4. Daily cron expires non-permanent gifts — skips users with active `subscriptionId`

### Emails Sent

| Trigger | Template |
|---|---|
| Subscription created/paid | `payment-confirmation.tsx` |
| Subscription cancelled | `subscription-cancelled.tsx` |
| Student trial approved | `student-trial.tsx` |
| Student trial rejected | `student-rejection.tsx` |
| Student trial 3 days before expiry | `student-trial-reminder.tsx` |
| Student trial 1 day before expiry | `student-trial-reminder.tsx` |
| Student trial expired | `student-trial-expired.tsx` |
| Gifted trial | `gifted-trial.tsx` |

---

## 10. Promotions System

- Admin creates promotions via `POST /api/promotions` (admin only)
- `GET /api/promotions` returns the current active promotion — no auth required
- `PromoBanner` component fetches on mount, shows countdown timer and click-to-copy discount code
- Banner hidden if user is already on the target plan
- Banner dismissed per session (sessionStorage)
- Daily cron auto-sets `isActive = false` when `endsAt` passes

---

## 11. Security Architecture

| Layer | Implementation |
|---|---|
| Auth cookies | HttpOnly, Secure, SameSite=Strict |
| Password storage | bcrypt |
| API key storage | SHA-256 hash only, plain text shown once |
| SSRF prevention | `validateSafeUrl()` called before every outbound fetch (monitors, webhooks, analyze) |
| Rate limiting | `checkRateLimit()` on all auth and AI endpoints |
| Input validation | Zod schemas on all API route inputs |
| MFA | TOTP via speakeasy, optional per user |
| Brute force | Failed login tracking + Discord security alerts |
| CSP | No `unsafe-eval` globally |
| Timing attacks | `crypto.timingSafeEqual()` for secret comparisons |
| Student ID cards | Private Vercel Blob — served via signed URL (60s expiry), admin only |

---

## 12. Cron Jobs

| Route | Schedule | External Trigger | Purpose |
|---|---|---|---|
| `/api/cron/monitor` | Every 5 min | cron-job.org | Uptime health checks |
| `/api/cron/expire-trials` | Daily 2am UTC | cron-job.org | Expire student/gifted trials, deactivate ended promotions |

Both require `Authorization: Bearer CRON_SECRET`.

Vercel `vercel.json` also registers both as daily fallback crons (Hobby plan limit). The external cron-job.org runs at higher frequency.

---

## 13. Environment Variables

See `.env.example` for the full documented list.

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Custom JWT signing (min 32 chars) |
| `NEXTAUTH_SECRET` | Yes | NextAuth session signing |
| `ADMIN_EMAIL` | Yes | Auto-promoted to ADMIN on first registration |
| `GROQ_API_KEY` | For AI | Groq API |
| `GEMINI_API_KEY` | For AI fallback | Google Gemini |
| `BLOB_READ_WRITE_TOKEN` | For student ID uploads | Vercel Blob (copy manually from Blob store Tokens tab) |
| `LEMONSQUEEZY_WEBHOOK_SECRET` | For billing | Webhook HMAC verification |
| `CRON_SECRET` | For cron jobs | Protects cron endpoints |

---

## 14. Known Constraints

| Constraint | Impact | Workaround |
|---|---|---|
| Vercel Hobby — cron max once/day | Can't run monitor cron every 5 min via Vercel | Use cron-job.org (free) |
| Vercel Hobby — function timeout 10s | Long code audits may hit limit | Upgrade to Vercel Pro |
| Groq 100k tokens/day (free tier) | AI falls back to smaller models | 3-tier fallback handles it |
| `@react-email` packages deprecated | Build warnings (not errors) | Migrate to new package names eventually |
| `subscriptionId` unique per user | Only one active LemonSqueezy sub tracked | Sufficient for current billing model |
