import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function getAiDiagnosis(auditData: any) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return null;
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are NexPulse AI, a professional performance and SEO consultant for high-end web agencies.
      I will provide you with JSON data from a website audit. 
      Your task is to provide a "Genius Diagnosis" for the owner.

      AUDIT DATA:
      ${JSON.stringify(auditData)}

      RESPONSE FORMAT (STRICT):
      1. A one-sentence summary of the site's health.
      2. "The Profit Killer": Identify the single most critical performance or SEO issue.
      3. "Revenue Impact": Explain how this issue affects their money/conversions in one sentence.
      4. "NexPulse Action Plan": 3 short, high-impact bullet points for a developer to fix it.

      Tone: Professional, authoritative, and outcome-driven. 
      Keep the entire response under 200 words.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("AI Diagnosis Error:", error);
    return "AI insights currently unavailable, but your technical audit is ready below.";
  }
}
