"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef, useState, useCallback } from "react";

interface Node {
  id: string;
  label: string;
  x: number;
  y: number;
  mastery: number;
  connections: string[];
  conceptsCompleted: number;
  problemsSolved: number;
  problemsCorrect: number;
  xpEarned: number;
  accuracy: number;
}

const sampleNodes: Node[] = [
  { id: "sample-1", label: "Start Learning", x: 380, y: 320, mastery: 40, connections: ["sample-2"], conceptsCompleted: 1, problemsSolved: 2, problemsCorrect: 1, xpEarned: 30, accuracy: 50 },
  { id: "sample-2", label: "Pick a Topic", x: 520, y: 260, mastery: 60, connections: ["sample-3"], conceptsCompleted: 2, problemsSolved: 3, problemsCorrect: 2, xpEarned: 60, accuracy: 67 },
  { id: "sample-3", label: "Solve Problems", x: 280, y: 220, mastery: 30, connections: ["sample-4"], conceptsCompleted: 0, problemsSolved: 1, problemsCorrect: 0, xpEarned: 10, accuracy: 0 },
  { id: "sample-4", label: "Review Insights", x: 440, y: 460, mastery: 50, connections: [], conceptsCompleted: 1, problemsSolved: 1, problemsCorrect: 1, xpEarned: 40, accuracy: 100 },
];

function getMasteryColor(mastery: number): string {
  if (mastery >= 80) return "#00ff88";
  if (mastery >= 60) return "#00d4ff";
  if (mastery >= 40) return "#feca57";
  if (mastery >= 20) return "#8b5cf6";
  return "#ff6b6b";
}

function getMasteryGlow(mastery: number): string {
  const color = getMasteryColor(mastery);
  return `0 0 20px ${color}50, 0 0 40px ${color}20`;
}

interface KnowledgeGraphProps {
  userId: string;
  onNodeClick?: (node: Node) => void;
}

