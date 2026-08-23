import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY, 
});

export async function POST(request: Request) {
  try {
    const { messages, mood } = await request.json();

    const systemMessage = {
      role: "system",
      content: `You are a tactical, no-nonsense performance coach for a student preparing for the brutal JEE Main and Advanced engineering exams. The student is currently feeling ${mood}. 
      
      Your programming directives:
      1. NO TOXIC POSITIVITY. Do not use generic phrases like "just take a deep breath," "believe in yourself," or "you can do this."
      2. Acknowledge the reality. The syllabus is massive, the transition into Class 12 is intense, and the pressure is objectively real. Validate their stress.
      3. Ask targeted questions to find the exact bottleneck (e.g., "What specific chapter is paralyzing you right now?").
      4. Once the bottleneck is identified, construct a ruthless, practical, and highly scoped 50-minute micro-plan. Cut out all fluff.
      5. Keep responses short, punchy, and formatted cleanly. Your goal is to move them from panic to execution.`
    };

    const response = await openai.chat.completions.create({
      model: "openai/gpt-oss-20b", 
      messages: [systemMessage, ...messages],
    });

    return NextResponse.json({ message: response.choices[0].message });

  } catch (error: any) {
    console.error("Coach API Error:", error.response?.data || error.message);
    return NextResponse.json(
      { error: error.message || "Failed to generate coaching response" }, 
      { status: 500 }
    );
  }
}