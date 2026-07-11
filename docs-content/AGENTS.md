# NexPulse — AI Agent Operating Directives

This file governs how AI coding assistants (Claude, Cursor, Copilot, etc.) must behave when contributing to this codebase. Read this before writing any code.

---

## 0. Start Here

Before touching any file:

1. Read `MASTER_GUIDE.md` — architecture, auth system, plan limits, all features
2. Read `API_DOCS.md` — every endpoint's contract, auth requirements, and rate limits
3. Read `lib/plans.ts` — single source of truth for all plan limits
4. Check `.env.example` — every env var and what it does

---

## 1. Authentication — Non-Negotiable Rules

NexPulse has TWO auth systems running in parallel. Never confuse them.

| System | Cookie | Used By |
|---|---|---|
| Custom JWT | `token` (HttpOnly) | Email/password login |
| NextAuth v4 | `next-auth.session-token` | Google / GitHub OAuth |

**Always** use `getTokenFromRequest(req)` from `lib/auth.ts` in every route handler. It resolves both systems automatically in priority order.

**Never** read cookies manually or trust frontend-only guards.

The logout flow must clear BOTH systems: call `/api/auth/logout` (clears JWT) AND NextAuth `signOut()` (clears OAuth session).

`emailVerified` is guaranteed set for OAuth users via the `events.signIn` handler in `lib/auth-options.ts`.

---

## 2. Security — Required on Every New Route

Every new API route you write must:

1. **Auth**: Call `getTokenFromRequest(req)` and return 401 if null
2. **Rate limiting**: Call `checkRateLimit()` from `lib/rate-limit.ts` on any public-facing or expensive endpoint
3. **SSRF**: Call `validateSafeUrl(url)` from `lib/ssrf.ts` before any `fetch()` to a user-supplied URL
4. **Input validation**: Use Zod to parse and validate all request bodies

If you skip any of these on a new route, the PR will be rejected.

---

## 3. Plan Limits — Single Source of Truth

`lib/plans.ts` is the ONLY place plan limits are defined. Never hardcode limits in route files.

```ts
// Correct
import { PLAN_LIMITS } from '@/lib/plans';
const limit = PLAN_LIMITS[user.plan].audits;

// Wrong — never do this
const limit = user.plan === 'PRO' ? 50 : 3;
```

Always check limits server-side. Frontend gating is cosmetic only.

Admins (`role === 'ADMIN'`) bypass all plan limits. Check `isAdmin` before enforcing any limit.

---

## 4. Code Audit Engine

Lives in `core/analyzer/code-review.ts`. Rules:

- Hash every file with `getFileHash()` before auditing
- Check hash against AuditCache DB records to skip unchanged files
- FREE users: only serve cache hits from their own prior submissions
- PRO/BUSINESS users: serve from global shared cache
- `finalizeReport()` must include the full file manifest even when zero issues are found
- Catch per-file errors individually — one bad file must never abort the whole audit
- The route uses SSE — never buffer the full response, stream logs as they generate

Supported file extensions: `.ts`, `.tsx`, `.js`, `.jsx`, `.py`, `.go`, `.java`, `.cs`, `.json`, `.yaml`, `.yml`, `.md`, `.txt`

---

## 5. Pulse-AI Chat

Route: `app/api/ai/chat/route.ts`

3-tier fallback chain (in order):
1. Groq `llama-3.3-70b-versatile` — Primary
2. Groq `llama-3.1-8b-instant` — Buffer when 70B hits daily quota (100k tokens/day on free tier)
3. Google Gemini Flash, then Pro — Last resort

The system prompt must reference exact dashboard tab names: `Monitoring`, `SEO Analyzer`, `Code Audit`, `API Keys`, `Webhooks`, `Logs`.

The endpoint requires user authentication and is rate limited to 30 messages per minute per user.

---

## 6. Billing (LemonSqueezy)

Webhook handler: `app/api/webhooks/lemonsqueezy/route.ts`

Every event is verified with HMAC-SHA256 before processing. Never process an event without verifying the signature.

`subscriptionId` and `lemonSqueezyId` are saved to the User record on `subscription_created`.

Do not downgrade a user on `subscription_cancelled`. Only downgrade on `subscription_expired`. LemonSqueezy keeps access active until the period ends.

The daily cron at `/api/cron/expire-trials` also handles student trial expiry and promotion deactivation. Do not duplicate this logic.

---

## 7. Promotions System

