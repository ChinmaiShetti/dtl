"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  ChevronRight,
  ChevronLeft,
  BookOpen,
  CheckCircle,
  Circle,
  Lightbulb,
  Target,
  ArrowRight,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import type { LearningSession } from "./LearningPlatform";
import Markdown from "react-markdown";

type Concept = {
  id: string;
  title: string;
  content: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  order_index: number;
};

type Props = {
  session: LearningSession;
  updateSession: (u: Partial<LearningSession>) => void;
  setScreen: (s: "home" | "dashboard" | "concept" | "practice" | "reflection" | "graph" | "relax" | "bored" | "profile") => void;
  userId: string;
};

export function ConceptLearning({ session, updateSession, setScreen, userId }: Props) {
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedConcepts, setCompletedConcepts] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [topicId, setTopicId] = useState<string | null>(null);
  const [explainLoading, setExplainLoading] = useState(false);
  const [explainError, setExplainError] = useState<string | null>(null);
  const [explainText, setExplainText] = useState<string | null>(null);

  useEffect(() => {
    if (session.topic) {
      loadConcepts();
    }
  }, [session.topic]);

  const loadConcepts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/concepts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: session.topic, userId: userId || "anonymous" }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate concepts");
      }

      const data = await response.json();
      
      if (data.concepts && data.concepts.length > 0) {
        const sortedConcepts = [...data.concepts].sort((a, b) => a.order_index - b.order_index);
        setConcepts(sortedConcepts);
        setTopicId(data.topic?.id || data.concepts[0]?.topic_id);
        updateSession({ topicId: data.topic?.id || data.concepts[0]?.topic_id });
      }
    } catch (err) {
      console.error("Error loading concepts:", err);
      setError("Failed to load concepts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const markComplete = (conceptId: string) => {
    const newCompleted = new Set(completedConcepts);
    newCompleted.add(conceptId);
    setCompletedConcepts(newCompleted);
    updateSession({ conceptsCompleted: newCompleted.size });

    fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: userId || "anonymous",
        topicId: topicId,
        conceptsCompleted: 1,
        xpEarned: 10,
      }),
    }).catch(console.error);
  };

  const goNext = () => {
    if (!completedConcepts.has(concepts[currentIndex]?.id)) {
      markComplete(concepts[currentIndex].id);
    }
    if (currentIndex < concepts.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const goToPractice = () => {
    if (!completedConcepts.has(concepts[currentIndex]?.id)) {
      markComplete(concepts[currentIndex].id);
    }
    setScreen("practice");
  };

  const requestExplain = async () => {
    const current = concepts[currentIndex];
    if (!current || explainLoading) return;

    setExplainLoading(true);
    setExplainError(null);
    setExplainText(null);

    try {
      const context = `${current.title}\n\n${current.content}`.slice(0, 2000);
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: session.topic,
          messages: [
            {
              role: "user",
              content: `Explain this step-by-step in simple language and highlight the key idea in 2-3 bullet points. Keep it short and clear.\n\n${context}`,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get explanation");
      }

      const data = await response.json();
      setExplainText(data?.message?.content || "No explanation returned.");
    } catch (err) {
      console.error("Explain error:", err);
      setExplainError("Could not load the explanation. Try again.");
    } finally {
      setExplainLoading(false);
    }
  };

  if (!session.topic) {
    return (
      <div className="min-h-screen bg-background pt-24 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Topic Selected</h2>
          <p className="text-muted-foreground mb-4">Go back home and search for a topic to learn.</p>
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
          <h2 className="text-2xl font-bold mb-2">Generating Learning Content</h2>
          <p className="text-muted-foreground">Creating personalized content for &quot;{session.topic}&quot;...</p>
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
            onClick={loadConcepts}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 text-white font-medium flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const currentConcept = concepts[currentIndex];
  const progress = concepts.length > 0 ? ((completedConcepts.size / concepts.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-background pt-24">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-1">{session.topic}</h1>
              <p className="text-muted-foreground">
                Concept {currentIndex + 1} of {concepts.length}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground mb-1">Progress</div>
              <div className="text-2xl font-bold gradient-text">{Math.round(progress)}%</div>
            </div>
          </div>
          
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-400 to-violet-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="glass rounded-2xl p-4 sticky top-24">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Target className="w-4 h-4 text-cyan-400" />
                Concepts
              </h3>
              <div className="space-y-2">
                {concepts.map((concept, index) => (
                  <button
                    key={concept.id}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                      index === currentIndex
                        ? "bg-cyan-400/20 text-cyan-400"
                        : "hover:bg-white/5"
                    }`}
                  >
                    {completedConcepts.has(concept.id) ? (
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    )}
                    <span className="text-sm truncate">{concept.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 order-1 lg:order-2">
            <AnimatePresence mode="wait">
              {currentConcept && (
                <motion.div
                  key={currentConcept.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="glass rounded-2xl p-8"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center">
                      <Lightbulb className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{currentConcept.title}</h2>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        currentConcept.difficulty === "beginner" ? "bg-green-400/20 text-green-400" :
                        currentConcept.difficulty === "intermediate" ? "bg-yellow-400/20 text-yellow-400" :
                        "bg-red-400/20 text-red-400"
                      }`}>
                        {currentConcept.difficulty}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mb-6">
                    <button
                      onClick={requestExplain}
                      disabled={explainLoading}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-sm"
                    >
                      <Lightbulb className="w-4 h-4" />
                      {explainLoading ? "Explaining…" : "Explain this step"}
                    </button>
                    <span className="text-xs text-muted-foreground">Instant micro‑hint for this concept.</span>
                  </div>

                  {explainError && (
                    <div className="mb-6 rounded-xl border border-red-400/40 bg-red-500/10 text-red-200 px-4 py-3 text-sm">
                      {explainError}
                    </div>
                  )}

                  {explainText && (
                    <div className="mb-6 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-4 text-sm text-foreground">
                      <div className="flex items-center gap-2 text-xs text-cyan-300 mb-2">
                        <Lightbulb className="w-3 h-3" />
                        Micro‑hint
                      </div>
                      <div className="whitespace-pre-wrap">{explainText}</div>
                    </div>
                  )}

                  <div className="prose prose-invert max-w-none">
                    <Markdown
                      components={{
                        h1: ({ children }) => <h1 className="text-2xl font-bold mt-6 mb-4">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-xl font-bold mt-5 mb-3">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-lg font-bold mt-4 mb-2">{children}</h3>,
                        p: ({ children }) => <p className="text-muted-foreground leading-relaxed mb-4">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc list-inside space-y-2 mb-4">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal list-inside space-y-2 mb-4">{children}</ol>,
                        li: ({ children }) => <li className="text-muted-foreground">{children}</li>,
                        code: ({ className, children, ...props }) => {
                          const match = /language-(\w+)/.exec(className || '');
                          const isInline = !match;
                          return isInline ? (
                            <code className="px-1.5 py-0.5 bg-white/10 rounded text-cyan-400 text-sm" {...props}>
                              {children}
                            </code>
                          ) : (
                            <pre className="bg-black/30 rounded-xl p-4 overflow-x-auto mb-4">
                              <code className="text-sm text-green-400" {...props}>
                                {children}
                              </code>
                            </pre>
                          );
                        },
                        pre: ({ children }) => <>{children}</>,
                        strong: ({ children }) => <strong className="text-foreground font-semibold">{children}</strong>,
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-4 border-cyan-400 pl-4 italic text-muted-foreground my-4">
                            {children}
                          </blockquote>
                        ),
                      }}
                    >
                      {currentConcept.content}
                    </Markdown>
                  </div>

                  <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
                    <button
                      onClick={goPrev}
                      disabled={currentIndex === 0}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl glass hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-5 h-5" />
                      Previous
                    </button>

                    {currentIndex === concepts.length - 1 ? (
                      <button
                        onClick={goToPractice}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 text-white font-medium hover:opacity-90 transition-all"
                      >
                        Start Practice
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    ) : (
                      <button
                        onClick={goNext}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 text-white font-medium hover:opacity-90 transition-all"
                      >
                        Next Concept
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
