"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Zap,
  Target,
  BookOpen,
  Award,
  TrendingUp,
  Calendar,
  Clock,
  ChevronRight,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

type Stats = {
  totalXp: number;
  totalProblems: number;
  totalCorrect: number;
  accuracy: number;
  conceptsLearned: number;
  streak: number;
  topicsStudied: number;
};

type ProgressItem = {
  id: string;
  topic_id: string;
  concepts_completed: number;
  problems_solved: number;
  problems_correct: number;
  xp_earned: number;
  last_activity: string;
  topics: {
    id: string;
    name: string;
    category: string;
  };
};

type DashboardProps = {
  userId: string;
};

export function Dashboard({ userId }: DashboardProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [progress, setProgress] = useState<ProgressItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProgress();
  }, [userId]);

  const loadProgress = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/progress?userId=${encodeURIComponent(userId || "anonymous")}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch progress");
      }

      const data = await response.json();
      setStats(data.stats);
      setProgress(data.progress || []);
    } catch (err) {
      console.error("Error loading progress:", err);
      setError("Failed to load your progress. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-24 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-cyan-400 mx-auto mb-4 animate-spin" />
          <h2 className="text-2xl font-bold mb-2">Loading Dashboard</h2>
          <p className="text-muted-foreground">Fetching your progress...</p>
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
            onClick={loadProgress}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 text-white font-medium flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: "Total XP", value: stats?.totalXp || 0, icon: Zap, color: "cyan", suffix: "" },
    { label: "Problems Solved", value: stats?.totalProblems || 0, icon: Target, color: "violet", suffix: "" },
    { label: "Accuracy", value: stats?.accuracy || 0, icon: TrendingUp, color: "green", suffix: "%" },
    { label: "Concepts Learned", value: stats?.conceptsLearned || 0, icon: BookOpen, color: "yellow", suffix: "" },
    { label: "Topics Studied", value: stats?.topicsStudied || 0, icon: Award, color: "pink", suffix: "" },
    { label: "Day Streak", value: stats?.streak || 0, icon: Calendar, color: "orange", suffix: "" },
  ];

  return (
    <div className="min-h-screen bg-background pt-24">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold mb-2">Your Dashboard</h1>
          <p className="text-muted-foreground">Track your learning progress and achievements</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="glass rounded-2xl p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <stat.icon className={`w-6 h-6 mb-2 text-${stat.color}-400`} />
              <div className="text-2xl font-bold gradient-text">
                {stat.value}{stat.suffix}
              </div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            className="glass rounded-2xl p-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-cyan-400" />
              Recent Topics
            </h3>
            
            {progress.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No topics studied yet.</p>
                <p className="text-sm">Start learning to see your progress here!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {progress.slice(0, 5).map((item, index) => (
                  <motion.div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400/20 to-violet-500/20 flex items-center justify-center">
                        <Target className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div>
                        <div className="font-medium">{item.topics?.name || "Unknown Topic"}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.concepts_completed} concepts • {item.problems_solved} problems
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-cyan-400 font-medium">+{item.xp_earned} XP</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div
            className="glass rounded-2xl p-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-400" />
              Achievements
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: "First Steps", description: "Complete your first topic", unlocked: (stats?.topicsStudied || 0) > 0 },
                { name: "Problem Solver", description: "Solve 10 problems", unlocked: (stats?.totalProblems || 0) >= 10 },
                { name: "Knowledge Seeker", description: "Learn 5 concepts", unlocked: (stats?.conceptsLearned || 0) >= 5 },
                { name: "Sharp Mind", description: "80%+ accuracy", unlocked: (stats?.accuracy || 0) >= 80 },
                { name: "XP Hunter", description: "Earn 100 XP", unlocked: (stats?.totalXp || 0) >= 100 },
                { name: "Dedicated Learner", description: "3 day streak", unlocked: (stats?.streak || 0) >= 3 },
              ].map((achievement, index) => (
                <motion.div
                  key={achievement.name}
                  className={`p-3 rounded-xl ${achievement.unlocked ? "bg-yellow-400/10 border border-yellow-400/20" : "bg-white/5 opacity-50"}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Award className={`w-4 h-4 ${achievement.unlocked ? "text-yellow-400" : "text-muted-foreground"}`} />
                    <span className={`text-sm font-medium ${achievement.unlocked ? "text-yellow-400" : ""}`}>
                      {achievement.name}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{achievement.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          className="mt-6 glass rounded-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            Performance Overview
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm text-muted-foreground mb-2">Accuracy Rate</div>
              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-green-400 to-cyan-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${stats?.accuracy || 0}%` }}
                  transition={{ duration: 1, delay: 0.7 }}
                />
              </div>
              <div className="text-right text-sm mt-1 text-green-400">{stats?.accuracy || 0}%</div>
            </div>
            
            <div>
              <div className="text-sm text-muted-foreground mb-2">Problem Success</div>
              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-violet-400 to-pink-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${stats?.totalProblems ? (stats.totalCorrect / stats.totalProblems * 100) : 0}%` }}
                  transition={{ duration: 1, delay: 0.8 }}
                />
              </div>
              <div className="text-right text-sm mt-1 text-violet-400">
                {stats?.totalCorrect || 0}/{stats?.totalProblems || 0}
              </div>
            </div>
            
            <div>
              <div className="text-sm text-muted-foreground mb-2">XP Progress to Next Level</div>
              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-yellow-400 to-orange-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${((stats?.totalXp || 0) % 100)}%` }}
                  transition={{ duration: 1, delay: 0.9 }}
                />
              </div>
              <div className="text-right text-sm mt-1 text-yellow-400">
                {(stats?.totalXp || 0) % 100}/100 XP
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
