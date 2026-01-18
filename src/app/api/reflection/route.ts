import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { userId, topic, problemsSolved, problemsCorrect, conceptsCompleted, timeSpent } = await request.json();

    const accuracy = problemsSolved > 0 ? Math.round((problemsCorrect / problemsSolved) * 100) : 0;

    const prompt = `You are an encouraging learning coach. Generate a personalized reflection for a student who just completed a learning session.

Session details:
- Topic: ${topic}
- Concepts completed: ${conceptsCompleted}
- Problems solved: ${problemsSolved}
- Problems correct: ${problemsCorrect}
- Accuracy: ${accuracy}%
- Time spent: ${timeSpent || "unknown"}

Generate a JSON response with this structure:
{
  "summary": "A 2-3 sentence summary of their performance",
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["area to improve 1", "area to improve 2"],
  "nextSteps": ["recommended next step 1", "recommended next step 2"],
  "encouragement": "An encouraging message (1-2 sentences)",
  "xpEarned": number (calculate based on: 10 per concept, 20 per correct problem, bonus for high accuracy),
  "badges": ["badge name if earned"]
}

Be encouraging but honest. If accuracy is low, focus on growth mindset.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error("No content generated");
    }

    const reflection = JSON.parse(content);

    const userIdToUse = userId || "anonymous";

    // Persist reflection so user insights are queryable later.
    const { error: saveError } = await supabase.from("reflections").insert({
      user_id: userIdToUse,
      topic,
      summary: reflection.summary,
      strengths: reflection.strengths,
      improvements: reflection.improvements,
      next_steps: reflection.nextSteps,
      encouragement: reflection.encouragement,
      xp_earned: reflection.xpEarned,
      badges: reflection.badges,
    });

    if (saveError) {
      console.error("Error saving reflection:", saveError);
    }

    return NextResponse.json({ reflection });
  } catch (error) {
    console.error("Error generating reflection:", error);
    return NextResponse.json(
      { error: "Failed to generate reflection" },
      { status: 500 }
    );
  }
}
