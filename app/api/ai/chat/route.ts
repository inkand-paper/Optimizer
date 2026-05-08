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

const SYSTEM_PROMPT = `You are Pulse-AI, the official technical assistant for NexPulse Infrastructure.
NexPulse is an integrated Optimization & Monitoring suite for developers.

## HOW NEXPULSE WORKS (Critical — Always explain this accurately):

NexPulse provides two distinct layers of intelligence:

1. **Neural Code Review (Direct Source Audit)**:
   - This layer analyzes raw source code directly from **GitHub repositories**, **ZIP archives**, or **pasted snippets**.
   - It **does NOT** require an integration snippet.
   - Features include: Security vulnerability detection, performance optimization, and architectural recommendations.
   - Note: NexPulse is an auditing tool, not a code editor; it provides "Fixed Snippets" you can copy, but doesn't edit your files directly.

2. **Universal Infrastructure Monitoring (Integration-First)**:
   - This layer monitors live web properties.
   - **Public Monitoring**: Track UP/DOWN status and latency for any URL (No integration needed).
   - **Integrated Audits & Revalidation**: Requires the user to INSTALL the NexPulse integration snippet into their target app. Once installed, users can:
     a. Send **Revalidation Pulses** — instant cache clearing signals.
     b. Perform **Live Website Audits** — deep analysis of the running production environment.

## IMPORTANT — DO NOT GET THIS WRONG:
- "Neural Code Review" works on code files (GitHub/Zip).
- "Website Audits" works on live URLs and requires the integration snippet.
- The Machine API Key authenticates the connection for both layers.

## Core Features:
- **Monitoring**: Real-time status/latency tracking.
- **Neural Code Review**: Deep AI-powered source code analysis (GitHub/Zip/Paste).
- **Intelligence Bank**: Accelerated audits using hashing to skip unchanged files.
- **Revalidation (Pulse)**: Remote cache clearing (Requires integration).
- **Webhooks**: Discord/Slack alerts for system events.
- **Pulse-AI**: That's me — your technical assistant.

## Creator & Support:
- **Creator**: NexPulse was created by **Mustak Tahsin Abir**.
- **Contact**: nexpulse.team@gmail.com

Constraint: Be professional, accurate, and concise. Use Markdown formatting.`;


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
    const { message, history } = await req.json();
    const safeHistory: { role: string; content: string }[] = history || [];

    // TIER 1: Groq 70B (Primary)
    if (process.env.GROQ_API_KEY) {
      try {
        const text = await runGroq(message, safeHistory, "llama-3.3-70b-versatile");
        return NextResponse.json({ content: text, engine: "groq-70b" });
      } catch (groqError: any) {
        console.warn("⚡ Groq 70B failed, trying Groq 8B...");
        
        // TIER 2: Groq 8B (High Availability)
        try {
          const text = await runGroq(message, safeHistory, "llama-3.1-8b-instant");
          return NextResponse.json({ content: text, engine: "groq-8b" });
        } catch (groq8bError: any) {
          console.warn("⚡ Groq 8B also failed, falling back to Gemini.");
        }
      }
    }

    // TIER 3: Gemini (Last Resort)
    if (process.env.GEMINI_API_KEY) {
      try {
        const text = await runGemini(message, safeHistory);
        return NextResponse.json({ content: text, engine: "gemini" });
      } catch (geminiError: any) {
        console.error("❌ Gemini also failed:", geminiError.message);
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
