import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { topic, frictionDelta } = await request.json();

    if (!topic) return NextResponse.json({ error: "Topic missing" }, { status: 400 });

    // Step 1: Check if the topic already exists in the Graph
    const { data: existingNode } = await supabase
      .from('knowledge_graph')
      .select('friction_score')
      .eq('topic', topic)
      .single();

    let newScore = frictionDelta;

    if (existingNode) {
      // Calculate new score, keeping it between 0 and 100
      newScore = Math.max(0, Math.min(100, existingNode.friction_score + frictionDelta));
      
      await supabase
        .from('knowledge_graph')
        .update({ friction_score: newScore, last_encountered: new Date() })
        .eq('topic', topic);
    } else {
      // Create a new node in the graph
      await supabase
        .from('knowledge_graph')
        .insert([{ topic, friction_score: newScore }]);
    }

    return NextResponse.json({ success: true, topic, newScore });

  } catch (error: any) {
    console.error("Knowledge Graph Error:", error);
    return NextResponse.json({ error: "Failed to update graph" }, { status: 500 });
  }
}
