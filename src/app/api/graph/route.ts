import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type Node = {
  id: string;
  label: string;
  mastery: number;
  connections: string[];
  conceptsCompleted: number;
  problemsSolved: number;
  problemsCorrect: number;
  xpEarned: number;
  accuracy: number;
};

type PositionedNode = Node & { x: number; y: number };

function computeMastery(progress: {
  concepts_completed?: number;
  problems_solved?: number;
  problems_correct?: number;
  xp_earned?: number;
}) {
  const concepts = progress.concepts_completed ?? 0;
  const solved = progress.problems_solved ?? 0;
  const correct = progress.problems_correct ?? 0;
  const xp = progress.xp_earned ?? 0;
  const accuracy = solved > 0 ? correct / solved : 0;
  const score = concepts * 6 + correct * 4 + accuracy * 20 + xp * 0.05;
  return Math.max(5, Math.min(100, Math.round(score)));
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId") || "anonymous";

    const { data: progress, error } = await supabase
      .from("user_progress")
      .select("*, topics(id, name, category)")
      .eq("user_id", userId);

    if (error) throw error;

    if (!progress || progress.length === 0) {
      // Fallback sample graph
      const nodes: PositionedNode[] = [
        { id: "sample-1", label: "Start Learning", mastery: 40, x: 380, y: 320, connections: ["sample-2"], conceptsCompleted: 1, problemsSolved: 2, problemsCorrect: 1, xpEarned: 30, accuracy: 50 },
        { id: "sample-2", label: "Pick a Topic", mastery: 60, x: 520, y: 260, connections: ["sample-3"], conceptsCompleted: 2, problemsSolved: 3, problemsCorrect: 2, xpEarned: 60, accuracy: 67 },
        { id: "sample-3", label: "Solve Problems", mastery: 30, x: 280, y: 220, connections: ["sample-4"], conceptsCompleted: 0, problemsSolved: 1, problemsCorrect: 0, xpEarned: 10, accuracy: 0 },
        { id: "sample-4", label: "Review Insights", mastery: 50, x: 440, y: 460, connections: [], conceptsCompleted: 1, problemsSolved: 1, problemsCorrect: 1, xpEarned: 40, accuracy: 100 },
      ];
      return NextResponse.json({ nodes });
    }

    const centerX = 400;
    const centerY = 320;
    const topicCount = Math.max(1, progress.length);
    // Expand radius with topic count to reduce overlap.
    const baseRadius = 220;
    const radius = baseRadius + Math.min(topicCount * 12, 200);
    const nodes: PositionedNode[] = [];

    // Root node represents the learner
    const totalXp = progress.reduce((sum, p) => sum + (p.xp_earned ?? 0), 0);
    const totalSolved = progress.reduce((sum, p) => sum + (p.problems_solved ?? 0), 0);
    const totalCorrect = progress.reduce((sum, p) => sum + (p.problems_correct ?? 0), 0);
    const rootAccuracy = totalSolved > 0 ? Math.round((totalCorrect / totalSolved) * 100) : 0;

    nodes.push({
      id: "root",
      label: "Your Journey",
      mastery: Math.min(100, totalXp / 20 || 20),
      x: centerX,
      y: centerY,
      connections: [],
      conceptsCompleted: progress.reduce((s, p) => s + (p.concepts_completed ?? 0), 0),
      problemsSolved: totalSolved,
      problemsCorrect: totalCorrect,
      xpEarned: totalXp,
      accuracy: rootAccuracy,
    });

    progress.forEach((p, idx) => {
      // Spread nodes around a ring, stagger radius a bit to avoid collisions.
      const angle = (idx / topicCount) * Math.PI * 2 + (Math.PI / 12);
      const radialJitter = (idx % 2 === 0 ? 1 : -1) * 30;
      const r = radius + radialJitter;
      const x = centerX + r * Math.cos(angle);
      const y = centerY + r * Math.sin(angle);
      const mastery = computeMastery(p);
      const topicId = p.topic_id || `topic-${idx}`;
      const label = p.topics?.name || "Topic";

      const problemsSolved = p.problems_solved ?? 0;
      const problemsCorrect = p.problems_correct ?? 0;
      const accuracy = problemsSolved > 0 ? Math.round((problemsCorrect / problemsSolved) * 100) : 0;

      nodes.push({
        id: topicId,
        label,
        mastery,
        x,
        y,
        connections: ["root"],
        conceptsCompleted: p.concepts_completed ?? 0,
        problemsSolved,
        problemsCorrect,
        xpEarned: p.xp_earned ?? 0,
        accuracy,
      });
    });

    // Connect neighboring topics for a simple ring layout
    const topicNodes = nodes.filter((n) => n.id !== "root");
    topicNodes.forEach((node, i) => {
      const next = topicNodes[(i + 1) % topicNodes.length];
      if (!node.connections.includes(next.id)) node.connections.push(next.id);
      if (!next.connections.includes(node.id)) next.connections.push(node.id);
    });

    return NextResponse.json({ nodes });
  } catch (err) {
    console.error("Graph API error", err);
    return NextResponse.json({ error: "Failed to build graph" }, { status: 500 });
  }
}
