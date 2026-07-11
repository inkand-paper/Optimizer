# NexPulse API Reference

Complete reference for integrating with the NexPulse engine.
Last updated: July 2025

## Base URLs

| Environment | URL |
|---|---|
| Local dev | `http://localhost:3000` |
| Production | `https://nextjs-optimizer-suite.vercel.app` |

---

## Authentication

### Machine API Key
For revalidation, analysis, and key management. Generate from Dashboard → API Keys. Requires PRO or BUSINESS plan.

```http
Authorization: Bearer opt_your_machine_key_here
```

### User Session
Dashboard features (Code Audit, AI Chat, Monitors) use session cookies set at login. OAuth users use the `next-auth.session-token` cookie. For programmatic access, pass the `token` cookie or `Authorization: Bearer <jwt>`.

---

## Endpoints

### `GET /api/health`
Engine health check. No authentication required.

```json
{ "status": "healthy", "timestamp": "...", "memory": { "rss": "..." } }
```

---

### `POST /api/revalidate`
Triggers an instant cache purge by tag or path across registered web assets.
Requires: Machine API Key, PRO or BUSINESS plan.

```json
{ "tag": "products-v2" }
```
```json
{ "path": "/blog/my-post" }
```

Response:
```json
{ "success": true, "revalidated": "products-v2", "timestamp": "..." }
```

---

### `POST /api/analyze`
Crawls a live URL for SEO, Core Web Vitals, security headers, and structured data.
Requires: Machine API Key.

```json
{ "url": "https://your-site.com" }
```

The URL is validated against an SSRF blocklist before any request is made.

---

### `POST /api/code-review`
Runs the Neural Code Audit Engine. Returns a Server-Sent Events (SSE) stream.
Requires: User session.

**GitHub source:**
```json
{ "source": "GITHUB", "repoName": "username/repo", "branch": "main" }
```

**Paste source:**
```json
{ "source": "PASTE", "code": "function hello() { ... }", "fileName": "main.js" }
```

**ZIP source:** `multipart/form-data` with a `file` field containing the `.zip` archive.

SSE stream format:
```
data: {"log": "Scanning 42 files..."}
data: {"log": "Analysing security: auth.ts"}
data: {"done": true, "report": { ... }}
```

Intelligence Bank: unchanged files (by SHA-256 hash) are skipped automatically. FREE users only benefit from their own prior submissions. PRO and BUSINESS users share the global cache.

---

### `GET /api/code-review/:id`
Returns a previously saved audit report by its database ID.
Requires: User session.

---

### `GET /api/auth/me`
Returns the authenticated user's profile, plan, role, and trial status.
Requires: Session cookie or `Authorization: Bearer <jwt>`.

```json
{
  "success": true,
  "user": {
    "id": "...",
    "email": "...",
    "name": "...",
    "plan": "PRO",
    "role": "DEVELOPER",
    "emailVerified": true,
    "twoFactorEnabled": false
  }
}
```

---

### `POST /api/auth/register`
Creates a new user account.
Rate limited: 5 requests per 10 minutes per IP.

```json
{ "email": "you@example.com", "password": "...", "name": "Your Name" }
```

Non-admin users must verify their email before they can log in. A JWT is NOT issued at registration for unverified users.

---

### `POST /api/auth/login`
Authenticates with email and password. Returns JWT cookie.
Rate limited. If MFA is enabled, returns a short-lived challenge token instead of a full session.

---

### `POST /api/auth/2fa/verify`
Completes MFA login by verifying a 6-digit TOTP code.

```json
{ "code": "123456", "challengeToken": "..." }
```

---

### `POST /api/ai/chat`
Sends a message to Pulse-AI. Uses Groq 70B → Groq 8B → Gemini fallback chain.
Requires: User session.
Rate limited: 30 messages per minute per user.

```json
{
  "message": "How do I set up cache revalidation?",
  "history": [{ "role": "user", "content": "..." }, { "role": "assistant", "content": "..." }]
}
```

