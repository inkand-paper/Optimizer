import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "" });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const SYSTEM_PROMPT = `You are Pulse-AI, the official technical assistant for NexPulse Infrastructure.
NexPulse is an integrated Optimization & Monitoring suite for developers.

Key Features & Logic:
- Monitoring: Track website status (UP/DOWN) and latency.
- Audits: Deep SEO & Performance scans. NOTE: Triggering audits via API requires a verified Machine API Key.
- Revalidation: The core "Pulse" feature. Use API Keys to trigger cache revalidation (tags/paths) on systems where you have integrated the NexPulse API.
- Integration: For NexPulse to "Audit" and optimize a system effectively, you should have the NexPulse integration snippets (JavaScript, Swift, Kotlin, etc.) installed in the target system.
- API Keys: Required for all machine-to-machine interactions (CLI, SDKs, or direct API calls).
- Webhooks: Receive real-time alerts on Discord or Slack.
- Activity Logs: Full audit trail of all API calls, pulses, and security events.
- Profile: Manage identity, password, and plan details.

Navigation:
- Desktop: Use the sidebar on the left.
- Mobile: Use the bottom navigation bar or the hamburger menu (top-right).

Constraint: Be professional and concise. Use Markdown (bold, lists) to make your replies readable. If asked about audits, remind the user that they can be triggered via the Dashboard or via the API using a Machine Key.`;

/**
 * Primary: Groq (llama3-70b) — Fast, generous free tier.
 * Fallback: Gemini 1.5 Flash — if Groq fails or key is missing.
 */
async function runGroq(message: string, history: { role: string; content: string }[]): Promise<string> {
  const messages: Groq.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history.map((m) => ({
      role: m.role === "user" ? "user" as const : "assistant" as const,
      content: m.content,
    })),
    { role: "user", content: message },
  ];

  const completion = await groq.chat.completions.create({
    model: "llama3-70b-8192",
    messages,
    temperature: 0.7,
    max_tokens: 1024,
  });

  return completion.choices[0]?.message?.content || "No response generated.";
}

async function runGemini(message: string, history: { role: string; content: string }[]): Promise<string> {
  let lastRole: string | null = null;
  const chatHistory = history
    .map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }))
    .filter((m) => {
      const firstUserIndex = history.findIndex((h) => h.role === "user");
      if (firstUserIndex === -1) return false;
      if (m.role === lastRole) return false;
      lastRole = m.role;
      return true;
    });

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: SYSTEM_PROMPT,
  });

  const chat = model.startChat({ history: chatHistory });
  const result = await chat.sendMessage(message);
  return result.response.text();
}

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();

    // 1. Try Groq first (primary engine)
    if (process.env.GROQ_API_KEY) {
      try {
        const text = await runGroq(message, history || []);
        return NextResponse.json({ content: text, engine: "groq" });
      } catch (groqError: any) {
        console.warn("⚡ Groq failed, falling back to Gemini:", groqError?.message);
        // Fall through to Gemini
      }
    }

    // 2. Fallback: Gemini
    if (process.env.GEMINI_API_KEY) {
      try {
        const text = await runGemini(message, history || []);
        return NextResponse.json({ content: text, engine: "gemini" });
      } catch (geminiError: any) {
        console.error("❌ Gemini also failed:", geminiError?.message);
        throw geminiError;
      }
    }

    return NextResponse.json({ content: "No AI engine configured. Please set GROQ_API_KEY or GEMINI_API_KEY." });
  } catch (error) {
    console.error("AI Chat Error:", error);
    return NextResponse.json(
      { content: "Neural link timeout. Please try again in a moment." },
      { status: 500 }
    );
  }
}
