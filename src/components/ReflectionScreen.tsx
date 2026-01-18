"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Award,
  Target,
  TrendingUp,
  Zap,
  BookOpen,
  ArrowRight,
  Star,
  CheckCircle,
  Loader2,
  AlertCircle,
  RefreshCw,
  Home,
} from "lucide-react";
import type { LearningSession } from "./LearningPlatform";

type Reflection = {
  summary: string;
  strengths: string[];
  improvements: string[];
  nextSteps: string[];
  encouragement: string;
  xpEarned: number;
  badges: string[];
};

type Props = {
  session: LearningSession;
  setScreen: (s: "home" | "dashboard" | "concept" | "practice" | "reflection" | "graph" | "relax" | "bored" | "profile") => void;
  userId: string;
};

export function ReflectionScreen({ session, setScreen, userId }: Props) {
  const [reflection, setReflection] = useState<Reflection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session.topic) {
      loadReflection();
    }
  }, []);

  const loadReflection = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/reflection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId || "anonymous",
          topic: session.topic,
          problemsSolved: session.problemsSolved || 0,
          problemsCorrect: session.problemsCorrect || 0,
          conceptsCompleted: session.conceptsCompleted || 0,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate reflection");
      }

      const data = await response.json();
      setReflection(data.reflection);
    } catch (err) {
      console.error("Error loading reflection:", err);
      setError("Failed to generate your learning reflection. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const accuracy = session.problemsSolved > 0 
    ? Math.round((session.problemsCorrect / session.problemsSolved) * 100) 
    : 0;

  if (!session.topic) {
    return (
      <div className="min-h-screen bg-background pt-24 flex items-center justify-center">
        <div className="text-center">
          <Award className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Learning Session</h2>
          <p className="text-muted-foreground mb-4">Complete a learning session to see your insights.</p>
          <button
            onClick={() => setScreen("home")}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 text-white font-medium"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-24 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-cyan-400 mx-auto mb-4 animate-spin" />
          <h2 className="text-2xl font-bold mb-2">Analyzing Your Performance</h2>
          <p className="text-muted-foreground">Creating personalized insights...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background pt-24 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={loadReflection}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 text-white font-medium flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center mx-auto mb-6">
            <Award className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2">Session Complete!</h1>
          <p className="text-muted-foreground text-lg">{session.topic}</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Concepts Learned", value: session.conceptsCompleted || 0, icon: BookOpen, color: "cyan" },
            { label: "Problems Solved", value: session.problemsSolved || 0, icon: Target, color: "violet" },
            { label: "Accuracy", value: `${accuracy}%`, icon: TrendingUp, color: "green" },
            { label: "XP Earned", value: reflection?.xpEarned || 0, icon: Zap, color: "yellow" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              className="glass rounded-2xl p-4 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <stat.icon className={`w-6 h-6 mx-auto mb-2 text-${stat.color}-400`} />
              <div className="text-2xl font-bold gradient-text">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {reflection?.badges && reflection.badges.length > 0 && (
          <motion.div
            className="glass rounded-2xl p-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              Badges Earned
            </h3>
            <div className="flex flex-wrap gap-2">
              {reflection.badges.map((badge, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 rounded-full bg-yellow-400/20 text-yellow-400 text-sm font-medium"
                >
                  {badge}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {reflection && (
          <>
            <motion.div
              className="glass rounded-2xl p-6 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h3 className="font-semibold mb-4">Summary</h3>
              <p className="text-muted-foreground">{reflection.summary}</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <motion.div
                className="glass rounded-2xl p-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <h3 className="font-semibold mb-4 flex items-center gap-2 text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  Strengths
                </h3>
                <ul className="space-y-2">
                  {reflection.strengths.map((strength, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-green-400 mt-1">•</span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                className="glass rounded-2xl p-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
              >
                <h3 className="font-semibold mb-4 flex items-center gap-2 text-yellow-400">
                  <TrendingUp className="w-5 h-5" />
                  Areas to Improve
                </h3>
                <ul className="space-y-2">
                  {reflection.improvements.map((improvement, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-yellow-400 mt-1">•</span>
                      {improvement}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>

            <motion.div
              className="glass rounded-2xl p-6 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <h3 className="font-semibold mb-4 flex items-center gap-2 text-cyan-400">
                <Target className="w-5 h-5" />
                Recommended Next Steps
              </h3>
              <ul className="space-y-2">
                {reflection.nextSteps.map((step, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-cyan-400 mt-1">{index + 1}.</span>
                    {step}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              className="p-6 rounded-2xl bg-gradient-to-r from-cyan-400/20 to-violet-500/20 border border-cyan-400/20 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <p className="text-lg text-center">{reflection.encouragement}</p>
            </motion.div>
          </>
        )}

        <motion.div
          className="flex flex-wrap justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <button
            onClick={() => setScreen("home")}
            className="flex items-center gap-2 px-6 py-3 rounded-xl glass hover:bg-white/10 transition-all font-medium"
          >
            <Home className="w-5 h-5" />
            Back Home
          </button>
          <button
            onClick={() => setScreen("practice")}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 text-white font-medium hover:opacity-90 transition-all"
          >
            Practice More
            <ArrowRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => setScreen("dashboard")}
            className="flex items-center gap-2 px-6 py-3 rounded-xl glass hover:bg-white/10 transition-all font-medium"
          >
            View Dashboard
          </button>
        </motion.div>
      </div>
    </div>
  );
}
