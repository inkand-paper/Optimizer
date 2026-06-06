# Contributing to NexPulse

Thanks for your interest in contributing. This guide covers everything you need to get started.

---

## Table of Contents

- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Code Style](#code-style)
- [Making Changes](#making-changes)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)

---

## Development Setup

### Prerequisites

- Node.js ≥ 20 (check with `node -v`)
- PostgreSQL database (local or [Supabase](https://supabase.com) free tier)
- Git

### Steps

```bash
# 1. Fork the repo and clone your fork
git clone https://github.com/YOUR_USERNAME/Optimizer
cd Optimizer

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local — minimum required:
#   DATABASE_URL, DIRECT_URL, JWT_SECRET, NEXTAUTH_SECRET, NEXTAUTH_URL

# 4. Run database migrations
npx prisma migrate dev

# 5. Start the dev server
npm run dev
# → http://localhost:3000
```

### Running Tests

```bash
npm run test          # run all tests once
npm run test:watch    # watch mode
npm run test:coverage # with coverage report
```

### Type Checking

```bash
npx tsc --noEmit
```

### Linting

```bash
npm run lint
```

---

## Project Structure

```
Optimizer/
├── app/
│   ├── api/           # API route handlers (Next.js App Router)
│   │   ├── auth/      # Authentication endpoints
│   │   ├── analyze/   # SEO & performance audit
│   │   ├── code-review/ # Neural code audit (SSE streaming)
│   │   ├── monitors/  # Uptime monitoring
│   │   ├── revalidate/ # Cache pulse engine
│   │   └── ai/chat/   # Pulse-AI assistant
│   └── dashboard/     # Dashboard UI pages
├── core/
│   └── analyzer/      # Pure audit logic (SEO, security, performance, code review)
├── lib/               # Shared utilities (auth, rate-limit, SSRF guard, plans, etc.)
├── components/        # Shared React components
├── prisma/            # Database schema and migrations
└── __tests__/         # Unit tests (Vitest)
```

**Key files to read before contributing:**

| File | Why |
|---|---|
| `lib/auth.ts` | Dual-auth system (JWT + NextAuth) — always use `getTokenFromRequest()` |
| `lib/plans.ts` | Single source of truth for plan limits — check before adding features |
| `lib/rate-limit.ts` | Rate limiting — add to any new public endpoint |
| `lib/ssrf.ts` | SSRF guard — use `validateSafeUrl()` before any outbound fetch |
| `prisma/schema.prisma` | Data model |

---

## Code Style

- **TypeScript** everywhere — no `any` casts without a comment explaining why
- **Zod** for all API input validation
- **No** hardcoded plan limits outside `lib/plans.ts`
- **No** direct `process.env` access in route handlers — add to `lib/config.ts`
- All new API routes must call `getTokenFromRequest()` for auth
- All new outbound URL fetches must call `validateSafeUrl()` first
- New public endpoints need rate limiting via `checkRateLimit()`

---

## Making Changes

1. **Create a branch** from `main`:
   ```bash
   git checkout -b fix/your-fix-name
   # or
   git checkout -b feat/your-feature-name
   ```

2. **Make your changes** — keep commits focused and atomic

3. **Test your changes**:
   ```bash
   npm run test
   npx tsc --noEmit
   npm run lint
   ```

4. **Commit** using conventional commit format:
   ```
   fix(auth): prevent JWT issue for unverified users
   feat(monitors): add latency percentile tracking
   docs(readme): update self-hosting instructions
   chore: remove stale postcss config
   ```

---

## Pull Request Process

1. Push your branch and open a PR against `main`
2. Fill in the PR template — describe what changed and why
3. CI must pass (lint, tests, build)
4. A maintainer will review within a few days
5. Address any requested changes
6. Once approved, the maintainer will merge

**PR tips:**
- Keep PRs focused — one concern per PR
- Link any related issues with `Closes #123`
- Add or update tests for non-trivial changes
- Update relevant docs if you change behavior

---

## Issue Reporting

### Bug Reports

Open an issue and include:
- What you expected to happen
- What actually happened
- Steps to reproduce
- Environment (OS, Node version, browser if frontend)
- Any relevant error messages or screenshots

### Feature Requests

Open an issue describing:
- The problem you're trying to solve
- Your proposed solution
- Any alternatives you considered

### Security Issues

**Do not open public issues for security vulnerabilities.** See [SECURITY.md](./SECURITY.md).

---

## Questions?

Join the [Discord server](https://discord.gg/gSw2sHxZtn) or email nexpulse.team@gmail.com.
