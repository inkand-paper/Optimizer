# Security Policy

## Supported Versions

| Version | Supported |
|---|---|
| Latest (`main`) | ✅ |
| Older branches | ❌ |

Only the latest code on the `main` branch receives security fixes.

---

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues, pull requests, or discussions.**

If you discover a vulnerability in NexPulse, email us at:

**nexpulse.team@gmail.com**

Include in your report:
- A clear description of the vulnerability
- Steps to reproduce (proof of concept if possible)
- The potential impact
- Any suggested mitigations

### What to expect

- **Acknowledgement** within 48 hours
- **Status update** within 5 business days
- We will coordinate a fix and disclosure timeline with you
- Credit will be given in the release notes if you wish

---

## Scope

The following are **in scope** for security reports:

- Authentication bypass or token forgery
- SQL injection or database access
- Server-Side Request Forgery (SSRF)
- Remote code execution
- Privilege escalation (e.g. accessing admin endpoints as a regular user)
- Sensitive data exposure (API keys, passwords, tokens)
- Cross-Site Scripting (XSS) in the dashboard
- Broken access control between user accounts

The following are **out of scope**:

- Rate limiting bypasses that require large-scale infrastructure
- Attacks requiring physical access to a server
- Issues in third-party services (Groq, Vercel, Supabase)
- Self-hosted deployments with misconfigured environment variables
- Missing security headers on user-controlled pages (informational only)

---

## Security Architecture

NexPulse implements several layers of protection:

- **JWT authentication** with HttpOnly, Secure, SameSite cookies
- **SSRF prevention** on all outbound URL fetches via IP allowlist validation
- **API keys stored as SHA-256 hashes** — plain text is never persisted
- **Rate limiting** on all auth endpoints (login, register, AI chat)
- **TOTP-based MFA** support
- **Brute force detection** with automatic Discord security alerts
- **Strict Content Security Policy** headers on all routes
- **Input validation** via Zod schemas on all API endpoints
