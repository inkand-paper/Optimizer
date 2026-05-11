# NexPulse

**Infrastructure intelligence engine for modern development teams.**

NexPulse gives engineering teams a unified command center for health monitoring, cache revalidation, AI-powered code auditing, and SEO analysis — across any framework, any region.

---

## What NexPulse Does

| Feature | Description |
|---|---|
| **Real-Time Monitoring** | Uptime, latency, and status code tracking for any public URL. No integration required. |
| **Cache Pulse Engine** | Remotely revalidate Next.js, Nuxt, and Remix caches by tag or path. Requires integration snippet. |
| **SEO & Performance Audit** | Crawl any URL for Core Web Vitals, meta coverage, security headers, and structured data. |
| **Neural Code Audit** | AI-powered source code analysis from GitHub repos, ZIP archives, or pasted snippets. |
| **Intelligence Bank** | Hash-based incremental auditing — only re-analyses files that changed since the last audit. |
| **Pulse-AI Assistant** | AI technical assistant embedded in the dashboard. Ask anything about your infrastructure or audit results. |
| **Webhooks** | Real-time Discord and Slack alerts when monitored endpoints go down. |
| **Activity Logs** | Full audit trail of all API calls, revalidation pulses, and key events. |

---

## Quick Start

```bash
# Sign up at https://nextjs-optimizer-suite.vercel.app
# Generate a Machine API Key from the API Keys tab
# Install the integration snippet in your target app
```

### Integration Snippet (Next.js)

```ts
// app/api/revalidate/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-nexpulse-secret');
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { tag, path } = await req.json();
  if (tag)  revalidateTag(tag);
  if (path) revalidatePath(path);
  return NextResponse.json({ revalidated: true });
}
```

---

## Code Audit (No Integration Required)

Navigate to the **Code Audit** tab in your dashboard to:
- Connect a **GitHub repository** (requires GitHub OAuth link from Profile settings)
- Upload a **ZIP archive** of your project
- **Paste code** directly

The Neural Audit Engine will scan for:
- 🔐 Security vulnerabilities (XSS, injection, exposed secrets)
- ⚡ Performance bottlenecks
- 🏗️ Architectural issues
- 📋 Standards violations and best practices

The **Intelligence Bank** automatically caches file hashes. When you re-audit the same repo, only changed files are re-analysed — dramatically faster subsequent audits.

---

## Plans

| | Starter (Free) | Professional ($29/mo) | Agency ($129/mo) |
|---|---|---|---|
| Monitored Sites | 1 | 10 | Unlimited |
| Health Checks | 500/mo | 25,000/mo | Unlimited |
| Code Audit | ✅ | ✅ | ✅ |
| Intelligence Bank | ❌ | ✅ | ✅ |
| Pulse-AI | ✅ | ✅ | ✅ (Priority) |
| API Keys & Pulses | ❌ | ✅ | ✅ |
| Webhooks | 1 | 5 | 50 |
| Log Retention | 7 days | 30 days | 365 days |

---

## Self-Hosting

```bash
git clone https://github.com/inkand-paper/Optimizer
cd nextjs-optimizer-suite
cp .env .env.local  # fill in all required keys
npx prisma migrate deploy
npm run dev
```

Required environment variables:
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — Secret for custom JWT signing
- `NEXTAUTH_SECRET` — Secret for NextAuth sessions
- `GROQ_API_KEY` — For the Code Audit engine and Pulse-AI
- `GEMINI_API_KEY` — Fallback AI engine

---

## Contact

- **Support**: nexpulse.team@gmail.com
- **Created by**: Mustak Tahsin Abir
- **Discord**: [discord.gg/CVU3aNdb](https://discord.gg/CVU3aNdb)
- **GitHub**: [inkand-paper/Optimizer](https://github.com/inkand-paper/Optimizer)
