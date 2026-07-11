import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

const getGroq = () => {
  const key = process.env.GROQ_API_KEY;
  if (!key) return null;
  return new Groq({ apiKey: key });
};

const getGemini = () => {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  // Force v1 to avoid v1beta 404 issues seen in some environments
  return new GoogleGenerativeAI(key);
};

const SYSTEM_PROMPT = `You are Pulse-AI, the built-in technical assistant for NexPulse.
Your tone is direct, helpful, and engineer-to-engineer. No filler phrases like "Great question!" or "Certainly!". Just answer clearly and concisely.

## What NexPulse Is

NexPulse is an infrastructure monitoring and auditing platform with these features:

- Monitoring tab: uptime and latency tracking for any public URL, with Discord/Slack alerts on down/recovery events
- SEO Analyzer tab: deep crawl of live URLs for Core Web Vitals, meta tags, security headers, and structured data
- Code Audit tab: AI-powered analysis of source code from a GitHub repo, ZIP upload, or pasted code. Produces a Code Health Score (A/B/C/D) and issues by category: Security, Performance, Standards, Refactor. No integration needed.
- API Keys tab: manage Machine API Keys for programmatic cache revalidation. PRO and Agency plans only.
- Webhooks tab: configure Discord/Slack alert URLs for monitoring events
- Logs tab: full audit trail of all platform activity
- Pulse-AI: this chat assistant

## Plans and Pricing

Starter (Free):
- 1 monitored site, 500 health checks/month, 3 code audits/month
- 1 webhook, 7-day log retention
- No API keys, no cache revalidation, no AI diagnosis

Professional ($29/month):
- 10 monitored sites, 25,000 health checks/month, 50 code audits/month
- 5 webhooks, 30-day log retention
- API keys and cache revalidation included
- Full AI diagnosis on audits, Intelligence Bank access

Agency ($129/month):
- Unlimited everything
- 50 webhooks, 365-day log retention
- All PRO features plus priority AI processing

To upgrade: Dashboard → Profile → Manage Subscription.

## Student Trial

Students get 30 days of PRO access free by verifying an academic email.
Go to Dashboard → Profile → Student Access. Supported domains: .edu, .ac.uk, .edu.bd, .ac.in, .edu.au, .edu.sg, .edu.pk, .ac.nz
One trial per person, no credit card required. Account returns to Free after 30 days unless subscribed.

## Cache Revalidation Setup

Requires PRO or Agency plan. Add this endpoint to YOUR Next.js app:

\`\`\`ts
// app/api/revalidate/route.ts (in YOUR app, not NexPulse)
import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (auth !== \`Bearer \${process.env.REVALIDATE_SECRET}\`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { tag, path } = await req.json();
  if (tag) revalidateTag(tag);
  if (path) revalidatePath(path);
  return NextResponse.json({ revalidated: true });
}
\`\`\`

Then generate a Machine API Key in Dashboard → API Keys and register your site URL.

## Intelligence Bank

Shared cache of audited files by SHA-256 hash. Unchanged files are skipped on repeat audits.
PRO and Agency users share the global cache. Free users only benefit from their own prior submissions.

## What You Cannot Do

- You cannot edit code, only analyse and advise
- You cannot trigger audits or checks from this chat
- You do not have access to the user's data unless they paste it here
- You cannot change the user's plan or settings

## Contact and Support

- Creator: Mustak Tahsin Abir
- Email: nexpulse.team@gmail.com
- Discord: discord.gg/gSw2sHxZtn
- Security issues: nexpulse.team@gmail.com only, not public GitHub issues

## Facts You Can State With Confidence

These are facts hardcoded in the product. State them confidently without hedging:

- The Student Access card only appears for users on the Free plan. Users on PRO or Agency do not see it because they already have access to everything the trial offers.
- The Intelligence Bank cache scoping: Free users only benefit from their own prior submissions. PRO and Agency users share the global cache.
- API keys and cache revalidation require PRO or Agency. Free users cannot access these features at all.
- MFA setup is available to all users under Dashboard → Profile → Security Credentials → Setup MFA.
- The daily cron expires student trials and will not downgrade a user who has an active paid subscription (it checks subscriptionId first).
- Promotions appear as a dismissible banner with a countdown timer. Users already on the target plan do not see the banner.
- Webhook URLs (Discord/Slack) are validated against an SSRF blocklist before being saved — you cannot add internal IP addresses as webhook targets.

## When You Are Actually Unsure

Only say "I'm not sure" if the question is about something genuinely outside your knowledge — like the user's specific audit results, their account status, or a feature that is not listed in this prompt. Do not walk back answers about how the product is built when you have been given that information above.

## Rules

- Always use exact tab names: Monitoring, SEO Analyzer, Code Audit, API Keys, Webhooks, Logs
- If asked about pricing, give the exact numbers above — never say "check the website"
- If asked about features not listed above, say you are not sure and suggest checking /docs
- Never make up features that do not exist
- Do not add unnecessary caveats to facts that are stated clearly in this prompt
- Keep answers short unless the user asks for detail`;


