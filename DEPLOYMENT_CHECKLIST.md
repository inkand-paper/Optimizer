# NexPulse Deployment Checklist

Production readiness checklist for NexPulse operators and contributors.

---

## 1. Core Features Verification

- [ ] User signup → email verification → login flow works end-to-end
- [ ] Password reset (forgot password → reset link → new password) works
- [ ] Google OAuth login redirects correctly and sets session
- [ ] GitHub OAuth login redirects correctly and sets session
- [ ] GitHub Code Review OAuth (separate app) links account on Profile page
- [ ] Dashboard loads without JS errors after both JWT and OAuth login
- [ ] Code Audit (GitHub / ZIP / Paste) returns results without hanging
- [ ] Intelligence Bank: second audit of same repo is faster than first
- [ ] Pulse-AI assistant responds in the dashboard chat widget
- [ ] Monitoring dashboard shows live status/latency for registered URLs
- [ ] SEO Analyser returns full report for a public URL
- [ ] Revalidation Pulse sends a cache-clear signal to an integrated app
- [ ] Webhook alerts fire on Discord/Slack when a monitor goes DOWN
- [ ] Activity Logs record all key events (key gen, pulse, audit, login)

---

## 2. Authentication & Authorization

- [ ] `token` cookie is HttpOnly, Secure, SameSite=Strict in production
- [ ] `NEXTAUTH_SECRET` is set and consistent across all deployments
- [ ] JWT secret is rotated from the dev default value
- [ ] Admin routes (`/dashboard/admin`) require ADMIN role
- [ ] API routes verify `getTokenFromRequest` — not just frontend guards
- [ ] OAuth `emailVerified` is set automatically for GitHub/Google users
- [ ] Logout clears both the custom JWT cookie AND the NextAuth session

---

## 3. Environment Variables

### Required in Vercel (Production)

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Supabase/Postgres (pooled via pgbouncer) |
| `DIRECT_URL` | Supabase direct URL (for Prisma migrations) |
| `JWT_SECRET` | Custom JWT signing secret |
| `NEXTAUTH_URL` | `https://nextjs-optimizer-suite.vercel.app` |
| `NEXTAUTH_SECRET` | NextAuth session signing |
| `GITHUB_ID` | NextAuth GitHub OAuth App Client ID |
| `GITHUB_SECRET` | NextAuth GitHub OAuth App Client Secret |
| `GOOGLE_ID` | NextAuth Google OAuth Client ID |
| `GOOGLE_SECRET` | NextAuth Google OAuth Client Secret |
| `GITHUB_CODE_REVIEW_CLIENT_ID` | Separate OAuth App for Code Review feature |
| `GITHUB_CODE_REVIEW_CLIENT_SECRET` | Same as above |
| `GROQ_API_KEY` | Primary AI engine (Code Audit + Pulse-AI) |
| `GEMINI_API_KEY` | Fallback AI engine |
| `RESEND_API_KEY` | Transactional email (verification, reset) |
| `REVALIDATE_SECRET` | Authenticates cache revalidation webhooks |
| `UPSTASH_REDIS_REST_URL` | Rate limiting store |
| `UPSTASH_REDIS_REST_TOKEN` | Rate limiting store auth |
| `NEXT_PUBLIC_APP_URL` | `https://nextjs-optimizer-suite.vercel.app` |

> ⚠️ **NEVER** set `NEXT_PUBLIC_` for secrets. `NEXT_PUBLIC_` variables are exposed to the browser.

---

## 4. OAuth App Registration

### NextAuth GitHub (`GITHUB_ID`)
- Homepage URL: `https://nextjs-optimizer-suite.vercel.app`
- Callback URL: `https://nextjs-optimizer-suite.vercel.app/api/auth/callback/github`

### NextAuth Google (`GOOGLE_ID`)
- Authorized redirect URI: `https://nextjs-optimizer-suite.vercel.app/api/auth/callback/google`

### Code Review GitHub (`GITHUB_CODE_REVIEW_CLIENT_ID`)
- Homepage URL: `https://nextjs-optimizer-suite.vercel.app`
- Callback URL: `https://nextjs-optimizer-suite.vercel.app/api/auth/github-connect/callback`

> For local development, register a separate OAuth App with `http://localhost:3000` URLs and use those credentials in `.env.local`.

---

## 5. Database

- [ ] `npx prisma migrate deploy` run on production DB (not `dev`)
- [ ] All NextAuth tables exist: `User`, `Account`, `Session`, `VerificationToken`
- [ ] `emailVerified`, `githubAccessToken`, `githubUserName`, `plan`, `role` columns present
- [ ] Supabase backups enabled
- [ ] Connection pooling enabled (pgbouncer) via `DATABASE_URL`
- [ ] Direct connection (`DIRECT_URL`) used for migrations only

---

## 6. Payments (LemonSqueezy)

- [ ] `LEMONSQUEEZY_API_KEY` set in production
- [ ] `LEMONSQUEEZY_STORE_ID`, `VARIANT_ID_PRO`, `VARIANT_ID_BUSINESS` set
- [ ] `LEMONSQUEEZY_WEBHOOK_SECRET` set and verified
- [ ] Webhook endpoint registered in LemonSqueezy dashboard
- [ ] Test a successful Pro upgrade end-to-end
- [ ] Test a successful Agency upgrade end-to-end
- [ ] Plan field updates in DB after successful webhook

---

## 7. Performance

- [ ] `next.config.ts` has `unoptimized: true` for images (Vercel Hobby plan)
- [ ] `PulseAI` and `InfrastructureProvider` are dynamically imported in layout
- [ ] `npm run build` completes with zero errors
- [ ] No unused client components that should be server components
- [ ] Vercel Function timeout adequate for Code Audit (≤ 60s)

---

## 8. Security

- [ ] Rate limiting active on `/api/auth/login` (5 req/min)
- [ ] Rate limiting active on `/api/code-review` (AI cost protection)
- [ ] Input validation via Zod on all mutation routes
- [ ] No raw errors leaked to client responses
- [ ] `x-nexpulse-secret` header verified on revalidation endpoint
- [ ] File upload type validation in ZIP audit flow

---

## 9. Vercel Image Transformations
- [ ] `images.unoptimized: true` in `next.config.ts` to avoid Hobby plan limit

---

## 10. Final Smoke Test

After deploying to Vercel:
1. Visit the live URL — landing page loads
2. Register a new account — activation email arrives
3. Click activation link — redirected to login with green banner
4. Sign in with email/password — dashboard loads
5. Sign out — redirected to `/login` with no stale banner
6. Sign in with Google — dashboard loads
7. Sign in with GitHub — dashboard loads
8. Navigate to **Code Audit** — paste code → audit completes
9. Navigate to **SEO Analyser** — scan a URL → report appears
10. Navigate to **Monitoring** — add a URL → live status shows