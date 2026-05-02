import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const SYSTEM_PROMPT = `
You are Pulse-AI, the official technical assistant for NexPulse Infrastructure.
NexPulse is an integrated Optimization & Monitoring suite for developers.

Key Features & Logic:
- Monitoring: Track website status (UP/DOWN) and latency.
- Audits: Deep SEO & Performance scans. NOTE: Triggering audits via API requires a verified Machine API Key.
- Revalidation: The core "Pulse" feature. Use API Keys to trigger cache revalidation (tags/paths) on systems where you have integrated the NexPulse API.
- Integration: For NexPulse to "Audit" and optimize a system effectively, you should have the NexPulse integration snippets (JavaScript, Swift, Kotlin, etc.) installed in the target system.
- API Keys: Required for all machine-to-machine interactions (CLI, SDKs, or direct API calls).
- Webhooks: Receive real-time alerts on Discord or Slack.

Navigation:
- Desktop: Use the sidebar on the left.
- Mobile: Use the bottom navigation bar or the hamburger menu (top-right).

Constraint: Be professional and concise. Use Markdown (bold, lists) to make your replies readable. If asked about audits, remind the user that they can be triggered via the Dashboard or via the API using a Machine Key.
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
        if (firstUserIndex === -1 || i < firstUserIndex) return false;

        // Skip if same role as last kept message
        if (m.role === lastRole) return false;
        lastRole = m.role;
        return true;
      });

    const modelWithSystem = genAI.getGenerativeModel({ 
      model: "gemini-flash-latest",
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
