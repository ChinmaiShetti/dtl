import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(request: NextRequest) {
  try {
    const { messages, topic } = await request.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages are required" }, { status: 400 });
    }

    const systemPrompt = `You are a calm, friendly doubt‑clearing tutor for engineering and STEM learners. Explain step‑by‑step using intuition, simple language, and small examples. Ask clarifying questions when needed. Avoid fluff. Keep answers concise but complete. ${topic ? `The learner's current topic is: ${topic}.` : ""}`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((m: ChatMessage) => ({ role: m.role, content: m.content })),
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content generated");
    }

    return NextResponse.json({ message: { role: "assistant", content } });
  } catch (error) {
    console.error("Error generating chat response:", error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}
