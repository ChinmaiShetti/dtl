"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  HelpCircle,
  ArrowRight,
  Target,
  Zap,
  Award,
  Loader2,
  AlertCircle,
  RefreshCw,
  Lightbulb,
} from "lucide-react";
import type { LearningSession } from "./LearningPlatform";

type Problem = {
  id?: string;
  question: string;
  options: string[];
  correct_answer: number;
  hint: string;
  explanation: string;
  difficulty: "easy" | "medium" | "hard" | "expert";
};

type SavedProblem = Problem & {
  topic: string;
  savedAt: number;
};

type Props = {
  session: LearningSession;
  updateSession: (u: Partial<LearningSession>) => void;
  setScreen: (s: "home" | "dashboard" | "concept" | "practice" | "reflection" | "graph" | "relax" | "bored" | "profile") => void;
  userId: string;
};

export function PracticeScreen({ session, updateSession, setScreen, userId }: Props) {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [tutorLoading, setTutorLoading] = useState(false);
  const [tutorError, setTutorError] = useState<string | null>(null);
  const [tutorReply, setTutorReply] = useState<string | null>(null);
  const [reviewQueue, setReviewQueue] = useState<SavedProblem[]>([]);
  const [reviewProblem, setReviewProblem] = useState<SavedProblem | null>(null);

  const reviewStorageKey = "neurlearn_review_queue";

  useEffect(() => {
    if (session.topic) {
      loadProblems();
    }
  }, [session.topic, difficulty]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(reviewStorageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as SavedProblem[];
        setReviewQueue(parsed);
      }
    } catch {
      setReviewQueue([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(reviewStorageKey, JSON.stringify(reviewQueue));
  }, [reviewQueue]);

  const loadProblems = async () => {
    setLoading(true);
    setError(null);
    setTutorReply(null);
    setTutorError(null);
    
    try {
      const response = await fetch("/api/problems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: session.topic,
          topicId: session.topicId,
          difficulty,
          count: 5,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate problems");
      }

      const data = await response.json();
      
      if (data.problems && data.problems.length > 0) {
        setProblems(data.problems);
        setCurrentIndex(0);
        setSelectedAnswer(null);
        setShowResult(false);
        setShowHint(false);
        setScore({ correct: 0, total: 0 });
      }
    } catch (err) {
      console.error("Error loading problems:", err);
      setError("Failed to load practice problems. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
  };

  const submitAnswer = () => {
    if (selectedAnswer === null) return;
    
    const isCorrect = selectedAnswer === problems[currentIndex].correct_answer;
    const newScore = {
      correct: isCorrect ? score.correct + 1 : score.correct,
      total: score.total + 1,
    };
    setScore(newScore);
    setShowResult(true);
    
    updateSession({
      problemsSolved: (session.problemsSolved || 0) + 1,
      problemsCorrect: isCorrect ? (session.problemsCorrect || 0) + 1 : (session.problemsCorrect || 0),
    });

    fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: userId || "anonymous",
        topicId: session.topicId,
        problemsSolved: 1,
        problemsCorrect: isCorrect ? 1 : 0,
        xpEarned: isCorrect ? 20 : 5,
      }),
    }).catch(console.error);
  };

  const nextProblem = () => {
    if (currentIndex < problems.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setShowHint(false);
      setTutorReply(null);
      setTutorError(null);
    } else {
      setScreen("reflection");
    }
  };

  const askTutor = async (mode: "explain" | "question") => {
    if (!currentProblem || tutorLoading) return;
    setTutorLoading(true);
    setTutorError(null);
    setTutorReply(null);

    try {
      const prompt = mode === "explain"
        ? `Explain the key idea needed to solve this step-by-step, without giving the final answer.\n\nQuestion: ${currentProblem.question}\nOptions: ${currentProblem.options.join(" | ")}`
        : `I'm stuck on this question. Provide a clear explanation and a helpful hint, then briefly summarize the core concept.\n\nQuestion: ${currentProblem.question}\nOptions: ${currentProblem.options.join(" | ")}`;

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: session.topic,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (!response.ok) {
        throw new Error("Tutor request failed");
      }

      const data = await response.json();
      setTutorReply(data?.message?.content || "No reply returned.");
    } catch (err) {
      console.error("Tutor error:", err);
      setTutorError("Could not reach the tutor. Please try again.");
    } finally {
      setTutorLoading(false);
    }
  };

  const isSaved = (problem: Problem) =>
    reviewQueue.some((p) => p.question === problem.question && p.topic === session.topic);

  const toggleSave = (problem: Problem) => {
    if (!session.topic) return;
    if (isSaved(problem)) {
      setReviewQueue((prev) => prev.filter((p) => p.question !== problem.question || p.topic !== session.topic));
      if (reviewProblem?.question === problem.question) {
        setReviewProblem(null);
      }
      return;
    }

    const saved: SavedProblem = {
      ...problem,
      topic: session.topic,
      savedAt: Date.now(),
    };
    setReviewQueue((prev) => [saved, ...prev].slice(0, 20));
  };

  if (!session.topic) {
    return (
      <div className="min-h-screen bg-background pt-24 flex items-center justify-center">
        <div className="text-center">
          <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Topic Selected</h2>
          <p className="text-muted-foreground mb-4">Go back home and search for a topic to practice.</p>
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
          <h2 className="text-2xl font-bold mb-2">Generating Practice Problems</h2>
          <p className="text-muted-foreground">Creating {difficulty} difficulty questions for &quot;{session.topic}&quot;...</p>
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
            onClick={loadProblems}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 text-white font-medium flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const currentProblem = problems[currentIndex];
  const isCorrect = selectedAnswer === currentProblem?.correct_answer;

  return (
    <div className="min-h-screen bg-background pt-24">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-1">Practice: {session.topic}</h1>
              <p className="text-muted-foreground">
                Question {currentIndex + 1} of {problems.length}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {(["easy", "medium", "hard"] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                      difficulty === d
                        ? d === "easy"
                          ? "bg-green-400/20 text-green-400"
                          : d === "medium"
                          ? "bg-yellow-400/20 text-yellow-400"
                          : "bg-red-400/20 text-red-400"
                        : "bg-white/5 text-muted-foreground hover:bg-white/10"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
              <div className="glass px-4 py-2 rounded-xl">
                <span className="text-sm text-muted-foreground">Score: </span>
                <span className="font-bold text-cyan-400">{score.correct}/{score.total}</span>
              </div>
            </div>
          </div>
          
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-400 to-violet-500"
              initial={{ width: 0 }}
              animate={{ width: `${((currentIndex + 1) / problems.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {currentProblem && (
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass rounded-2xl p-8"
            >
              <div className="flex items-start gap-4 mb-8">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold mb-2">{currentProblem.question}</h2>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    currentProblem.difficulty === "easy" ? "bg-green-400/20 text-green-400" :
                    currentProblem.difficulty === "medium" ? "bg-yellow-400/20 text-yellow-400" :
                    currentProblem.difficulty === "hard" ? "bg-orange-400/20 text-orange-400" :
                    "bg-red-400/20 text-red-400"
                  }`}>
                    {currentProblem.difficulty}
                  </span>
                </div>
              </div>

              <div className="space-y-3 mb-8">
                {currentProblem.options.map((option, index) => {
                  let optionStyle = "glass hover:bg-white/10";
                  
                  if (showResult) {
                    if (index === currentProblem.correct_answer) {
                      optionStyle = "bg-green-500/20 border-green-500";
                    } else if (index === selectedAnswer && !isCorrect) {
                      optionStyle = "bg-red-500/20 border-red-500";
                    }
                  } else if (selectedAnswer === index) {
                    optionStyle = "bg-cyan-400/20 border-cyan-400";
                  }

                  <button
                    onClick={() => toggleSave(currentProblem)}
                    className={`px-3 py-2 rounded-xl text-xs border transition-all ${
                      isSaved(currentProblem)
                        ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-300"
                        : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10"
                    }`}
                  >
                    {isSaved(currentProblem) ? "Saved" : "Save for review"}
                  </button>
                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswer(index)}
                      disabled={showResult}
                      className={`w-full p-4 rounded-xl text-left transition-all border border-transparent ${optionStyle} ${
                        showResult ? "cursor-default" : "cursor-pointer"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-sm font-medium">
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span className="flex-1">{option}</span>
                        {showResult && index === currentProblem.correct_answer && (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        )}
                        {showResult && index === selectedAnswer && !isCorrect && (
                          <XCircle className="w-5 h-5 text-red-400" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center gap-3 mb-6">
                {!showResult && !showHint && currentProblem.hint && (
                  <button
                    onClick={() => setShowHint(true)}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Lightbulb className="w-4 h-4" />
                    Need a hint?
                  </button>
                )}
                <button
                  onClick={() => askTutor("explain")}
                  disabled={tutorLoading}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Lightbulb className="w-4 h-4" />
                  Explain this step
                </button>
                <button
                  onClick={() => askTutor("question")}
                  disabled={tutorLoading}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <HelpCircle className="w-4 h-4" />
                  Ask tutor about this question
                </button>
              </div>

              {showHint && !showResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-yellow-400/10 border border-yellow-400/20 mb-6"
                >
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-yellow-400/90">{currentProblem.hint}</p>
                  </div>
                </motion.div>
              )}

              {tutorError && (
                <div className="mb-6 rounded-xl border border-red-400/40 bg-red-500/10 text-red-200 px-4 py-3 text-sm">
                  {tutorError}
                </div>
              )}

              {tutorReply && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-400/20 mb-6"
                >
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-cyan-300 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-foreground whitespace-pre-wrap">{tutorReply}</p>
                  </div>
                </motion.div>
              )}

              {showResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-xl mb-6 ${
                    isCorrect ? "bg-green-400/10 border border-green-400/20" : "bg-red-400/10 border border-red-400/20"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {isCorrect ? (
                      <Award className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <HelpCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className={`font-medium mb-1 ${isCorrect ? "text-green-400" : "text-red-400"}`}>
                        {isCorrect ? "Correct! Great job!" : "Not quite right"}
                      </p>
                      <p className="text-sm text-muted-foreground">{currentProblem.explanation}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="flex items-center justify-between pt-6 border-t border-white/10">
                <div className="text-sm text-muted-foreground">
                  {showResult && (
                    <span className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-cyan-400" />
                      +{isCorrect ? 20 : 5} XP
                    </span>
                  )}
                </div>
                
                {!showResult ? (
                  <button
                    onClick={submitAnswer}
                    disabled={selectedAnswer === null}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 text-white font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Submit Answer
                  </button>
                ) : (
                  <button
                    onClick={nextProblem}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 text-white font-medium hover:opacity-90 transition-all"
                  >
                    {currentIndex < problems.length - 1 ? "Next Question" : "View Results"}
                    <ArrowRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-6 glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Review Queue</h3>
              <p className="text-sm text-muted-foreground">Saved questions you want to revisit</p>
            </div>
            <span className="text-xs text-muted-foreground">{reviewQueue.length} saved</span>
          </div>

          {reviewQueue.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              Save difficult questions to build your review list.
            </div>
          ) : (
            <div className="space-y-3">
              {reviewQueue.slice(0, 5).map((item) => (
                <div key={`${item.topic}-${item.savedAt}`} className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="text-xs text-cyan-300 mb-1">{item.topic}</div>
                  <div className="text-sm font-medium mb-2">{item.question}</div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setReviewProblem(item)}
                      className="px-3 py-1.5 text-xs rounded-lg bg-white/10 hover:bg-white/20"
                    >
                      Review now
                    </button>
                    <button
                      onClick={() => toggleSave(item)}
                      className="px-3 py-1.5 text-xs rounded-lg bg-red-500/10 text-red-300 hover:bg-red-500/20"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {reviewProblem && (
            <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-sm">Review</h4>
                <button
                  onClick={() => setReviewProblem(null)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Close
                </button>
              </div>
              <p className="text-sm mb-2">{reviewProblem.question}</p>
              <p className="text-xs text-muted-foreground">Hint: {reviewProblem.hint}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
