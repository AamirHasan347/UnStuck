import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY, 
});

export async function POST(request: Request) {
  try {
    const { topic } = await request.json();


    const response = await openai.chat.completions.create({
      model: "openai/gpt-oss-20b", 
      messages: [{
      role: "system",
      content: `You are an expert, tactical AI tutor for a student preparing for the JEE Advanced engineering exam. 
      
      Your goal is to test their knowledge on the current topic: "${topic}".
      Generate exactly 4 high-yield, conceptual active recall flashcards.
      
      FORMATTING RULES:
      Output ONLY a valid raw JSON array containing objects with 'q' for the question and 'a' for the answer.
      Do not include markdown tags like \`\`\`json. No intro, no outro. Just the array.
      
      Example:
      [
        {"q": "What is the condition for resonance in an LCR circuit?", "a": "Inductive reactance equals capacitive reactance (XL = XC)."},
        {"q": "What is the formula for the radius of an electron's nth orbit in a Hydrogen atom?", "a": "r = 0.529 * (n^2 / Z) Å"}
      ]`
    }],
    });

    const aiText = response.choices[0].message.content || "[]";
  
    const cleanJson = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
    const flashcards = JSON.parse(cleanJson);

    return NextResponse.json({ flashcards });

  } catch (error: any) {
    console.error("Flashcards API Error:", error.message);
    return NextResponse.json({ error: "Failed to generate flashcards" }, { status: 500 });
  }
}