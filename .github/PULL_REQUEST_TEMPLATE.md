## Summary

<!-- One or two sentences describing what this PR does and why. -->

Closes #<!-- issue number if applicable -->

---

## Type of Change

<!-- Check all that apply -->

- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that changes existing behavior)
- [ ] Performance improvement
- [ ] Refactor (no behavior change)
- [ ] Documentation update
- [ ] Dependency update
- [ ] CI / tooling change

---

## What Changed

<!-- List the specific files/components changed and why. Be concrete. -->

-
-

---

## Testing

<!-- How did you verify this works? Check all that apply. -->

- [ ] `npm run test` passes locally
- [ ] `npx tsc --noEmit` passes (no new TypeScript errors)
- [ ] `npm run lint` passes (no new ESLint errors)
- [ ] `npm run build` passes locally
- [ ] Manually tested in the browser

**Steps to test manually (if applicable):**

1.
2.

---

## Security Checklist

<!-- If your PR touches auth, API routes, or outbound requests, check these. -->

- [ ] New API routes call `getTokenFromRequest()` for authentication
- [ ] New outbound URL fetches call `validateSafeUrl()` (SSRF guard)
- [ ] New public endpoints call `checkRateLimit()`
- [ ] New API inputs are validated with Zod
- [ ] No plan limits hardcoded outside `lib/plans.ts`
- [ ] Not applicable (docs/CI/refactor only)

---

## Screenshots

<!-- If this is a UI change, add before/after screenshots or a short screen recording. -->

---

## Notes for Reviewer

<!-- Anything the reviewer should pay special attention to, known limitations, follow-up tasks, etc. -->
