import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useClaoStore } from "@/store/useClaoStore";
import { useViewStore } from "@/store/useViewStore";

const mono = "'IBM Plex Mono', monospace";
const sans = "'Space Grotesk', sans-serif";

const INPUT_STYLE: React.CSSProperties = {
  width: "100%",
  background: "#0D0D0F",
  border: "1px solid rgba(255,255,255,.08)",
  borderRadius: 6,
  padding: "10px 12px",
  font: `400 13px ${sans}`,
  color: "#F5F0E8",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color .15s",
};

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ font: `600 9px ${mono}`, color: "#6B6560", letterSpacing: 1 }}>{label}</span>
        {hint && <span style={{ font: `400 9px ${mono}`, color: "#3D3A36" }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

export function SubmitProposalModal() {
  const open            = useViewStore((s) => s.showNewProposal);
  const closeModal      = useViewStore((s) => s.closeNewProposal);
  const go              = useViewStore((s) => s.go);
  const submitProposal  = useClaoStore((s) => s.submitProposal);

  const [title,       setTitle]       = useState("");
  const [amount,      setAmount]      = useState("");
  const [description, setDescription] = useState("");
  const [submitting,  setSubmitting]  = useState(false);
  const [error,       setError]       = useState("");
  const titleRef = useRef<HTMLInputElement>(null);

  const canSubmit = title.trim().length >= 3 && amount.trim().length >= 1;

  // Focus title on open
  useEffect(() => {
    if (open) {
      setTitle(""); setAmount(""); setDescription(""); setError("");
      setTimeout(() => titleRef.current?.focus(), 60);
    }
  }, [open]);

  // Esc to close
  useEffect(() => {
    const down = (e: KeyboardEvent) => { if (e.key === "Escape") closeModal(); };
    window.addEventListener("keydown", down);
    return () => window.removeEventListener("keydown", down);
  }, [closeModal]);

  async function handleSubmit() {
    if (!canSubmit || submitting) return;
    const fullTitle = description.trim()
      ? `${title.trim()} — ${description.trim()}`
      : title.trim();
    setSubmitting(true);
    setError("");
    try {
      await submitProposal(fullTitle, amount.trim(), "");
      closeModal();
      go("proposals");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submission failed");
      setSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="proposal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={closeModal}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9980,
            background: "rgba(0,0,0,.6)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <motion.div
            key="proposal-panel"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 460, damping: 34 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 520,
              background: "#111113",
              border: "1px solid rgba(255,255,255,.1)",
              borderRadius: 12,
              overflow: "hidden",
              boxShadow: "0 40px 120px rgba(0,0,0,.8), 0 0 0 1px rgba(255,255,255,.04)",
            }}
          >
            {/* Header */}
            <div style={{
              padding: "18px 20px 16px",
              borderBottom: "1px solid rgba(255,255,255,.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                  <motion.span
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{ width: 6, height: 6, borderRadius: "50%", background: "#8B5CF6", display: "inline-block" }}
                  />
                  <span style={{ font: `600 9px ${mono}`, color: "#8B5CF6", letterSpacing: 2 }}>NEW PROPOSAL</span>
                </div>
                <h2 style={{ font: `500 16px ${sans}`, color: "#F5F0E8", margin: 0, letterSpacing: -0.3 }}>
                  Submit to Cognitive Pipeline
                </h2>
              </div>
              <button
                onClick={closeModal}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,.06)",
                  borderRadius: 6,
                  color: "#6B6560",
                  font: `400 11px ${mono}`,
                  padding: "4px 9px",
                  cursor: "pointer",
                }}
              >
                Esc
              </button>
            </div>

            {/* Form */}
            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
              <Field label="PROPOSAL TITLE" hint="min. 3 characters">
                <input
                  ref={titleRef}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && canSubmit) void handleSubmit(); }}
                  placeholder="e.g. Protocol treasury reallocation Q3"
                  style={INPUT_STYLE}
                />
              </Field>

              <Field label="REQUESTED AMOUNT" hint="e.g. $50,000 or 25 ETH">
                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && canSubmit) void handleSubmit(); }}
                  placeholder="$0.00"
                  style={INPUT_STYLE}
                />
              </Field>

              <Field label="CONTEXT" hint="optional">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide rationale, links, or additional context…"
                  rows={3}
                  style={{ ...INPUT_STYLE, resize: "vertical", minHeight: 72, lineHeight: 1.5 }}
                />
              </Field>

              {error && (
                <div style={{ font: `400 11px ${sans}`, color: "#EF4444", background: "rgba(239,68,68,.05)", border: "1px solid rgba(239,68,68,.15)", borderRadius: 5, padding: "8px 12px" }}>
                  {error}
                </div>
              )}

              {/* What happens next */}
              <div style={{ background: "rgba(139,92,246,.04)", border: "1px solid rgba(139,92,246,.08)", borderRadius: 6, padding: "10px 12px" }}>
                <div style={{ font: `600 8px ${mono}`, color: "#8B5CF6", letterSpacing: 1, marginBottom: 6 }}>WHAT HAPPENS NEXT</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {[
                    "Proposal enters the cognitive pipeline",
                    "GenLayer AI validators reason over risk & impact",
                    "Subjective consensus determines approval",
                  ].map((step, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <span style={{ font: `500 9px ${mono}`, color: "#8B5CF6", marginTop: 1, flexShrink: 0 }}>0{i + 1}</span>
                      <span style={{ font: `400 11px ${sans}`, color: "#B8B0A2" }}>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{
              padding: "14px 20px",
              borderTop: "1px solid rgba(255,255,255,.06)",
              display: "flex",
              gap: 10,
              justifyContent: "flex-end",
            }}>
              <button
                onClick={closeModal}
                style={{
                  font: `500 11px ${mono}`,
                  color: "#6B6560",
                  padding: "9px 18px",
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,.07)",
                  borderRadius: 6,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <motion.button
                whileHover={canSubmit && !submitting ? { scale: 1.02, background: "rgba(139,92,246,.18)" } : {}}
                whileTap={canSubmit && !submitting ? { scale: 0.97 } : {}}
                onClick={() => void handleSubmit()}
                style={{
                  font: `600 11px ${mono}`,
                  color: canSubmit ? "#C4B5FD" : "#3D3A36",
                  padding: "9px 22px",
                  background: canSubmit ? "rgba(139,92,246,.12)" : "rgba(255,255,255,.03)",
                  border: `1px solid ${canSubmit ? "rgba(139,92,246,.25)" : "rgba(255,255,255,.05)"}`,
                  borderRadius: 6,
                  cursor: canSubmit ? "pointer" : "default",
                  letterSpacing: 0.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  transition: "color .15s, background .15s, border-color .15s",
                }}
              >
                {submitting && (
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", border: "1.5px solid #8B5CF6", borderTopColor: "transparent" }}
                  />
                )}
                {submitting ? "SUBMITTING…" : "SUBMIT PROPOSAL →"}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
