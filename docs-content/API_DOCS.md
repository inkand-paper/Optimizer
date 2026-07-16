# NexPulse API Reference

Last updated: July 2025

## Base URL

Production: `https://nextjs-optimizer-suite.vercel.app`

---

## Authentication

### Session Cookie (Dashboard features)
Set automatically at login. Sent with `credentials: 'include'` on all dashboard API calls.

### Machine API Key (External integrations)
Generated in Dashboard → API Keys. Requires PRO or Agency plan.
```
Authorization: Bearer opt_your_key_here
```

---

## Auth Endpoints

### `POST /api/auth/register`
Create a new account.
Rate limited: 5 requests per 10 minutes per IP.

```json
{ "email": "you@example.com", "password": "...", "name": "Your Name" }
```

- Non-admin users must verify email before logging in — no JWT issued at registration for unverified accounts
- Verification token uses `crypto.randomBytes(32)` — cryptographically secure

### `POST /api/auth/login`
Authenticate with email and password. Returns JWT cookie.
If MFA is enabled, returns a short-lived challenge token instead of a full session.

### `POST /api/auth/2fa/verify`
Complete MFA login.
```json
{ "code": "123456", "challengeToken": "..." }
```

### `GET /api/auth/me`
Returns the authenticated user's profile.
```json
{
  "success": true,
  "user": { "id": "...", "email": "...", "name": "...", "plan": "PRO", "role": "DEVELOPER", "emailVerified": true, "twoFactorEnabled": false }
}
```

### `POST /api/auth/change-password`
Requires current password + new password (min 8 chars).

### `POST /api/auth/forgot-password`
Sends a password reset link to the email address.

### `POST /api/auth/verify/resend`
Resend the email verification link.

---

## Core Endpoints

### `POST /api/revalidate`
Trigger a cache revalidation by tag or path.
Requires: Machine API Key, PRO or Agency plan.

```json
{ "tag": "products" }
// or
{ "path": "/blog/my-post" }
```

Response: `{ "success": true, "revalidated": "products", "timestamp": "..." }`

### `POST /api/analyze`
Run an SEO + performance audit on a live URL.
Requires: Machine API Key.
URL is validated against SSRF blocklist before any request.

```json
{ "url": "https://your-site.com" }
```

### `POST /api/code-review`
Run the Neural Code Audit Engine. Returns an SSE stream.
Requires: User session.

**GitHub:**
```json
{ "source": "GITHUB", "repoName": "username/repo", "branch": "main" }
```

**Paste:**
```json
{ "source": "PASTE", "code": "...", "fileName": "main.ts" }
```

**ZIP:** `multipart/form-data` with `file` field.

SSE stream:
```
data: {"log": "Scanning 24 files..."}
data: {"log": "Cache hit: utils.ts"}
data: {"log": "Analysing: auth.ts"}
data: {"done": true, "report": { ... }}
```

### `GET /api/code-review/:id`
Returns a saved audit report by ID.

---

## Monitors

### `GET /api/monitors`
Returns all monitors for the authenticated user with their latest status.
**Does NOT trigger any checks** — reads stored data only.

### `POST /api/monitors`
Register a new URL for monitoring.
URL validated against SSRF blocklist before saving.
```json
{ "name": "My Site", "url": "https://example.com" }
```

### `DELETE /api/monitors/:id`
Remove a monitor and all its history.

---

## API Keys

### `GET /api/keys`
List all Machine API Keys for the authenticated user.

### `POST /api/keys`
Create a new key. Plain-text key returned **once only** — not recoverable.
Requires PRO or Agency plan.

### `DELETE /api/keys/:id`
Revoke a key immediately.

---

## Webhooks

### `GET /api/webhooks`
List all configured webhooks.

### `POST /api/webhooks`
Create a webhook. URL validated against SSRF blocklist.
```json
{ "url": "https://discord.com/api/webhooks/...", "events": ["DOWN", "UP"] }
```

### `DELETE /api/webhooks/:id`
Remove a webhook.

---

## AI Chat

### `POST /api/ai/chat`
Send a message to Pulse-AI.
Requires: User session (must include `credentials: 'include'`).
Rate limited: 30 messages per minute per user.

```json
{
  "message": "What does PRO include?",
  "history": [{ "role": "user", "content": "..." }, { "role": "assistant", "content": "..." }]
}
```

Response: `{ "content": "PRO includes..." }`

---

## Promotions

### `GET /api/promotions`
Returns current active promotion. No auth required.
```json
{
  "promotion": {
    "title": "Launch Sale",
    "discountCode": "LAUNCH30",
    "discountPercent": 30,
    "targetPlan": "ALL",
    "endsAt": "2025-08-07T23:59:59Z"
  }
}
```
Returns `{ "promotion": null }` when no active promotion.

