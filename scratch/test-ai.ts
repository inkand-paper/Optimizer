import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";
import * as path from "path";

// Load .env manually for the script
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function testGemini() {
  const key = process.env.GEMINI_API_KEY;
  console.log("Checking API Key format (first 5 chars):", key?.substring(0, 5));
  
  if (!key) {
    console.error("ERROR: No GEMINI_API_KEY found in .env");
    return;
  }

  const genAI = new GoogleGenerativeAI(key);
  
  try {
      const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
      const prompt = "Say 'NexPulse AI is Online' if you can read this.";
      const result = await model.generateContent(prompt);
      const response = await result.response;
      console.log("GEMINI RESPONSE:", response.text());
  } catch (error: any) {
    console.error("GEMINI API ERROR:", error.message);
    if (error.stack) console.error(error.stack);
  }
}

testGemini();
