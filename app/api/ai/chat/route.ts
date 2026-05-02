import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const SYSTEM_PROMPT = `
You are Pulse-AI, the official technical assistant for NexPulse Infrastructure.
NexPulse is a monitoring suite for developers.
Key Features:
- Monitoring: Track website status (UP/DOWN) and latency.
- Audits: SEO & Performance scans.
- API Keys: For revalidating tags/paths via CLI or API.
- Webhooks: Receive alerts when monitors change status.
- Dashboard: Central command center.
- Profile: Manage identity and photo.

Constraint: Be extremely concise (under 2 sentences if possible). No chat history storage is available.
If asked about navigation, tell them where the tab is in the sidebar.
`;

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ content: "API key missing. Please configure GEMINI_API_KEY." });
    }

    // Format history for Gemini
    const chatHistory = history.map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));

    const chat = model.startChat({
      history: chatHistory,
      systemInstruction: SYSTEM_PROMPT,
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ content: text });
  } catch (error) {
    console.error("AI Chat Error:", error);
    return NextResponse.json({ content: "Neural link timeout. Please try again." }, { status: 500 });
  }
}
