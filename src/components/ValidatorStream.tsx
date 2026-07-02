import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useValidation, useSelectedProposal } from "@/store/selectors";
import { useClaoStore } from "@/store/useClaoStore";
import type { ReasoningKind, ValidationPhase, Stance } from "@/types";

const mono = "'IBM Plex Mono', monospace";
const sans = "'Space Grotesk', sans-serif";

const PHASE_META: Record<ValidationPhase, { label: string; color: string }> = {
  idle:      { label: "STANDBY",                   color: "#3D3A36" },
  ingesting: { label: "INGESTING CONTEXT",          color: "#3B82F6" },
  reasoning: { label: "AI VALIDATORS REASONING",    color: "#8B5CF6" },
  precedent: { label: "CHECKING PRECEDENTS",        color: "#F59E0B" },
  consensus: { label: "REACHING CONSENSUS",         color: "#10B981" },
  complete:  { label: "VALIDATION COMPLETE",        color: "#10B981" },
  disputed:  { label: "SUBJECTIVE DISPUTE OPEN",    color: "#EF4444" },
};

const KIND_COLOR: Record<ReasoningKind, string> = {
  info:      "#6B6560",
  for:       "#10B981",
  against:   "#EF4444",
  precedent: "#3B82F6",
  verdict:   "#8B5CF6",
};

const STANCE_ICON: Record<Stance, string> = { for: "↑", against: "↓", pending: "·" };
const STANCE_COLOR: Record<Stance, string> = { for: "#10B981", against: "#EF4444", pending: "#3D3A36" };

