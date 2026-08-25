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
      5. Keep responses short, punchy, and formatted cleanly. Your goal is to move them from panic to execution.
      
      FORMATTING RULES:
      You must reply in two parts. 
      First, your actual message to the user.
      Second, at the very end of your response, add a strict JSON block wrapped in triple backticks with the language tag 'json'.
      Example:
      Your advice goes here...
      \`\`\`json
      {"detected_topic": "Kinematics", "friction_delta": 15}
      \`\`\`
      If no specific topic is mentioned, use "General Focus" and a delta of 5.`
    };

    const response = await openai.chat.completions.create({
      // ⚠️ IMPORTANT: Keep using the model that works for you!
      model: "openai/gpt-oss-20b", 
      messages: [systemMessage, ...messages],
    });

    const aiText = response.choices[0].message.content || "";
    
    // THE EXTRACTION LOGIC: Separate the message from the hidden JSON data
    let cleanMessage = aiText;
    let extractedData = null;

    const jsonMatch = aiText.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      try {
        extractedData = JSON.parse(jsonMatch[1]);
        // Remove the JSON block so the user never sees it in the UI
        cleanMessage = aiText.replace(/```json\n[\s\S]*?\n```/, '').trim();
      } catch (e) {
        console.error("Failed to parse AI JSON metadata");
      }
    }

    return NextResponse.json({ 
      message: { role: "assistant", content: cleanMessage },
      metadata: extractedData // Send this back to the frontend silently
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}