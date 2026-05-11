# NexPulse — AI Agent Operating Directives

This file governs how AI coding assistants (Cursor, Copilot, Antigravity, etc.) should behave when contributing to this codebase.

---

## 1. Before Writing ANY Code

1. Read `MASTER_GUIDE.md` for architecture, auth system, and feature context
2. Read `API_DOCS.md` for endpoint contracts
3. Read `DEPLOYMENT_CHECKLIST.md` for environment variable requirements
4. Check `lib/plans.ts` before touching any feature gate — plan limits are enforced server-side

---

## 2. Authentication — Critical Rules

NexPulse has TWO auth systems running in parallel. Know which one applies:

| System | Cookie | Users |
|---|---|---|
| Custom JWT | `token` (HttpOnly) | Email/password login |
| NextAuth v4 | `next-auth.session-token` | Google / GitHub OAuth |

- **Always** use `getTokenFromRequest(req)` from `lib/auth.ts` in route handlers — never manually read cookies
- **Never** trust frontend-only guards. ALL API routes must call `getTokenFromRequest`
- The logout flow must call BOTH `/api/auth/logout` (clears JWT) AND NextAuth `signOut()` (clears OAuth session)
- `emailVerified` is guaranteed to be set for OAuth users via the `events.signIn` handler in `lib/auth-options.ts`

---

## 3. Code Audit Engine

The Neural Code Audit engine lives in `core/analyzer/code-review.ts`. Key rules:

- **Intelligence Bank**: Always hash files with `getFileHash()` before auditing. Check the hash against DB records to skip unchanged files
- **File coverage**: Include `.ts`, `.tsx`, `.js`, `.jsx`, `.py`, `.go`, `.java`, `.cs`, `.json`, `.yaml`, `.yml`, `.md`, `.txt`
- **Report synthesis**: `finalizeReport()` MUST include the full file manifest even when zero issues are found (prevents empty report bug)
- **Streaming**: The `/api/code-review` route uses SSE. Never buffer the entire response — stream logs as they are generated
- **Error handling**: Catch per-file errors individually; one bad file must not abort the whole audit

---

## 4. Pulse-AI (AI Chat)

The chat engine uses a 3-tier fallback in `app/api/ai/chat/route.ts`:

1. **Groq `llama-3.3-70b-versatile`** — Primary
2. **Groq `llama-3.1-8b-instant`** — Buffer (when 70B hits daily quota)
3. **Gemini Flash → Pro** — Last resort

- Never use `any` type in catch blocks — use `unknown` and check `instanceof Error`
- The system prompt in `SYSTEM_PROMPT` must use **exact dashboard tab names**: `Monitoring`, `SEO Analyzer`, `Code Audit`, `API Keys`, `Webhooks`, `Logs`

---

## 5. Plan Gating

- Plan limits are defined in `lib/plans.ts` — a single source of truth
- Always check `PLAN_LIMITS[user.plan].allowApiKeys` (etc.) server-side before performing gated actions
- Never gate features on the frontend only — the backend route must also check
- Admins (`role === 'ADMIN'`) bypass plan limits on all routes

---

## 6. Mobile-First Standards

- All UI components must be functional and readable on screens ≥ 320px wide
- Use `hidden md:flex` / `md:hidden` pattern for desktop/mobile layout splits
- Bottom navigation bar is used on mobile (`md:hidden` fixed bottom bar in `app/dashboard/page.tsx`)
- Touch targets must be ≥ 44px tall

---

## 7. Environment Variables

- **Never** add `NEXT_PUBLIC_` prefix to secrets (DB URLs, JWT secrets, API keys)
- `NEXT_PUBLIC_APP_URL` is the only public env var — used for OAuth callbacks
- Local dev: `.env.local` points to localhost. Production: Vercel dashboard env vars point to production URL
- Two GitHub OAuth Apps are used: one for NextAuth login (`GITHUB_ID`), one for Code Review (`GITHUB_CODE_REVIEW_CLIENT_ID`)

---

## 8. Vercel Deployment Constraints

- `images.unoptimized: true` MUST remain in `next.config.ts` (Hobby plan image transform limit)
- Heavy client components in `app/layout.tsx` MUST use `next/dynamic` with `ssr: false` to prevent chunk timeout
- Code audit functions must complete within Vercel's function timeout (60s on Pro, 10s on Hobby)
- The 3-tier AI fallback exists specifically because Groq's free tier has a 100k token/day limit

---

## 9. Prohibited Actions

- ❌ Do NOT remove `getFileHash`, `callGroq`, or `getGrade` from `core/analyzer/code-review.ts`
- ❌ Do NOT change `session.strategy` away from `"database"` in `lib/auth-options.ts`
- ❌ Do NOT use `router.push("/login")` for logout — use the full dual-clear pattern
- ❌ Do NOT store plain-text API keys in the database — only SHA-256 hashes
- ❌ Do NOT use `gemini-1.5-flash` alone as a model name — iterate through model list with try/catch
