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

    // Gemini requires strict alternating roles starting with 'user'
    let lastRole: string | null = null;
    const chatHistory = history
      .map((m: any) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      }))
      .filter((m: any, i: number, arr: any[]) => {
        // Find the first 'user' message
        const firstUserIndex = arr.findIndex(msg => msg.role === "user");
        if (i < firstUserIndex) return false;

        // Skip if same role as last kept message
        if (m.role === lastRole) return false;
        lastRole = m.role;
        return true;
      });

    const modelWithSystem = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: SYSTEM_PROMPT 
    });

    const chat = modelWithSystem.startChat({
      history: chatHistory,
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
