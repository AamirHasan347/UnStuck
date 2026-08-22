import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY, 
});

export async function POST(request: Request) {
  try {
    const { topic } = await request.json();

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    const prompt = `
      You are an expert tutor creating active-recall flashcards for a student preparing for the JEE Main and Advanced engineering exams.
      The student has just watched a lecture on: "${topic}".
      
      Generate 3 highly effective flashcards covering:
      1. A core formula or mathematical relationship.
      2. A conceptual application or boundary condition.
      3. A common misconception or edge case.
      
      Return ONLY a raw JSON object containing a "flashcards" array. Do not include markdown formatting or thinking steps. Use this exact structure:
      {
        "flashcards": [
          { "question": "...", "answer": "..." }
        ]
      }
    `;

    const response = await openai.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }, 
    });

    const content = response.choices[0].message.content;
    const parsedData = JSON.parse(content || '{"flashcards": []}');

    return NextResponse.json({ flashcards: parsedData.flashcards });

  } catch (error: any) {
    console.error("🔥 API Error:", error.response?.data || error.message);
    return NextResponse.json(
      { error: "Failed to generate flashcards", details: error.message }, 
      { status: 500 }
    );
  }
}