export function ValidatorStream() {
  const validation     = useValidation();
  const proposal       = useSelectedProposal();
  const runValidation  = useClaoStore((s) => s.runValidation);
  const logEndRef      = useRef<HTMLDivElement>(null);

  const phase  = PHASE_META[validation.phase];
  const active = validation.active;

  // Auto-scroll log to bottom
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [validation.log.length]);

  const canRun =
    !active &&
    !!proposal &&
    (proposal.status === "Draft" || proposal.status === "GenLayer_Validation");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Phase header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <motion.span
            animate={{ opacity: active ? [0.3, 1, 0.3] : 0.3 }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            style={{ width: 6, height: 6, borderRadius: "50%", background: phase.color, display: "inline-block" }}
          />
          <span style={{ font: `600 9px ${mono}`, color: "#6B6560", letterSpacing: 2 }}>
            GENLAYER VALIDATORS
          </span>
        </div>
        <motion.div
          animate={{ color: phase.color, borderColor: `${phase.color}40`, background: `${phase.color}0f` }}
          transition={{ duration: 0.3 }}
          style={{ font: `600 7px ${mono}`, padding: "2px 8px", borderRadius: 20, border: "1px solid", letterSpacing: 1 }}
        >
          {phase.label}
        </motion.div>
      </div>

      {/* Validator nodes */}
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {validation.nodes.map((node, i) => (
          <motion.div
            key={node.id}
            initial={false}
            animate={{ opacity: active ? 1 : 0.38 }}
            transition={{ delay: i * 0.04, duration: 0.25 }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 10px",
              background: "#0D0D0F",
              border: "1px solid rgba(255,255,255,.04)",
              borderRadius: 5,
            }}
          >
            <motion.span
              animate={{ color: STANCE_COLOR[node.stance] }}
              transition={{ duration: 0.3 }}
              style={{ font: `700 11px ${mono}`, width: 10, textAlign: "center", flexShrink: 0 }}
            >
              {STANCE_ICON[node.stance]}
            </motion.span>
            <span style={{ font: `500 10px ${sans}`, color: "#B8B0A2", flex: 1 }}>
              {node.label}
            </span>
            {/* Confidence bar */}
            <div style={{ width: 44, height: 3, background: "#1A1A1E", borderRadius: 2, overflow: "hidden" }}>
              <motion.div
                animate={{ width: `${node.confidence}%` }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                style={{
                  height: "100%",
                  borderRadius: 2,
                  background: node.confidence > 0 ? STANCE_COLOR[node.stance] : "#252528",
                }}
              />
            </div>
            <span style={{ font: `400 8px ${mono}`, color: "#3D3A36", width: 26, textAlign: "right" }}>
              {node.confidence > 0 ? `${node.confidence}%` : "—"}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Consensus bar */}
      <div style={{
        background: "#0D0D0F",
        border: "1px solid rgba(255,255,255,.05)",
        borderRadius: 5,
        padding: "9px 12px",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ font: `600 8px ${mono}`, color: "#6B6560", letterSpacing: 1 }}>
            SUBJECTIVE CONSENSUS
          </span>
          <motion.span
            animate={{ color: validation.agreement >= 67 ? "#10B981" : "#F59E0B" }}
            transition={{ duration: 0.4 }}
            style={{ font: `600 10px ${mono}` }}
          >
            {validation.agreement}%
          </motion.span>
        </div>
        <div style={{ height: 3, background: "#1A1A1E", borderRadius: 2, overflow: "hidden" }}>
          <motion.div
            animate={{ width: `${validation.agreement}%` }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            style={{
              height: "100%",
              borderRadius: 2,
              background: validation.agreement >= 67
                ? "linear-gradient(90deg,#059669,#10B981)"
                : "linear-gradient(90deg,#92400E,#F59E0B)",
            }}
          />
        </div>
        <div style={{ font: `400 8px ${mono}`, color: "#3D3A36", marginTop: 5 }}>
          {validation.agreement >= 67
            ? "Consensus threshold met"
            : `${67 - validation.agreement}% needed for consensus`}
        </div>
      </div>

      {/* Reasoning log */}
      <div style={{
        background: "#080809",
        border: "1px solid rgba(255,255,255,.04)",
        borderRadius: 5,
        overflow: "hidden",
      }}>
        <div style={{
          padding: "6px 12px",
          borderBottom: "1px solid rgba(255,255,255,.04)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <span style={{ font: `600 8px ${mono}`, color: "#3D3A36", letterSpacing: 1 }}>
            REASONING LOG
          </span>
          <span style={{ font: `400 8px ${mono}`, color: "#3D3A36" }}>
            {validation.log.length} entries
          </span>
        </div>
        <div style={{
          padding: "8px 12px",
          minHeight: 96,
          maxHeight: 200,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 5,
        }}>
          {validation.log.length === 0 ? (
            <span style={{ font: `400 10px ${mono}`, color: "#3D3A36", alignSelf: "center", marginTop: 24 }}>
              {active ? "Waiting for validators…" : "Idle · no active validation"}
            </span>
          ) : (
            <AnimatePresence initial={false}>
              {validation.log.map((line) => (
                <motion.div
                  key={line.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ display: "flex", gap: 8, alignItems: "flex-start" }}
                >
                  <span style={{
                    font: `700 7px ${mono}`,
                    color: KIND_COLOR[line.kind],
                    marginTop: 3,
                    flexShrink: 0,
                    letterSpacing: 0.5,
                    width: 28,
                  }}>
                    {line.kind.toUpperCase().slice(0, 4)}
                  </span>
                  <span style={{
                    font: `400 10px/1.5 ${mono}`,
                    color: line.kind === "info" ? "#6B6560" : "#B8B0A2",
                  }}>
                    {line.text}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
          <div ref={logEndRef} />
        </div>
      </div>

      {/* CTA */}
      {canRun && (
        <motion.button
          whileHover={{ scale: 1.02, background: "rgba(139,92,246,.14)" }}
          whileTap={{ scale: 0.97 }}
          onClick={() => void runValidation(proposal!.id)}
          style={{
            font: `600 9px ${mono}`,
            color: "#8B5CF6",
            padding: "10px 0",
            background: "rgba(139,92,246,.08)",
            border: "1px solid rgba(139,92,246,.18)",
            borderRadius: 5,
            cursor: "pointer",
            letterSpacing: 1.5,
          }}
        >
          ACTIVATE GENLAYER VALIDATORS →
        </motion.button>
      )}
    </div>
  );
}
