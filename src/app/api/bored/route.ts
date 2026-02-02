import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const FALLBACK = {
  funFacts: [
    "Honey never spoils; archaeologists have tasted 3,000-year-old jars and found them edible.",
    "Octopuses have three hearts and blue blood, and they taste with their arms.",
    "The Eiffel Tower grows by up to 6 inches in summer heat due to metal expansion.",
  ],
  interestingFinds: [
    "Look up the Biefeld–Brown effect for an odd link between electricity and propulsion.",
    "Try building a tiny theremin with just a microcontroller and two antennas.",
    "Search how bioluminescent algae can make waves glow at night beaches.",
  ],
  quickGame: {
    title: "30-second idea mashup",
    idea: "Take two random objects near you and invent a product that uses both.",
    howToPlay: "Grab a timer, say your mashup out loud, and sketch it in 30 seconds. Bonus: pitch it to a friend in two sentences.",
  },
  brainTeaser: {
    question: "You have 8 balls; one is heavier. In two weighings on a balance scale, how do you find it?",
    answer: "Weigh 3 vs 3. If balanced, weigh the remaining 2 to find the heavy one. If not balanced, take the heavier group of 3, weigh 1 vs 1; heavier ball or the remaining third is the odd one.",
  },
  surprise: "Look up the sound of Jupiter captured by NASA's Juno—it's eerie and soothing." 
};

export async function POST(request: NextRequest) {
  let body: { interest?: string } = {};
  try {
    body = await request.json();
  } catch {
    // Ignore parse errors; we'll use defaults.
  }

  const interest = body.interest?.trim() || "engineering curiosity";

  const prompt = `You are a playful activity generator. Create engaging, short items for someone who is bored but curious about ${interest}.
Return a JSON object with this exact shape:
{
  "funFacts": ["fact 1", "fact 2", "fact 3"],
  "interestingFinds": ["intriguing article idea or rabbit hole", "another idea", "one more"],
  "quickGame": {"title": "short title", "idea": "one-sentence game idea", "howToPlay": "2-3 sentence instructions"},
  "brainTeaser": {"question": "short puzzle", "answer": "the answer"},
  "surprise": "a single short surprise or micro-challenge"
}
Facts should be STEM-friendly but accessible. Keep everything concise and upbeat.`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.9,
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error("No content returned from Groq");
    }

    const parsed = JSON.parse(content);
    return NextResponse.json({ content: parsed });
  } catch (error) {
    console.error("Error generating bored content:", error);
    return NextResponse.json({ content: FALLBACK, fallback: true });
  }
}
