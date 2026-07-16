# NexPulse — AI Agent Directives

Read this before touching any file in this codebase.

---

## 0. Required Reading Order

1. This file (AGENTS.md)
2. `MASTER_GUIDE.md` — architecture, all features, plan limits
3. `API_DOCS.md` — every endpoint's contract and auth requirements
4. `lib/plans.ts` — single source of truth for plan limits
5. `.env.example` — all environment variables

---

## 1. Authentication — Hard Rules

Two auth systems run in parallel. Never confuse them.

| System | Cookie | Used by |
|---|---|---|
| Custom JWT | `token` (HttpOnly) | Email/password login |
| NextAuth v4 | `next-auth.session-token` | Google / GitHub OAuth |

**Always** use `getTokenFromRequest(req)` from `lib/auth.ts` in every API route handler. It resolves both systems in priority order (JWT first, then NextAuth session).

**Never** read cookies manually. **Never** trust frontend-only auth guards.

Frontend API calls must include `credentials: 'include'` on every fetch — without it, session cookies are not sent and auth always fails with 401.

---

## 2. Security Checklist — Every New Route

Every new API route must have all four:

1. **Auth**: `getTokenFromRequest(req)` → return 401 if null
2. **Rate limiting**: `checkRateLimit()` from `lib/rate-limit.ts`
3. **SSRF guard**: `validateSafeUrl(url)` from `lib/ssrf.ts` before any `fetch()` on a user-supplied URL
4. **Input validation**: Zod schema on all request body fields

Missing any of these = PR rejected.

---

## 3. Plan Limits — Single Source of Truth

`lib/plans.ts` is the ONLY place plan limits are defined.

```ts
// Correct
import { PLAN_LIMITS } from '@/lib/plans';
const limit = PLAN_LIMITS[user.plan as keyof typeof PLAN_LIMITS].audits;

// Wrong — never do this
const limit = user.plan === 'PRO' ? 50 : 3;
```

Admins (`role === 'ADMIN'`) bypass all plan limits. Always check before enforcing.

Frontend plan gating is cosmetic only — always enforce server-side.

---

## 4. Monitoring Architecture — Critical

The GET `/api/monitors` route returns stored data ONLY. It does NOT trigger any checks.

All uptime checks happen exclusively in `/api/cron/monitor` which is called by:
- cron-job.org every 5 minutes (primary)
- Vercel cron daily at midnight (fallback)

**Do NOT add any check-triggering logic to the GET /api/monitors route.** This was previously the source of cascading false DOWN incidents (every dashboard page load triggered proactive checks → timeout errors logged as DOWN events).

The cron checks monitors whose `lastChecked` is older than their plan interval (300s for Free/PRO, 60s for Agency). Monitors never checked (`lastChecked = null`) are always included.

---

## 5. Code Audit Engine

- Hash every file with `getFileHash()` before auditing
- Check hash against `AuditCache` table to skip unchanged files
- **Free users**: cache hits from their own prior submissions only
- **PRO/Agency**: cache hits from global shared cache
- Results stream via SSE — never buffer the full response
- Catch per-file errors individually — one bad file must not abort the whole audit
- `finalizeReport()` must include the full file manifest even when zero issues found

---

## 6. Pulse-AI — Rules

Route: `app/api/ai/chat/route.ts`

- Requires user authentication — returns 401 for unauthenticated requests
- Rate limited: 30 messages per minute per user
- Frontend fetch MUST include `credentials: 'include'`
- 3-tier fallback: Groq 70B → Groq 8B → Gemini Flash → Gemini Pro
- System prompt is the single source of truth for what the AI knows about NexPulse
- When updating features, always update the system prompt too

---

## 7. Billing — Rules

Webhook handler: `app/api/webhooks/lemonsqueezy/route.ts`

- Verify HMAC-SHA256 signature before processing any event
- Save `subscriptionId` + `lemonSqueezyId` on `subscription_created`
- **Do NOT downgrade on `subscription_cancelled`** — only downgrade on `subscription_expired`
- Cron checks `user.subscriptionId` before downgrading trial/gifted users — paying customers are never downgraded by cron

---

## 8. Student Trial — Rules

- Application creates a `PENDING` record — never auto-approves
- Upgrade to PRO only happens when admin explicitly approves via `PATCH /api/admin/student-trials`
- Rejected users can reapply — delete + create wrapped in `prisma.$transaction`
- Email check happens BEFORE deleting old record to avoid race conditions
- Student ID cards stored in **private** Vercel Blob — always serve via signed URL (`/api/admin/student-trials/signed-url`)
- Never expose raw blob URLs to the browser

---

## 9. Gifted Trial — Rules

- One active gift per user (unique `userId` in `GiftedTrial`)
- Giving a new gift to a user who already has one replaces the old one
- Daily cron expires non-permanent gifts — checks `user.subscriptionId` first
- `permanent: true` → `expiresAt: null` → cron never touches it

---

## 10. Promotions — Rules

- `GET /api/promotions` is public (no auth) — returns active promotion or null
- `POST/PATCH/DELETE /api/promotions` admin only
- `PromoBanner` component fetches on mount — do not trigger from server components
- Banner respects `targetPlan` — never shown to users already on the target plan
- Daily cron auto-deactivates promotions past `endsAt`

---

## 11. Copy and Tone Rules

- No em dashes (`—`) in user-facing UI text. Use commas or periods instead.
- No middle dots (`·`) as separators. Use commas.
- No version tags or taglines in UI (no "v2.0", no "infrastructure intelligence engine")
- No unescaped apostrophes in JSX — use `&apos;` or restructure the string
- Error messages: direct and specific. Never "Something went wrong."

---

## 12. Vercel / Build Constraints

- `typescript`, `@types/*`, `eslint`, `eslint-config-next` must stay in `dependencies` (not `devDependencies`) — Vercel's build does not install devDeps
- Image optimization uses `remotePatterns` in `next.config.ts` — do not revert to `unoptimized: true`
- Cron jobs in `vercel.json` are set to daily (Hobby plan limit) — actual frequency handled by cron-job.org
- `BLOB_READ_WRITE_TOKEN` must be copied manually from the Vercel Blob store Tokens tab — it is NOT auto-injected unlike `BLOB_STORE_ID`

---

## 13. Prohibited Actions

- Do NOT add check-triggering logic to GET `/api/monitors`
- Do NOT auto-approve student trials — always require admin review
- Do NOT expose raw Vercel Blob URLs for student ID cards
- Do NOT issue JWT to unverified users at registration
- Do NOT downgrade users on `subscription_cancelled` — only on `subscription_expired`
- Do NOT hardcode plan limits outside `lib/plans.ts`
- Do NOT use `as unknown as number` casts in `lib/auth.ts` — use `SignOptions['expiresIn']`
- Do NOT revert `allowDangerousEmailAccountLinking` — removed intentionally
- Do NOT add `unsafe-eval` to CSP in `next.config.ts`
- Do NOT skip `validateSafeUrl()` before any outbound fetch on user-supplied URLs
- Do NOT skip `credentials: 'include'` on frontend fetch calls to authenticated endpoints

---

## 14. What Good PRs Look Like

- `npx tsc --noEmit` — zero errors
- `npx eslint . --ext .ts,.tsx` — zero errors, zero warnings
- `npm run test` — all tests pass
- New API routes: auth + rate limit + Zod validation + SSRF (if applicable)
- No plan limits hardcoded outside `lib/plans.ts`
- No em dashes or unescaped apostrophes in UI copy
- System prompt updated if any feature changed
- Docs updated if any feature added or changed
