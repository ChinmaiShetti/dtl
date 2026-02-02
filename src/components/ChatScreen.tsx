"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Bot,
  Send,
  Loader2,
  AlertCircle,
  Sparkles,
} from "lucide-react";

type Screen = "home" | "dashboard" | "concept" | "practice" | "reflection" | "graph" | "profile" | "relax" | "bored" | "chat";

type Message = {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
};

type Props = {
  setScreen: (s: Screen) => void;
  topic?: string;
};

const quickPrompts = [
  "Explain this like I'm new",
  "Give a simple example",
  "What are common mistakes?",
  "Summarize key points",
];

export function ChatScreen({ setScreen, topic }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I’m your doubt‑clearing tutor. Ask anything, and I’ll explain step‑by‑step with intuition and examples.",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const canSend = input.trim().length > 0 && !loading;

  const contextHint = useMemo(() => {
    if (!topic) return "General doubts";
    return `Doubts about ${topic}`;
  }, [topic]);

  const sendMessage = async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed || loading) return;

    const newMessage: Message = {
      role: "user",
      content: trimmed,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const recent = [...messages, newMessage]
        .filter((m) => m.role !== "assistant" || m.content)
        .slice(-10)
        .map((m) => ({ role: m.role, content: m.content }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: recent, topic }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      const reply = data?.message?.content || "I couldn't generate a reply. Try again.";

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: reply, timestamp: Date.now() },
      ]);
    } catch (err) {
      console.error("Chat error:", err);
      setError("Could not fetch a response. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setScreen("dashboard")}
            className="h-10 w-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-muted-foreground"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <p className="text-sm text-cyan-300/80">Doubt clearer</p>
            <h1 className="text-3xl font-bold">Ask Your Tutor</h1>
            <p className="text-sm text-muted-foreground">{contextHint}</p>
          </div>
        </div>

        <motion.div
          className="glass rounded-3xl p-6 border border-white/5 flex flex-col h-[70vh]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4 text-cyan-300" />
            Ask anything. I’ll explain clearly and patiently.
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {messages.map((m, idx) => (
              <div
                key={`${m.timestamp}-${idx}`}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed border ${
                    m.role === "user"
                      ? "bg-cyan-500/20 border-cyan-400/30 text-foreground"
                      : "bg-white/5 border-white/10 text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1 text-xs text-muted-foreground">
                    {m.role === "assistant" ? <Bot className="w-3 h-3" /> : "You"}
                    <span>{m.role === "assistant" ? "Tutor" : "You"}</span>
                  </div>
                  <div className="whitespace-pre-wrap">{m.content}</div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Thinking…
              </div>
            )}
            <div ref={endRef} />
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-red-400/40 bg-red-500/10 text-red-200 px-4 py-2 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <div className="mt-4">
            <div className="flex flex-wrap gap-2 mb-3">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="px-3 py-1.5 rounded-full text-xs bg-white/5 border border-white/10 hover:bg-white/10"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <div className="flex items-end gap-3">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your doubt…"
                rows={2}
                className="flex-1 rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm focus:border-cyan-400 outline-none resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(input);
                  }
                }}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!canSend}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-violet-500 text-white font-medium disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                Send
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