export function KnowledgeGraph({ userId, onNodeClick }: KnowledgeGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [nodes, setNodes] = useState<Node[]>(sampleNodes);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/graph?userId=${encodeURIComponent(userId || "anonymous")}`);
        if (!res.ok) throw new Error("Failed to load graph");
        const data = await res.json();
        if (data.nodes && Array.isArray(data.nodes) && data.nodes.length > 0) {
          setNodes(data.nodes);
        } else {
          setNodes(sampleNodes);
        }
      } catch (err) {
        console.error("Graph load error", err);
        setError("Could not load your graph. Showing a sample view.");
        setNodes(sampleNodes);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [userId]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      mouseX.set((e.clientX - rect.left - rect.width / 2) * 0.02);
      mouseY.set((e.clientY - rect.top - rect.height / 2) * 0.02);
    }
  }, [mouseX, mouseY]);

  const handleNodeClick = (node: Node) => {
    setSelectedNode(node.id);
    onNodeClick?.(node);
  };

  if (loading) {
    return (
      <div className="relative w-full h-[600px] rounded-2xl glass overflow-hidden flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading your knowledge graph…</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[600px] rounded-2xl glass overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {error && (
        <div className="absolute top-3 right-3 text-xs text-yellow-400 bg-yellow-400/10 px-3 py-1.5 rounded-lg border border-yellow-400/20">
          {error}
        </div>
      )}
      <div className="absolute inset-0 bg-grid-pattern opacity-30" />
      <div className="absolute inset-0 bg-radial-gradient" />
      
      <motion.svg
        className="absolute inset-0 w-full h-full"
        style={{ x: springX, y: springY }}
      >
        {nodes.map((node) =>
          node.connections.map((targetId) => {
            const target = nodes.find((n) => n.id === targetId);
            if (!target || parseInt(node.id) > parseInt(targetId)) return null;
            
            const isHighlighted = hoveredNode === node.id || hoveredNode === targetId;
            
            return (
              <motion.line
                key={`${node.id}-${targetId}`}
                x1={node.x}
                y1={node.y}
                x2={target.x}
                y2={target.y}
                stroke={isHighlighted ? "#00d4ff" : "rgba(255, 255, 255, 0.1)"}
                strokeWidth={isHighlighted ? 2 : 1}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            );
          })
        )}
      </motion.svg>
      
      <motion.div
        className="absolute inset-0"
        style={{ x: springX, y: springY }}
      >
        {nodes.map((node, index) => (
          <motion.div
            key={node.id}
            className="absolute cursor-pointer"
            style={{
              left: node.x - 50,
              top: node.y - 25,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            onMouseEnter={() => setHoveredNode(node.id)}
            onMouseLeave={() => setHoveredNode(null)}
            onClick={() => handleNodeClick(node)}
          >
            <motion.div
              className={`relative px-4 py-2 rounded-xl text-center transition-all duration-300 ${
                selectedNode === node.id ? "ring-2 ring-cyan-400" : ""
              }`}
              style={{
                background: `linear-gradient(135deg, ${getMasteryColor(node.mastery)}20, ${getMasteryColor(node.mastery)}10)`,
                boxShadow: hoveredNode === node.id ? getMasteryGlow(node.mastery) : "none",
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <span
                className="text-sm font-medium whitespace-nowrap"
                style={{ color: getMasteryColor(node.mastery) }}
              >
                {node.label}
              </span>
              <div className="mt-1 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <span style={{ color: getMasteryColor(node.mastery) }}>
                  {node.mastery}% mastery
                </span>
                <span>•</span>
                <span>{node.conceptsCompleted} concepts</span>
                <span>•</span>
                <span>{node.problemsCorrect}/{node.problemsSolved} correct</span>
              </div>
              <div className="mt-1 h-1 w-full bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: getMasteryColor(node.mastery) }}
                  initial={{ width: 0 }}
                  animate={{ width: `${node.mastery}%` }}
                  transition={{ delay: 1 + index * 0.1, duration: 0.8 }}
                />
              </div>
            </motion.div>
            
            {hoveredNode === node.id && (
              <motion.div
                className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-3 py-2 rounded-lg glass text-xs whitespace-nowrap z-10"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex flex-col gap-1 text-left">
                  <div>
                    <span className="text-muted-foreground">Mastery: </span>
                    <span style={{ color: getMasteryColor(node.mastery) }}>{node.mastery}%</span>
                  </div>
                  <div className="text-muted-foreground">Concepts: {node.conceptsCompleted}</div>
                  <div className="text-muted-foreground">Problems: {node.problemsCorrect}/{node.problemsSolved} ({node.accuracy}%)</div>
                  <div className="text-muted-foreground">XP: {node.xpEarned}</div>
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </motion.div>
      
      <div className="absolute bottom-4 left-4 flex items-center gap-4 px-4 py-2 rounded-xl glass">
        <span className="text-xs text-muted-foreground">Mastery Level:</span>
        {[
          { color: "#ff6b6b", label: "Beginner" },
          { color: "#feca57", label: "Learning" },
          { color: "#00d4ff", label: "Proficient" },
          { color: "#00ff88", label: "Mastered" },
        ].map((level) => (
          <div key={level.label} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ background: level.color }} />
            <span className="text-xs" style={{ color: level.color }}>{level.label}</span>
          </div>
        ))}
      </div>

      {selectedNode && (
        <div className="absolute bottom-4 right-4 w-64 glass rounded-2xl p-4 border border-white/10">
          {(() => {
            const node = nodes.find((n) => n.id === selectedNode);
            if (!node) return null;
            return (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-semibold" style={{ color: getMasteryColor(node.mastery) }}>
                    {node.label}
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full" style={{ background: `${getMasteryColor(node.mastery)}20`, color: getMasteryColor(node.mastery) }}>
                    {node.mastery}%
                  </span>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>Concepts completed: {node.conceptsCompleted}</div>
                  <div>Problems: {node.problemsCorrect}/{node.problemsSolved} ({node.accuracy}%)</div>
                  <div>XP earned: {node.xpEarned}</div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

export function MiniKnowledgeGraph() {
  return (
    <div className="relative w-full h-48 rounded-xl glass overflow-hidden">
      <svg className="absolute inset-0 w-full h-full">
        <line x1="60" y1="60" x2="120" y2="100" stroke="rgba(0, 212, 255, 0.3)" strokeWidth="1" />
        <line x1="60" y1="60" x2="100" y2="40" stroke="rgba(0, 212, 255, 0.3)" strokeWidth="1" />
        <line x1="120" y1="100" x2="180" y2="80" stroke="rgba(139, 92, 246, 0.3)" strokeWidth="1" />
        <line x1="180" y1="80" x2="220" y2="120" stroke="rgba(0, 255, 136, 0.3)" strokeWidth="1" />
        
        <circle cx="60" cy="60" r="8" fill="rgba(0, 212, 255, 0.5)" />
        <circle cx="100" cy="40" r="6" fill="rgba(139, 92, 246, 0.5)" />
        <circle cx="120" cy="100" r="10" fill="rgba(0, 255, 136, 0.5)" />
        <circle cx="180" cy="80" r="7" fill="rgba(254, 202, 87, 0.5)" />
        <circle cx="220" cy="120" r="5" fill="rgba(255, 107, 107, 0.5)" />
      </svg>
      <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
        Knowledge Graph Preview
      </div>
    </div>
  );
}
