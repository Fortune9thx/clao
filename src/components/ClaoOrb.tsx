import { motion } from "framer-motion";
import { useClaoStore } from "@/store/useClaoStore";
import type { ClaoMood } from "@/types";

interface Palette { core: string; mid: string; glow: string; ring: string }

const MOOD_PALETTE: Record<ClaoMood, Palette> = {
  idle:       { core: "#5B21B6", mid: "#7C3AED", glow: "rgba(124,58,237,.18)",  ring: "rgba(139,92,246,.25)" },
  thinking:   { core: "#4338CA", mid: "#6366F1", glow: "rgba(99,102,241,.22)",  ring: "rgba(99,102,241,.35)" },
  explaining: { core: "#6D28D9", mid: "#8B5CF6", glow: "rgba(139,92,246,.28)",  ring: "rgba(167,139,250,.4)" },
  listening:  { core: "#1D4ED8", mid: "#3B82F6", glow: "rgba(59,130,246,.22)",  ring: "rgba(59,130,246,.35)" },
  success:    { core: "#047857", mid: "#10B981", glow: "rgba(16,185,129,.22)",  ring: "rgba(16,185,129,.35)" },
  warning:    { core: "#B45309", mid: "#F59E0B", glow: "rgba(245,158,11,.22)",  ring: "rgba(245,158,11,.35)" },
  alert:      { core: "#B91C1C", mid: "#EF4444", glow: "rgba(239,68,68,.22)",   ring: "rgba(239,68,68,.35)"  },
};

export function ClaoOrb({ size = 64 }: { size?: number }) {
  const mood       = useClaoStore((s) => s.clao.mood);
  const excitement = useClaoStore((s) => s.clao.excitementLevel);
  const p = MOOD_PALETTE[mood] ?? MOOD_PALETTE.idle;

  const breathe  = 4 - (excitement / 100) * 2; // 2s–4s
  const spin     = 14 - (excitement / 100) * 8; // 6s–14s
  const coreSize = size * 0.58;

  return (
    <div style={{ width: size, height: size, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {/* Ambient glow */}
      <motion.div
        animate={{ background: p.glow }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        style={{ position: "absolute", inset: -size * 0.15, borderRadius: "50%", filter: `blur(${size * 0.22}px)` }}
      />

      {/* Outer pulse ring — remounts on mood to restart */}
      <motion.div
        key={`${mood}-r1`}
        initial={{ scale: 0.55, opacity: 0.7 }}
        animate={{ scale: 1.9,  opacity: 0   }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
        style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `1px solid ${p.ring}` }}
      />
      <motion.div
        key={`${mood}-r2`}
        initial={{ scale: 0.55, opacity: 0.4 }}
        animate={{ scale: 1.9,  opacity: 0   }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut", delay: 1.2 }}
        style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `1px solid ${p.ring}` }}
      />

      {/* Spinning dashed ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: spin, repeat: Infinity, ease: "linear" }}
        style={{ position: "absolute", inset: size * 0.1, borderRadius: "50%", border: `1px dashed ${p.ring}` }}
      />

      {/* Core orb */}
      <motion.div
        animate={{
          background: `radial-gradient(circle at 38% 36%, ${p.mid}, ${p.core} 58%, #12062A)`,
          boxShadow: `0 0 ${size * 0.28}px ${p.glow}, inset 0 1px 0 rgba(255,255,255,.12)`,
          scale: [1, 1.07, 1],
        }}
        transition={{
          background: { duration: 0.55, ease: "easeInOut" },
          boxShadow:  { duration: 0.55, ease: "easeInOut" },
          scale: { duration: breathe, repeat: Infinity, ease: "easeInOut" },
        }}
        style={{ width: coreSize, height: coreSize, borderRadius: "50%", position: "relative", zIndex: 1 }}
      />
    </div>
  );
}