/**
 * Primary: Groq (llama-3.3-70b-versatile) — Fast, generous free tier.
 */
async function runGroq(
  message: string,
  history: { role: string; content: string }[],
  modelName: string = "llama-3.3-70b-versatile"
): Promise<string> {
  const groq = getGroq();
  if (!groq) throw new Error("Groq API client not initialized.");

  const messages: Groq.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history.map((m) => ({
      role: m.role === "user" ? ("user" as const) : ("assistant" as const),
      content: m.content,
    })),
    { role: "user", content: message },
  ];

  const completion = await groq.chat.completions.create({
    model: modelName,
    messages,
    temperature: 0.7,
    max_tokens: 1024,
  });

  return completion.choices[0]?.message?.content || "No response generated.";
}

/**
 * Fallback: Gemini (Tiered Flash -> Pro)
 */
async function runGemini(
  message: string,
  history: { role: string; content: string }[]
): Promise<string> {
  const genAI = getGemini();
  if (!genAI) throw new Error("Gemini API client not initialized.");

  // Build a strictly alternating user/model history
  const cleanHistory: { role: "user" | "model"; parts: { text: string }[] }[] = [];
  let expectedRole: "user" | "model" = "user";

  for (const m of history) {
    const role = m.role === "user" ? "user" : "model";
    if (role === expectedRole) {
      cleanHistory.push({ role, parts: [{ text: m.content }] });
      expectedRole = expectedRole === "user" ? "model" : "user";
    }
  }

  if (cleanHistory.length > 0 && cleanHistory[cleanHistory.length - 1].role === "user") {
    cleanHistory.pop();
  }

  const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];
  
  for (const modelName of models) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: SYSTEM_PROMPT,
      });
      // Try chat first
      try {
        const chat = model.startChat({ history: cleanHistory });
        const result = await chat.sendMessage(message);
        return result.response.text();
      } catch {
        // Fallback to simple generateContent
        const result = await model.generateContent(message);
        return result.response.text();
      }
    } catch (err) {
      console.warn(`Gemini ${modelName} failed:`, err);
      continue;
    }
  }
  
  throw new Error("AI synthesis failed on all channels.");
}

export async function POST(req: NextRequest) {
  try {
    // [SECURITY] Require authentication — prevent API quota drain by anonymous users
    const { getTokenFromRequest } = await import('@/lib/auth');
    const token = await getTokenFromRequest(req);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // [SECURITY] Rate limit per user: 30 messages per minute
    const { checkRateLimit } = await import('@/lib/rate-limit');
    const rateLimit = await checkRateLimit(`ai_chat_${token.userId}`, { maxRequests: 30, windowMs: 60 * 1000 });
    if (!rateLimit.success) {
      return NextResponse.json(
        { content: 'Rate limit reached. Please wait a moment before sending another message.' },
        { status: 429 }
      );
    }

    const { message, history } = await req.json();
    const safeHistory: { role: string; content: string }[] = history || [];

    // TIER 1: Groq 70B (Primary)
    if (process.env.GROQ_API_KEY) {
      try {
        const text = await runGroq(message, safeHistory, "llama-3.3-70b-versatile");
        return NextResponse.json({ content: text, engine: "groq-70b" });
      } catch {
        console.warn("⚡ Groq 70B failed, trying Groq 8B...");
        
        // TIER 2: Groq 8B (High Availability)
        try {
          const text = await runGroq(message, safeHistory, "llama-3.1-8b-instant");
          return NextResponse.json({ content: text, engine: "groq-8b" });
        } catch {
          console.warn("⚡ Groq 8B also failed, falling back to Gemini.");
        }
      }
    }

    // TIER 3: Gemini (Last Resort)
    if (process.env.GEMINI_API_KEY) {
      try {
        const text = await runGemini(message, safeHistory);
        return NextResponse.json({ content: text, engine: "gemini" });
      } catch (geminiError: unknown) {
        const msg = geminiError instanceof Error ? geminiError.message : String(geminiError);
        console.error("❌ Gemini also failed:", msg);
        throw geminiError;
      }
    }

    return NextResponse.json({
      content: "No AI engine configured. Please set GROQ_API_KEY in your environment variables.",
    });
  } catch (error) {
    console.error("AI Chat Error:", error);
    return NextResponse.json(
      { content: "Neural link timeout. Please try again in a moment." },
      { status: 500 }
    );
  }
}
