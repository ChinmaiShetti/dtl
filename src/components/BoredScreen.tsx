"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Brain, Gamepad2, Lightbulb, RefreshCw, Send, Sparkles } from "lucide-react";

type Screen = "home" | "dashboard" | "concept" | "practice" | "reflection" | "graph" | "profile" | "relax" | "bored";

type BoredContent = {
  funFacts: string[];
  interestingFinds: string[];
  quickGame: {
    title: string;
    idea: string;
    howToPlay: string;
  };
  brainTeaser: {
    question: string;
    answer: string;
  };
  surprise: string;
};

type Props = {
  setScreen: (s: Screen) => void;
  sessionTopic?: string;
};

export function BoredScreen({ setScreen, sessionTopic }: Props) {
  const [interest, setInterest] = useState(sessionTopic || "engineering curiosity");
  const [content, setContent] = useState<BoredContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reveal, setReveal] = useState(false);

  const fetchIdeas = async (topic?: string) => {
    setLoading(true);
    setError(null);
    setReveal(false);

    try {
      const response = await fetch("/api/bored", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interest: topic || interest }),
      });

      if (!response.ok) {
        throw new Error("Failed to load fun ideas");
      }

      const data = await response.json();
      setContent(data.content as BoredContent);
    } catch (err) {
      console.error(err);
      setError("Could not fetch ideas right now. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIdeas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pt-20">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setScreen("dashboard")}
            className="h-10 w-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-muted-foreground"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <p className="text-sm text-violet-300/80">Feeling stuck?</p>
            <h1 className="text-3xl font-bold">Bored? Try these</h1>
          </div>
        </div>

        <div className="glass rounded-3xl p-5 border border-white/5 mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center gap-3">
              <Lightbulb className="w-5 h-5 text-amber-300" />
              <div>
                <p className="text-sm text-muted-foreground">Pick a vibe or topic</p>
                <p className="font-semibold">We will pull fresh prompts for you.</p>
              </div>
            </div>
            <div className="flex-1 flex gap-3">
              <input
                value={interest}
                onChange={(e) => setInterest(e.target.value)}
                className="flex-1 rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm focus:border-cyan-400 outline-none"
                placeholder="Space, energy, design..."
              />
              <button
                onClick={() => fetchIdeas()}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 text-white font-medium"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-400/40 bg-red-500/10 text-red-200 px-4 py-3">
            {error}
          </div>
        )}

        {loading && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-muted-foreground">
            Pulling fun facts and mini-games...
          </div>
        )}

        {!loading && content && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <motion.div
              className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-300" />
                <p className="text-sm text-muted-foreground">Fun facts</p>
              </div>
              <ul className="space-y-2">
                {content.funFacts.map((fact, idx) => (
                  <li key={idx} className="text-sm text-foreground bg-white/5 border border-white/5 rounded-xl p-3">
                    {fact}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
            >
              <div className="flex items-center gap-2">
                <Gamepad2 className="w-4 h-4 text-green-300" />
                <p className="text-sm text-muted-foreground">Quick game</p>
              </div>
              <h3 className="text-lg font-semibold">{content.quickGame.title}</h3>
              <p className="text-sm text-muted-foreground">{content.quickGame.idea}</p>
              <div className="rounded-xl bg-white/5 border border-white/10 p-3 text-sm">
                {content.quickGame.howToPlay}
              </div>
              <button
                onClick={() => fetchIdeas(interest)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-sm"
              >
                <Send className="w-4 h-4" />
                New prompt
              </button>
            </motion.div>

            <motion.div
              className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-violet-300" />
                <p className="text-sm text-muted-foreground">Brain teaser</p>
              </div>
              <p className="text-sm font-medium">{content.brainTeaser.question}</p>
              <button
                onClick={() => setReveal((prev) => !prev)}
                className="text-xs px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20"
              >
                {reveal ? "Hide answer" : "Reveal answer"}
              </button>
              {reveal && (
                <div className="rounded-xl bg-emerald-500/10 border border-emerald-400/30 p-3 text-sm text-emerald-100">
                  {content.brainTeaser.answer}
                </div>
              )}
            </motion.div>

            <motion.div
              className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-300" />
                <p className="text-sm text-muted-foreground">Interesting finds</p>
              </div>
              <ul className="space-y-2">
                {content.interestingFinds.map((item, idx) => (
                  <li key={idx} className="text-sm text-foreground bg-white/5 border border-white/5 rounded-xl p-3">
                    {item}
                  </li>
                ))}
              </ul>
              <div className="rounded-xl bg-white/5 border border-white/10 p-3 text-sm text-cyan-100">
                <span className="font-semibold text-white">Surprise: </span>
                {content.surprise}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
