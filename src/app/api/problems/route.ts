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
    const { topic, topicId, difficulty, count = 5 } = await request.json();

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    if (topicId) {
      const { data: existingProblems } = await supabase
        .from("problems")
        .select("*")
        .eq("topic_id", topicId)
        .eq("difficulty", difficulty || "medium")
        .limit(count);

      if (existingProblems && existingProblems.length >= count) {
        return NextResponse.json({ problems: existingProblems, cached: true });
      }
    }

    const prompt = `You are an expert educator creating practice problems for the topic: "${topic}".

Generate exactly ${count} multiple-choice questions at ${difficulty || "medium"} difficulty level.

Return a JSON object with this exact structure:
{
  "problems": [
    {
      "question": "the question text",
      "options": ["option A", "option B", "option C", "option D"],
      "correct_answer": 0,
      "hint": "a helpful hint without giving away the answer",
      "explanation": "detailed explanation of why the correct answer is correct",
      "difficulty": "${difficulty || "medium"}"
    }
  ]
}

Rules:
- Each question should have exactly 4 options
- correct_answer is the 0-indexed position of the correct option
- Questions should test understanding, not just memorization
- Include a mix of conceptual and practical questions
- Hints should guide thinking without revealing the answer`;

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

    if (topicId) {
      const problemsToInsert = generated.problems.map((p: { question: string; options: string[]; correct_answer: number; hint: string; explanation: string; difficulty: string }) => ({
        topic_id: topicId,
        question: p.question,
        options: p.options,
        correct_answer: p.correct_answer,
        hint: p.hint,
        explanation: p.explanation,
        difficulty: p.difficulty,
      }));

      const { data: insertedProblems, error } = await supabase
        .from("problems")
        .insert(problemsToInsert)
        .select();

      if (error) throw error;

      return NextResponse.json({ problems: insertedProblems, cached: false });
    }

    return NextResponse.json({ problems: generated.problems, cached: false });
  } catch (error) {
    console.error("Error generating problems:", error);
    return NextResponse.json(
      { error: "Failed to generate problems" },
      { status: 500 }
    );
  }
}
