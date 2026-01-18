"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useRef, useEffect, useMemo } from "react";
import {
  Search,
  ArrowRight,
  Sparkles,
  Play,
  BookOpen,
  Zap,
  Users,
  Award,
  ChevronDown,
  Menu,
  X,
  User,
  LogIn,
  Brain,
  Lightbulb,
  Target,
  MessageCircle,
} from "lucide-react";
import { AgentCard, agents, AgentOrbit } from "./AIAgents";
import { Dashboard } from "./Dashboard";
import { KnowledgeGraph } from "./KnowledgeGraph";
import { ConceptLearning } from "./ConceptLearning";
import { PracticeScreen } from "./PracticeScreen";
import { ReflectionScreen } from "./ReflectionScreen";
import { ProfileScreen } from "./ProfileScreen";
import { AuthModal } from "./AuthModal";
import { RelaxScreen } from "./RelaxScreen";
import { BoredScreen } from "./BoredScreen";

type AuthUser = {
  id: string;
  email: string;
  displayName?: string;
};

type Screen = "home" | "dashboard" | "concept" | "practice" | "reflection" | "graph" | "profile" | "relax" | "bored";

export type LearningSession = {
  topic: string;
  topicId?: string;
  conceptsCompleted: number;
  problemsSolved: number;
  problemsCorrect: number;
};

const particlePositions = [
  { left: 5, top: 12 }, { left: 15, top: 28 }, { left: 25, top: 8 }, { left: 35, top: 45 }, { left: 45, top: 22 },
  { left: 55, top: 67 }, { left: 65, top: 34 }, { left: 75, top: 78 }, { left: 85, top: 15 }, { left: 95, top: 55 },
  { left: 10, top: 42 }, { left: 20, top: 88 }, { left: 30, top: 5 }, { left: 40, top: 72 }, { left: 50, top: 38 },
  { left: 60, top: 92 }, { left: 70, top: 18 }, { left: 80, top: 62 }, { left: 90, top: 48 }, { left: 3, top: 75 },
  { left: 13, top: 32 }, { left: 23, top: 95 }, { left: 33, top: 58 }, { left: 43, top: 3 }, { left: 53, top: 82 },
  { left: 63, top: 25 }, { left: 73, top: 68 }, { left: 83, top: 40 }, { left: 93, top: 85 }, { left: 8, top: 52 },
  { left: 18, top: 10 }, { left: 28, top: 65 }, { left: 38, top: 30 }, { left: 48, top: 90 }, { left: 58, top: 20 },
  { left: 68, top: 50 }, { left: 78, top: 8 }, { left: 88, top: 35 }, { left: 98, top: 70 }, { left: 2, top: 60 },
  { left: 12, top: 85 }, { left: 22, top: 40 }, { left: 32, top: 15 }, { left: 42, top: 95 }, { left: 52, top: 28 },
  { left: 62, top: 75 }, { left: 72, top: 12 }, { left: 82, top: 55 }, { left: 92, top: 32 }, { left: 7, top: 98 },
];

function AnimatedBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-[#0a0a0f]" />
      
      <div className="absolute inset-0 bg-grid-pattern opacity-30" />
      
      <motion.div
        className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(0, 212, 255, 0.15) 0%, transparent 70%)",
        }}
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
      
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)",
        }}
        animate={{
          x: [0, -40, 0],
          y: [0, -50, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      />
      
      <motion.div
        className="absolute top-1/2 right-1/3 w-[400px] h-[400px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(0, 255, 136, 0.1) 0%, transparent 70%)",
        }}
        animate={{
          x: [0, 30, 0],
          y: [0, -40, 0],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
      />
      
      {particlePositions.map((pos, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-white/20"
          style={{
            left: `${pos.left}%`,
            top: `${pos.top}%`,
          }}
          animate={{
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 2.5 + (i % 5) * 0.5,
            repeat: Infinity,
            delay: (i % 10) * 0.2,
          }}
        />
      ))}
    </div>
  );
}

function Navbar({ currentScreen, setScreen, user, onLogout, onOpenAuth }: { 
  currentScreen: Screen; 
  setScreen: (s: Screen) => void;
  user: AuthUser | null;
  onLogout: () => void;
  onOpenAuth: (mode: "login" | "signup") => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between glass rounded-2xl px-6 py-3">
        <button
          onClick={() => setScreen("home")}
          className="flex items-center gap-2"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-lg hidden sm:block">NeurLearn</span>
        </button>

        <div className="hidden md:flex items-center gap-1">
          {[
            { id: "home", label: "Home" },
            { id: "dashboard", label: "Dashboard" },
            { id: "concept", label: "Concepts" },
            { id: "practice", label: "Practice" },
            { id: "reflection", label: "Insights" },
            { id: "graph", label: "Graph" },
            { id: "relax", label: "Relax" },
            { id: "bored", label: "Bored?" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setScreen(item.id as Screen)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                currentScreen === item.id
                  ? "bg-cyan-400/20 text-cyan-400"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <button
                onClick={() => setScreen("profile")}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                  currentScreen === "profile"
                    ? "bg-cyan-400/20 text-cyan-400"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                <User className="w-4 h-4" />
                {user.displayName || user.email.split("@")[0]}
              </button>
              <button
                onClick={onLogout}
                className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onOpenAuth("login")}
                className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                Login
              </button>
              <button
                onClick={() => onOpenAuth("signup")}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-cyan-400 to-violet-500 text-white hover:opacity-90 transition-all"
              >
                Sign Up
              </button>
            </>
          )}
        </div>

        <button
          className="md:hidden p-2 rounded-xl glass"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {menuOpen && (
        <motion.div
          className="md:hidden mt-2 glass rounded-2xl p-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {[
            { id: "home", label: "Home" },
            { id: "dashboard", label: "Dashboard" },
            { id: "concept", label: "Concepts" },
            { id: "practice", label: "Practice" },
            { id: "reflection", label: "Insights" },
            { id: "graph", label: "Graph" },
            { id: "relax", label: "Relax" },
            { id: "bored", label: "Bored?" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setScreen(item.id as Screen);
                setMenuOpen(false);
              }}
              className="w-full px-4 py-3 rounded-xl text-left text-sm font-medium hover:bg-white/5 transition-all"
            >
              {item.label}
            </button>
          ))}
          <div className="border-t border-white/10 mt-2 pt-2 space-y-2">
            {user ? (
              <>
                <button
                  onClick={() => {
                    setScreen("profile");
                    setMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 rounded-xl text-sm font-medium hover:bg-white/5 transition-all text-left flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  {user.displayName || user.email.split("@")[0]}
                </button>
                <button
                  onClick={() => {
                    onLogout();
                    setMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 rounded-xl text-sm font-medium hover:bg-white/5 transition-all text-left"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    onOpenAuth("login");
                    setMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 rounded-xl text-sm font-medium hover:bg-white/5 transition-all text-left flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </button>
                <button
                  onClick={() => {
                    onOpenAuth("signup");
                    setMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 rounded-xl text-sm font-medium bg-gradient-to-r from-cyan-400 to-violet-500 text-white"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}

function HeroSection({ setScreen, updateSession, user, onOpenAuth }: { 
  setScreen: (s: Screen) => void; 
  updateSession: (u: Partial<LearningSession>) => void;
  user: AuthUser | null;
  onOpenAuth: (mode: "login" | "signup") => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleExplore = (topic: string) => {
    if (topic.trim()) {
      updateSession({ topic: topic.trim(), conceptsCompleted: 0, problemsSolved: 0, problemsCorrect: 0 });
      setScreen("concept");
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 pt-24">
      <div className="max-w-6xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-sm">Powered by Multi-Agent AI</span>
          </motion.div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Your Personal{" "}
            <span className="gradient-text">AI Mentor</span>
            <br />
            for Engineering Mastery
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Experience adaptive, personalized learning with intelligent AI agents that understand your unique learning style and guide you to excellence.
          </p>

          <motion.div
            className="relative max-w-2xl mx-auto mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="relative glass rounded-2xl p-2">
              <div className="flex items-center gap-3 px-4">
                <Search className="w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search a subject, concept, or engineering domain..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleExplore(searchQuery)}
                  className="flex-1 bg-transparent py-4 outline-none text-foreground placeholder:text-muted-foreground"
                />
                <button 
                  onClick={() => handleExplore(searchQuery)}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 text-white font-medium hover:opacity-90 transition-all flex items-center gap-2"
                >
                  Explore
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {["Data Structures", "Machine Learning", "System Design", "Algorithms"].map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleExplore(tag)}
                  className="px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground bg-white/5 hover:bg-white/10 transition-all"
                >
                  {tag}
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="flex flex-wrap justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
              <button
                onClick={() => setScreen("dashboard")}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 text-white font-medium hover:opacity-90 transition-all flex items-center gap-2"
              >
                <Play className="w-5 h-5" />
                Continue Learning
              </button>
              {!user && (
                <>
                  <button 
                    onClick={() => onOpenAuth("signup")}
                    className="px-6 py-3 rounded-xl glass hover:bg-white/10 transition-all flex items-center gap-2 font-medium"
                  >
                    <User className="w-5 h-5" />
                    Create Profile
                  </button>
                  <button 
                    onClick={() => onOpenAuth("login")}
                    className="px-6 py-3 rounded-xl glass hover:bg-white/10 transition-all flex items-center gap-2 font-medium"
                  >
                    <LogIn className="w-5 h-5" />
                    Login
                  </button>
                </>
              )}
          </motion.div>
        </motion.div>

        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown className="w-6 h-6 text-muted-foreground" />
        </motion.div>
      </div>
    </section>
  );
}

function AgentsSection() {
  return (
    <section className="relative py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Meet Your <span className="gradient-text">AI Agents</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Four specialized AI agents work together to create your personalized learning experience
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {agents.map((agent, index) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <AgentCard {...agent} />
              </motion.div>
            ))}
          </div>

          <motion.div
            className="hidden lg:flex justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <AgentOrbit />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "Adaptive Content",
      description: "Content adjusts to your learning pace and style automatically",
      color: "#00d4ff",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Real-time Feedback",
      description: "Get instant, personalized feedback on every problem you solve",
      color: "#8b5cf6",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "AI Collaboration",
      description: "Multiple AI agents work together for comprehensive learning",
      color: "#00ff88",
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Mastery Tracking",
      description: "Visual progress tracking with knowledge graphs and analytics",
      color: "#feca57",
    },
  ];

  return (
    <section className="relative py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why Choose <span className="gradient-text">NeurLearn</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A revolutionary approach to engineering education powered by cutting-edge AI
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="p-6 rounded-2xl glass group hover:scale-[1.02] transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                style={{ background: `${feature.color}20` }}
              >
                <div style={{ color: feature.color }}>{feature.icon}</div>
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  const stats = [
    { value: "50K+", label: "Active Learners" },
    { value: "1M+", label: "Problems Solved" },
    { value: "500+", label: "Topics Covered" },
    { value: "95%", label: "Success Rate" },
  ];

  return (
    <section className="relative py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="p-8 md:p-12 rounded-3xl overflow-hidden relative"
          style={{
            background: "linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(139, 92, 246, 0.2))",
          }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="absolute top-0 left-0 w-64 h-64 rounded-full blur-3xl bg-cyan-400/20" />
          <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full blur-3xl bg-violet-500/20" />
          
          <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function CTASection({ setScreen }: { setScreen: (s: Screen) => void }) {
  return (
    <section className="relative py-24 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Join thousands of engineering students who are mastering concepts faster with AI-powered personalized learning.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => setScreen("dashboard")}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 text-white font-medium hover:opacity-90 transition-all flex items-center gap-2 text-lg"
            >
              Start Learning Free
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="px-8 py-4 rounded-xl glass hover:bg-white/10 transition-all flex items-center gap-2 font-medium text-lg">
              Watch Demo
              <Play className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="relative py-12 px-6 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold">NeurLearn</span>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">About</a>
            <a href="#" className="hover:text-foreground transition-colors">Features</a>
            <a href="#" className="hover:text-foreground transition-colors">Pricing</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          </div>
          
          <div className="text-sm text-muted-foreground">
            © 2024 NeurLearn. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}

function HomePage({ setScreen, session, updateSession, user, onOpenAuth }: { 
  setScreen: (s: Screen) => void; 
  session: LearningSession; 
  updateSession: (u: Partial<LearningSession>) => void;
  user: AuthUser | null;
  onOpenAuth: (mode: "login" | "signup") => void;
}) {
  return (
    <>
      <HeroSection setScreen={setScreen} updateSession={updateSession} user={user} onOpenAuth={onOpenAuth} />
      <AgentsSection />
      <FeaturesSection />
      <StatsSection />
      <CTASection setScreen={setScreen} />
      <Footer />
    </>
  );
}

function GraphScreen({ userId }: { userId: string }) {
  return (
    <div className="min-h-screen bg-background pt-24">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold mb-2">Knowledge Graph</h1>
          <p className="text-muted-foreground">Explore your learning journey visually</p>
        </motion.div>
        <KnowledgeGraph userId={userId} />
      </div>
    </div>
  );
}

export function LearningPlatform() {
  const [currentScreen, setScreen] = useState<Screen>("home");
  const [session, setSession] = useState<LearningSession>({
    topic: "",
    conceptsCompleted: 0,
    problemsSolved: 0,
    problemsCorrect: 0,
  });
  const [user, setUser] = useState<AuthUser | null>(null);
  const [userId, setUserId] = useState<string>("anonymous");
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        localStorage.setItem("neurlearn_user_id", data.user.id);
        setUserId(data.user.id);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    }
  };

  useEffect(() => {
    const storedId = localStorage.getItem("neurlearn_user_id");
    if (storedId) {
      setUserId(storedId);
    }
    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      localStorage.removeItem("neurlearn_user_id");
      setUserId("anonymous");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleAuthSuccess = (authUser: AuthUser) => {
    setUser(authUser);
    localStorage.setItem("neurlearn_user_id", authUser.id);
    setUserId(authUser.id);
  };

  const openAuth = (mode: "login" | "signup") => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const updateSession = (updates: Partial<LearningSession>) => {
    setSession((prev) => ({ ...prev, ...updates }));
  };

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <div className="relative z-10">
        <Navbar 
          currentScreen={currentScreen} 
          setScreen={setScreen} 
          user={user}
          onLogout={handleLogout}
          onOpenAuth={openAuth}
        />
        
        {currentScreen === "home" && (
          <HomePage 
            setScreen={setScreen} 
            session={session} 
            updateSession={updateSession}
            user={user}
            onOpenAuth={openAuth}
          />
        )}
        {currentScreen === "dashboard" && <Dashboard userId={userId} />}
        {currentScreen === "concept" && (
          <ConceptLearning
            session={session}
            updateSession={updateSession}
            setScreen={setScreen}
            userId={userId}
          />
        )}
        {currentScreen === "practice" && (
          <PracticeScreen
            session={session}
            updateSession={updateSession}
            setScreen={setScreen}
            userId={userId}
          />
        )}
        {currentScreen === "reflection" && (
          <ReflectionScreen
            session={session}
            setScreen={setScreen}
            userId={userId}
          />
        )}
        {currentScreen === "graph" && <GraphScreen userId={userId} />}
        {currentScreen === "profile" && <ProfileScreen onBack={() => setScreen("home")} />}
        {currentScreen === "relax" && <RelaxScreen setScreen={setScreen} />}
        {currentScreen === "bored" && (
          <BoredScreen setScreen={setScreen} sessionTopic={session.topic} />
        )}
      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        initialMode={authMode}
      />
    </div>
  );
}
