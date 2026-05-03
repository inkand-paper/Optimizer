import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "" });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const SYSTEM_PROMPT = `You are Pulse-AI, the official technical assistant for NexPulse Infrastructure.
NexPulse is an integrated Optimization & Monitoring suite for developers.

## HOW NEXPULSE WORKS (Critical — Always explain this accurately):

NexPulse operates on an INTEGRATION-FIRST model. Here is the exact flow:

1. A user signs up on NexPulse and generates a Machine API Key.
2. The user INSTALLS the NexPulse integration snippet (JavaScript, Swift, Kotlin, etc.) into their OWN target website or application.
3. ONLY AFTER the integration is installed on that specific system can NexPulse:
   a. Send **Revalidation Pulses** — cache clearing signals (by tag or path) to that system.
   b. Perform **Deep Audits** — SEO, Security, and Performance analysis of that integrated system.

## IMPORTANT — DO NOT GET THIS WRONG:
- NexPulse is NOT a generic URL scanner that works on any public website.
- Audits and Revalidation ONLY work on systems where the user has installed the NexPulse API integration.
- If a user asks "do we need to create an API to audit?", the correct answer is: "You need to install the NexPulse integration snippet into your target system first. Once installed, you use your Machine API Key to trigger audits or revalidation pulses against that specific integrated system."
- The Machine API Key authenticates the connection between NexPulse and the target system.

## Core Features:
- **Monitoring**: Track any public website's UP/DOWN status and latency (this does NOT require integration).
- **Revalidation (Pulse)**: Requires integration installed on the target system + a Machine API Key.
- **Audits**: Requires integration installed on the target system + a Machine API Key.
- **Webhooks**: Receive real-time alerts on Discord or Slack when monitors go down.
- **Activity Logs**: Full audit trail of all API calls, pulses, and security events.
- **Profile**: Manage identity, password, and plan details.
- **Pulse-AI**: That's me — your technical assistant embedded in the dashboard.

## Creator & Support Information:
- **Creator**: NexPulse was created by **Mustak Tahsin Abir**.
- **Email Support**: You can reach the NexPulse team at **nexpulse.team@gmail.com**.
- **Community**: The official Discord community link can be found in the Documentation page and the footer navigation.
- **Open Source**: The GitHub repository link is available in the footer and documentation for developers to explore the code.

## Navigation:
- Desktop: Sidebar on the left.
- Mobile: Bottom navigation bar or hamburger menu (top-right).

Constraint: Be professional, accurate, and concise. Use Markdown formatting.`;


/**
 * Primary: Groq (llama-3.3-70b-versatile) — Fast, generous free tier.
 */
async function runGroq(
  message: string,
  history: { role: string; content: string }[]
): Promise<string> {
  const messages: Groq.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history.map((m) => ({
      role: m.role === "user" ? ("user" as const) : ("assistant" as const),
      content: m.content,
    })),
    { role: "user", content: message },
  ];

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages,
    temperature: 0.7,
    max_tokens: 1024,
  });

  return completion.choices[0]?.message?.content || "No response generated.";
}

/**
 * Fallback: Gemini 1.5 Flash
 * Fixes the "First content should be with role 'user'" bug by building
 * a clean, strictly-alternating history starting from the first user message.
 */
async function runGemini(
  message: string,
  history: { role: string; content: string }[]
): Promise<string> {
  // Build a strictly alternating user/model history starting with 'user'
  const cleanHistory: { role: "user" | "model"; parts: { text: string }[] }[] = [];
  let expectedRole: "user" | "model" = "user";

  for (const m of history) {
    const role = m.role === "user" ? "user" : "model";
    if (role === expectedRole) {
      cleanHistory.push({ role, parts: [{ text: m.content }] });
      expectedRole = expectedRole === "user" ? "model" : "user";
    }
    // Skip messages that break the alternating pattern
  }

  // If history ends on 'user' (incomplete exchange), trim it so we can append new user message cleanly
  if (cleanHistory.length > 0 && cleanHistory[cleanHistory.length - 1].role === "user") {
    cleanHistory.pop();
  }

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: SYSTEM_PROMPT,
  });

  const chat = model.startChat({ history: cleanHistory });
  const result = await chat.sendMessage(message);
  return result.response.text();
}

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();
    const safeHistory: { role: string; content: string }[] = history || [];

    // 1. Try Groq first (primary engine)
    if (process.env.GROQ_API_KEY) {
      try {
        const text = await runGroq(message, safeHistory);
        return NextResponse.json({ content: text, engine: "groq" });
      } catch (groqError: any) {
        console.warn("⚡ Groq failed, falling back to Gemini:", groqError?.message || groqError);
      }
    }

    // 2. Fallback: Gemini
    if (process.env.GEMINI_API_KEY) {
      try {
        const text = await runGemini(message, safeHistory);
        return NextResponse.json({ content: text, engine: "gemini" });
      } catch (geminiError: any) {
        console.error("❌ Gemini also failed:", geminiError?.message || geminiError);
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