Promotion model: `prisma/schema.prisma` → `Promotion`

Promotions are created by admins only via `POST /api/promotions`. The `PromoBanner` component in `components/promo-banner.tsx` fetches `GET /api/promotions` on mount and displays the active promotion with a live countdown.

Do not add promotion logic to the frontend that bypasses the API. The banner respects `targetPlan` — it will not show a PRO promotion to users already on PRO or BUSINESS.

Promotions auto-deactivate when `endsAt` passes via the daily cron. Do not add manual deactivation logic to the banner component.

---

## 8. Student Trial

API: `POST /api/student/verify`, `GET /api/student/verify`

The trial upgrades the user to PRO for 30 days by writing a `StudentTrial` record and updating `user.plan`. One trial per user (by `userId`) and one per email (by `eduEmail`). Both constraints are enforced at the DB level with unique indexes.

The daily cron downgrades expired trials but checks `user.subscriptionId` first — if the user subscribed during their trial they must not be downgraded.

Accepted academic domains are defined in `app/api/student/verify/route.ts`. If you add new domains, add them there only.

---

## 9. Mobile-First Standards

- All UI must be readable on screens 320px and wider
- Use `hidden md:flex` / `md:hidden` for desktop/mobile layout splits
- Mobile bottom navigation bar: fixed, `md:hidden`, lives in `app/dashboard/page.tsx`
- Touch targets minimum 44px tall
- The profile page (`app/dashboard/profile/page.tsx`) uses `sm:` and `md:` breakpoints throughout — follow the same pattern for any new dashboard pages

---

## 10. Copy and Tone

- No em dashes (`—`) in user-facing UI text. Use commas, periods, or restructure the sentence.
- No middle dots (`·`) as list separators in UI. Use commas.
- No version tags or taglines in UI text (no "v2.0", no "infrastructure intelligence engine").
- Keep copy direct. Avoid marketing-speak in error messages, tooltips, and labels.

---

## 11. Environment Variables

- Never add `NEXT_PUBLIC_` prefix to secrets (DB URLs, JWT secrets, API keys)
- `NEXT_PUBLIC_APP_URL` is the only public env var — used for OAuth callbacks
- Two separate GitHub OAuth apps: `GITHUB_ID`/`GITHUB_SECRET` for NextAuth login, `GITHUB_CODE_REVIEW_CLIENT_ID`/`GITHUB_CODE_REVIEW_CLIENT_SECRET` for Code Review repo access
- All env vars are documented in `.env.example` at the repo root

---

## 12. Vercel Deployment

- Image optimization is now enabled with `remotePatterns` in `next.config.ts` (Gravatar, GitHub, Google). Do not revert to `unoptimized: true`.
- Heavy client components in `app/layout.tsx` must use `next/dynamic` with `ssr: false`
- Cron jobs are registered in `vercel.json` and require `CRON_SECRET` in the Authorization header
- `typescript`, `@types/*`, `eslint`, and `eslint-config-next` must stay in `dependencies` (not `devDependencies`) because Vercel's build environment does not install devDependencies

---

## 13. Prohibited Actions

- Do NOT remove `getFileHash`, `callGroq`, or `getGrade` from `core/analyzer/code-review.ts`
- Do NOT change `session.strategy` away from `"database"` in `lib/auth-options.ts`
- Do NOT use `router.push("/login")` for logout — use the full dual-clear pattern
- Do NOT store plain-text API keys in the database — only SHA-256 hashes
- Do NOT use `as unknown as number` or similar unsafe casts in `lib/auth.ts` — use `SignOptions['expiresIn']`
- Do NOT revert `allowDangerousEmailAccountLinking` — it was removed intentionally
- Do NOT hardcode plan limits outside `lib/plans.ts`
- Do NOT add `unsafe-eval` back to the Content-Security-Policy in `next.config.ts`
- Do NOT skip `validateSafeUrl()` on any route that fetches a user-supplied URL
- Do NOT issue a JWT cookie to unverified users at registration

---

## 14. What Good PRs Look Like

- TypeScript: zero errors (`npx tsc --noEmit` passes)
- ESLint: zero errors and zero warnings (`npx eslint . --ext .ts,.tsx`)
- Tests: all pass (`npm run test`)
- New API routes: auth + rate limit + Zod validation + SSRF guard (if applicable)
- No plan limits hardcoded outside `lib/plans.ts`
- No em dashes or middle dots in UI copy
- Mobile tested at 375px width