### `POST /api/promotions`
Create a promotion. Admin only.
```json
{
  "title": "Black Friday",
  "discountCode": "BF40",
  "discountPercent": 40,
  "targetPlan": "PRO",
  "isActive": true,
  "startsAt": "2025-11-29T00:00:00Z",
  "endsAt": "2025-11-30T23:59:59Z"
}
```

### `PATCH /api/promotions`
Update a promotion. Admin only. Pass `id` + any fields to update.

### `DELETE /api/promotions`
Delete a promotion. Admin only. `{ "id": "..." }`

---

## Student Trial

### `POST /api/student/upload`
Upload a student ID card to Vercel Blob (private access).
Requires: User session.
Rate limited: 5 uploads per hour per user.

`multipart/form-data` with `file` field. Accepts JPG, PNG, WebP, PDF. Max 5MB.

Response: `{ "success": true, "url": "blob://..." }`

### `POST /api/student/verify`
Submit academic email + ID card URL for manual admin review.
Requires: User session, FREE plan.
Rate limited: 3 attempts per hour per user.

```json
{ "eduEmail": "you@university.edu.bd", "studentIdUrl": "blob://..." }
```

- Accepted domains: any institutional email (`.edu`, `.ac.uk`, `.edu.bd`, `.com.bd`, etc.)
- Returns `PENDING` status — admin must approve before plan upgrades
- Rejected users can reapply — old record deleted atomically with new record creation

### `GET /api/student/verify`
Get current user's trial status.
```json
{
  "hasTrial": true,
  "status": "PENDING",
  "eduEmail": "you@uni.edu",
  "expiresAt": null,
  "rejectionReason": null,
  "rejectionNote": null
}
```

---

## Admin Endpoints

### `GET /api/admin/users`
List all users (max 100). Admin only.

### `PATCH /api/admin/users`
Update a user's plan or role. Admin only.
```json
{ "userId": "...", "plan": "PRO", "role": "DEVELOPER" }
```
Validated with Zod enums — invalid values rejected.

### `GET /api/admin/student-trials?status=PENDING`
List student trial applications by status (PENDING / APPROVED / REJECTED). Admin only.

### `PATCH /api/admin/student-trials`
Approve or reject a student trial. Admin only.
```json
{
  "trialId": "...",
  "action": "APPROVE"
}
// or
{
  "trialId": "...",
  "action": "REJECT",
  "rejectionReason": "Document unreadable — image is too blurry or cropped",
  "rejectionNote": "Please retake the photo in good lighting"
}
```

### `GET /api/admin/student-trials/signed-url?trialId=xxx`
Returns a 302 redirect to a 60-second signed Vercel Blob URL for viewing the student ID card. Admin only. Uses `issueSignedToken` + `presignUrl` — no file data passes through the function.

### `POST /api/admin/gift-trial`
Gift a plan to any user. Admin only.
```json
{
  "userId": "...",
  "plan": "PRO",
  "days": 30,
  "permanent": false,
  "reason": "launch promo"
}
```

### `DELETE /api/admin/gift-trial`
Revoke a gifted plan, downgrade user to FREE. Admin only.
```json
{ "userId": "..." }
```

---

## Cron Endpoints

### `GET /api/cron/monitor`
Run uptime checks for all due monitors.
Requires: `Authorization: Bearer CRON_SECRET`
Called by cron-job.org every 5 minutes.

Checks monitors whose `lastChecked` is older than their plan interval. Batches of 10, 8s timeout per probe.

Response: `{ "success": true, "total": 5, "checked": 3, "successful": 3, "failed": 0 }`

### `GET /api/cron/expire-trials`
Daily maintenance cron. Requires: `Authorization: Bearer CRON_SECRET`

- Downgrades expired student trials (skips users with `subscriptionId`)
- Downgrades expired gifted trials (skips users with `subscriptionId`)
- Deactivates promotions past their `endsAt`
- Sends trial expiry reminder emails (3 days and 1 day before expiry)

---

## Billing Webhook

### `POST /api/webhooks/lemonsqueezy`
Receives LemonSqueezy billing events. Verified via HMAC-SHA256 (`x-signature` header).
Called by LemonSqueezy — not by your application.

---

## Response Codes

| Code | Meaning |
|---|---|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request — missing or invalid parameters |
| 401 | Unauthorized — missing/expired session or key |
| 403 | Forbidden — plan limit or insufficient role |
| 404 | Not found |
| 409 | Conflict — duplicate resource |
| 429 | Rate limited |
| 500 | Internal server error |

---

## Outbound Webhook Payload

Sent to user-configured Discord/Slack URLs on monitor status change:

```json
{
  "monitor": "My Production Site",
  "url": "https://example.com",
  "status": "DOWN",
  "latency": null,
  "message": "Request timed out",
  "timestamp": "2025-07-15T09:00:00Z"
}
```

All outbound webhook URLs validated against SSRF blocklist before any request.
