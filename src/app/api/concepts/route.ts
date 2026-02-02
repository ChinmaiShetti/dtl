import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { createClient } from "@supabase/supabase-js";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { topic, userId } = await request.json();

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    const { data: existingConcepts } = await supabase
      .from("concepts")
      .select("*, topics!inner(*)")
      .ilike("topics.name", `%${topic}%`)
      .order("order_index");

    if (existingConcepts && existingConcepts.length > 0) {
      return NextResponse.json({ concepts: existingConcepts, cached: true });
    }

    const prompt = `You are an expert educator. Generate a comprehensive learning module for the topic: "${topic}".

Create exactly 5 concept sections that progressively teach this topic from basics to advanced.

Return a JSON object with this exact structure:
{
  "topicName": "the topic name",
  "category": "one of: Computer Science, Mathematics, AI/ML, Software Engineering, Data Science, Other",
  "description": "brief description of the topic",
  "concepts": [
    {
      "title": "concept title",
      "content": "detailed explanation (2-3 paragraphs with examples, use markdown formatting)",
      "difficulty": "beginner|intermediate|advanced",
      "order_index": 0
    }
  ]
}

Make the content engaging, practical, and include real-world examples. Use code examples where relevant (in markdown code blocks).`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error("No content generated");
    }

    const generated = JSON.parse(content);

    const { data: topicData, error: topicError } = await supabase
      .from("topics")
      .insert({
        name: generated.topicName,
        category: generated.category,
        description: generated.description,
      })
      .select()
      .single();

    if (topicError) throw topicError;

    const conceptsToInsert = generated.concepts.map((c: { title: string; content: string; difficulty: string; order_index: number }, index: number) => ({
      topic_id: topicData.id,
      title: c.title,
      content: c.content,
      difficulty: c.difficulty,
      order_index: c.order_index ?? index,
    }));

    const { data: insertedConcepts, error: conceptsError } = await supabase
      .from("concepts")
      .insert(conceptsToInsert)
      .select();

    if (conceptsError) throw conceptsError;

    if (userId) {
      await supabase.from("user_progress").upsert({
        user_id: userId,
        topic_id: topicData.id,
        concepts_completed: 0,
        problems_solved: 0,
        problems_correct: 0,
        xp_earned: 0,
      }, { onConflict: "user_id,topic_id" });
    }

    return NextResponse.json({
      topic: topicData,
      concepts: insertedConcepts,
      cached: false,
    });
  } catch (error) {
    console.error("Error generating concepts:", error);
    return NextResponse.json(
      { error: "Failed to generate concepts" },
      { status: 500 }
    );
  }
}