---

### `GET /api/keys`
Lists all Machine API Keys for the authenticated user.
Requires: User session.

### `POST /api/keys`
Creates a new Machine API Key. The plain-text key is returned only once and cannot be recovered.
Requires: PRO or BUSINESS plan.

### `DELETE /api/keys/:id`
Revokes a Machine API Key immediately.

---

### `GET /api/monitors`
Lists all monitored URLs for the authenticated user.

### `POST /api/monitors`
Registers a new URL for monitoring. The URL is validated against the SSRF blocklist.

```json
{ "name": "My Site", "url": "https://example.com", "interval": 60 }
```

### `DELETE /api/monitors/:id`
Removes a monitor.

---

### `GET /api/promotions`
Returns the current active promotion if one exists. No authentication required.

```json
{
  "promotion": {
    "title": "Black Friday — 40% off PRO",
    "discountCode": "BLACKFRIDAY40",
    "discountPercent": 40,
    "targetPlan": "PRO",
    "endsAt": "2025-12-01T00:00:00Z"
  }
}
```

Returns `{ "promotion": null }` when no active promotion exists.

### `POST /api/promotions`
Creates a new promotion. Admin only.

```json
{
  "title": "Launch Sale",
  "discountCode": "LAUNCH30",
  "discountPercent": 30,
  "targetPlan": "ALL",
  "isActive": true,
  "startsAt": "2025-08-01T00:00:00Z",
  "endsAt": "2025-08-07T23:59:59Z"
}
```

### `PATCH /api/promotions`
Updates a promotion by ID. Admin only. Pass `id` plus any fields to update.

### `DELETE /api/promotions`
Deletes a promotion by ID. Admin only. Pass `{ "id": "..." }`.

---

### `POST /api/student/verify`
Verifies an academic email and activates a 30-day PRO trial.
Requires: User session, FREE plan.
Rate limited: 3 attempts per hour per user.

```json
{ "eduEmail": "you@university.edu" }
```

Accepted domains: `.edu`, `.ac.uk`, `.edu.bd`, `.ac.in`, `.edu.au`, `.edu.sg`, `.edu.pk`, `.ac.nz`

One trial per user and per email address. Returns 409 if already used.

### `GET /api/student/verify`
Returns the current user's student trial status.

```json
{ "hasTrial": true, "eduEmail": "you@uni.edu", "expiresAt": "...", "isExpired": false }
```

---

### `POST /api/webhooks/lemonsqueezy`
Receives billing events from LemonSqueezy. Verified via HMAC-SHA256 signature.
This endpoint is called by LemonSqueezy, not by your application.

---

### `GET /api/cron/monitor`
Runs scheduled uptime health checks. Called by Vercel Cron every 5 minutes.
Requires: `Authorization: Bearer <CRON_SECRET>`.

### `GET /api/cron/expire-trials`
Expires student trials and deactivates ended promotions. Called daily at 2am UTC.
Requires: `Authorization: Bearer <CRON_SECRET>`.

---

## Response Codes

| Code | Meaning |
|---|---|
| `200` | Success |
| `201` | Created |
| `400` | Bad Request — missing or invalid parameters |
| `401` | Unauthorized — missing or expired session/key |
| `403` | Forbidden — plan limit reached or insufficient role |
| `409` | Conflict — duplicate resource (email, student trial) |
| `429` | Rate Limited |
| `500` | Internal server error |

---

## Webhooks (Outbound)

NexPulse sends outbound webhook payloads to user-configured Discord or Slack URLs when:
- A monitored site goes DOWN
- A monitored site recovers (comes back UP)

All outbound webhook URLs are validated against the SSRF blocklist before any request is made.

Payload format:
```json
{
  "monitor": "My Site",
  "url": "https://example.com",
  "status": "DOWN",
  "latency": null,
  "message": "Connection refused",
  "timestamp": "2025-07-11T09:00:00Z"
}
```
