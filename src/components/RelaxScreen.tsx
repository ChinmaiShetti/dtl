"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Moon, Pause, Play, Sparkles, Sun, Wind } from "lucide-react";

const tracks = [
  {
    title: "Ocean Waves",
    url: "https://cdn.pixabay.com/download/audio/2021/09/06/audio_7d1b894a7a.mp3?filename=calm-ocean-waves-ambient-7780.mp3",
    mood: "Calming"
  },
  {
    title: "Forest Birds",
    url: "https://cdn.pixabay.com/download/audio/2022/02/23/audio_d5d23409a9.mp3?filename=forest-birds-and-stream-ambient-110499.mp3",
    mood: "Bright"
  },
  {
    title: "Low-fi Drift",
    url: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_d35f3ab515.mp3?filename=lofi-study-112191.mp3",
    mood: "Cozy"
  }
];

type Screen = "home" | "dashboard" | "concept" | "practice" | "reflection" | "graph" | "profile" | "relax" | "bored";

type Props = {
  setScreen: (s: Screen) => void;
};

export function RelaxScreen({ setScreen }: Props) {
  const [selectedTrack, setSelectedTrack] = useState(tracks[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(10);
  const [timeLeft, setTimeLeft] = useState(10 * 60);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(selectedTrack.url);
    audio.loop = true;
    audio.volume = 0.4;
    audioRef.current = audio;

    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    }

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, [selectedTrack]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    setTimeLeft(duration * 60);
  }, [duration]);

  useEffect(() => {
    if (!isTimerActive) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsTimerActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerActive]);

  const formattedTime = useMemo(() => {
    const minutes = Math.floor(timeLeft / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (timeLeft % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  }, [timeLeft]);

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
            <p className="text-sm text-cyan-300/80">Mindful break</p>
            <h1 className="text-3xl font-bold">Relax & Reset</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            className="lg:col-span-2 glass rounded-3xl p-6 border border-white/5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Relaxation playlist</p>
                <h3 className="text-xl font-semibold">Curated ambient sound</h3>
              </div>
              <button
                onClick={() => setIsPlaying((prev) => !prev)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-sm"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isPlaying ? "Pause" : "Play"}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
              {tracks.map((track) => (
                <button
                  key={track.title}
                  onClick={() => {
                    setSelectedTrack(track);
                    setIsPlaying(true);
                  }}
                  className={`rounded-2xl p-4 text-left transition-all border border-white/5 hover:border-cyan-500/50 ${
                    selectedTrack.title === track.title ? "bg-cyan-500/10" : "bg-white/5"
                  }`}
                >
                  <p className="text-sm text-cyan-200/80">{track.mood}</p>
                  <p className="font-semibold">{track.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">Tap to switch</p>
                </button>
              ))}
            </div>

            <div className="rounded-2xl bg-white/5 p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
                <Wind className="w-5 h-5 text-cyan-300" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Breathing cue</p>
                <p className="font-medium">Inhale 4s · Hold 4s · Exhale 6s</p>
              </div>
              <div className="text-xs px-3 py-1 rounded-full bg-white/10">Try for 5 cycles</div>
            </div>
          </motion.div>

          <motion.div
            className="glass rounded-3xl p-6 border border-white/5 flex flex-col"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-5 h-5 text-cyan-300" />
              <div>
                <p className="text-sm text-muted-foreground">Session timer</p>
                <h3 className="text-xl font-semibold">Stay mindful</h3>
              </div>
            </div>

            <div className="text-5xl font-bold text-center gradient-text mb-3">{formattedTime}</div>
            <p className="text-sm text-muted-foreground text-center mb-4">Pick a duration and start your reset.</p>

            <div className="flex items-center justify-between gap-2 mb-4">
              {[5, 10, 15, 20, 25].map((min) => (
                <button
                  key={min}
                  onClick={() => setDuration(min)}
                  className={`flex-1 py-2 rounded-xl border text-sm transition-all ${
                    duration === min ? "border-cyan-400 bg-cyan-400/10" : "border-white/10 bg-white/5 hover:border-white/20"
                  }`}
                >
                  {min}m
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => setIsTimerActive((prev) => !prev)}
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 text-white font-medium"
              >
                {isTimerActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />} {isTimerActive ? "Pause" : "Start"}
              </button>
              <button
                onClick={() => {
                  setIsTimerActive(false);
                  setTimeLeft(duration * 60);
                }}
                className="px-4 py-3 rounded-xl border border-white/10 text-sm hover:border-white/20"
              >
                Reset
              </button>
            </div>

            {timeLeft === 0 && (
              <div className="text-center text-sm text-emerald-300 bg-emerald-500/10 border border-emerald-400/30 rounded-xl p-3 mb-3">
                Timer complete. Take a gentle stretch before diving back in.
              </div>
            )}

            <div className="space-y-3">
              {[{ title: "Box breathing", desc: "4-4-4-4 rhythm to steady the mind." }, { title: "Shoulder roll", desc: "Slow circles to loosen tension." }, { title: "Eye break", desc: "Focus on a distant point for 20 seconds." }].map((tip) => (
                <div key={tip.title} className="rounded-xl bg-white/5 border border-white/10 p-3">
                  <p className="font-medium">{tip.title}</p>
                  <p className="text-sm text-muted-foreground">{tip.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="rounded-2xl bg-white/5 border border-white/10 p-4 flex items-start gap-3">
            <Sun className="w-5 h-5 text-amber-300 mt-1" />
            <div>
              <p className="font-semibold">Light mode break</p>
              <p className="text-sm text-muted-foreground">Step away for sunlight or hydrate before your next sprint.</p>
            </div>
          </div>
          <div className="rounded-2xl bg-white/5 border border-white/10 p-4 flex items-start gap-3">
            <Moon className="w-5 h-5 text-indigo-300 mt-1" />
            <div>
              <p className="font-semibold">Evening wind-down</p>
              <p className="text-sm text-muted-foreground">Lower brightness, slow breaths, and keep volume gentle.</p>
            </div>
          </div>
          <div className="rounded-2xl bg-white/5 border border-white/10 p-4 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-cyan-300 mt-1" />
            <div>
              <p className="font-semibold">Micro-celebration</p>
              <p className="text-sm text-muted-foreground">Note one win from today before you continue learning.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
