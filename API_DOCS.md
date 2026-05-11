# NexPulse API Reference

Complete reference for integrating machines and apps with the NexPulse engine.

## Base URLs

| Environment | URL |
|---|---|
| **Local dev** | `http://localhost:3000` |
| **Production** | `https://nextjs-optimizer-suite.vercel.app` |

---

## Authentication

### Machine API Key (for revalidation & key management)
Machine endpoints require an API Key provisioned from **Dashboard → API Keys**.

```http
Authorization: Bearer opt_your_machine_key_here
```

### User Session (for dashboard features)
Dashboard features (Code Audit, AI Chat) use session cookies. Login via the UI or pass the `token` cookie. OAuth users (Google/GitHub) use the `next-auth.session-token` cookie.

---

## Endpoints

### `GET /api/health`
Returns engine status and memory metrics. No authentication required.

**Response:**
```json
{ "status": "healthy", "timestamp": "...", "memory": { "rss": "..." } }
```

---

### `POST /api/revalidate`
Triggers an instant cache purge for a tag or path across connected web assets.  
**Requires**: Machine API Key (Bearer token) · Pro or Agency plan.

**Request:**
```json
{ "tag": "products-v2" }
```
or
```json
{ "path": "/blog/my-post" }
```

**Response:**
```json
{ "success": true, "revalidated": "products-v2", "timestamp": "..." }
```

---

### `POST /api/analyze`
Crawls a live URL for SEO, Core Web Vitals, security headers, and structured data.  
**Requires**: Machine API Key.

**Request:**
```json
{ "url": "https://your-site.com" }
```

---

### `POST /api/code-review`
Runs the Neural Code Audit Engine. Returns a **Server-Sent Events (SSE)** stream of real-time progress logs followed by the final JSON report.  
**Requires**: User session cookie.

**Request (GitHub):**
```json
{ "source": "GITHUB", "repoName": "username/repo", "branch": "main" }
```

**Request (Paste):**
```json
{ "source": "PASTE", "code": "function hello() { ... }", "fileName": "main.js" }
```

**Request (ZIP):** `multipart/form-data` with a `file` field containing the `.zip` archive.

**SSE Stream format:**
```
data: {"log": "Scanning 42 files..."}
data: {"log": "Analysing security: auth.ts"}
data: {"done": true, "report": { ... }}
```

**Intelligence Bank**: If the same repository was audited previously, unchanged files (verified by SHA-256 hash) are skipped automatically, making subsequent audits significantly faster.

---

### `GET /api/code-review/:id`
Retrieves a previously saved audit report by its database ID.

---

### `GET /api/auth/github-connect`
Initiates the GitHub OAuth flow for the **Code Review** feature (links your GitHub account to your NexPulse profile for private repo access). Separate from the NextAuth login flow.  
**Requires**: User session cookie.

---

### `GET /api/auth/me`
Returns the authenticated user's profile, plan, and role.  
**Requires**: Session cookie OR `Authorization: Bearer <jwt>`.

---

### `POST /api/ai/chat`
Sends a message to Pulse-AI. Uses a 3-tier AI fallback: Groq 70B → Groq 8B → Gemini.  
**Requires**: No authentication (public, rate-limited).

**Request:**
```json
{
  "message": "How do I set up cache revalidation?",
  "history": [{ "role": "user", "content": "..." }, { "role": "assistant", "content": "..." }]
}
```

---

### `GET /api/keys`
Lists all Machine API Keys for the authenticated user.

### `POST /api/keys`
Creates a new Machine API Key. The plain-text key is returned **only once**.  
**Requires**: Pro or Agency plan.

### `DELETE /api/keys/:id`
Revokes a Machine API Key immediately.

---

### `GET /api/monitors`
Lists all monitored URLs for the authenticated user.

### `POST /api/monitors`
Registers a new URL for monitoring.

### `DELETE /api/monitors/:id`
Removes a monitor.

---

## Response Codes

| Code | Meaning |
|---|---|
| `200` | Success |
| `201` | Created (new key, new monitor) |
| `400` | Bad Request — missing or invalid parameters |
| `401` | Unauthorized — missing, revoked, or expired session/key |
| `403` | Forbidden — plan limit reached or insufficient role |
| `429` | Rate Limited — too many requests |
| `500` | Engine error — check server logs |