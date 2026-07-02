import { motion, AnimatePresence } from "framer-motion";
import { useToastStore } from "@/store/useToastStore";
import type { ToastKind } from "@/store/useToastStore";

const KIND: Record<ToastKind, { dot: string; title: string; border: string; bg: string }> = {
  info:    { dot: "#B8B0A2", title: "#F5F0E8", border: "rgba(255,255,255,.1)",   bg: "#111113" },
  success: { dot: "#10B981", title: "#6EE7B7", border: "rgba(16,185,129,.25)",  bg: "rgba(16,185,129,.04)" },
  warning: { dot: "#F59E0B", title: "#FCD34D", border: "rgba(245,158,11,.25)",  bg: "rgba(245,158,11,.04)" },
  error:   { dot: "#EF4444", title: "#FCA5A5", border: "rgba(239,68,68,.25)",   bg: "rgba(239,68,68,.04)" },
  tx:      { dot: "#8B5CF6", title: "#C4B5FD", border: "rgba(139,92,246,.25)",  bg: "rgba(139,92,246,.05)" },
};

const mono = "'IBM Plex Mono', monospace";
const sans = "'Space Grotesk', sans-serif";

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        pointerEvents: "none",
      }}
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => {
          const s = KIND[t.kind];
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, x: 48, scale: 0.94 }}
              animate={{ opacity: 1, x: 0,  scale: 1    }}
              exit={{    opacity: 0, x: 48, scale: 0.94 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              onClick={() => removeToast(t.id)}
              style={{
                pointerEvents: "all",
                cursor: "pointer",
                background: s.bg,
                border: `1px solid ${s.border}`,
                borderRadius: 8,
                padding: "11px 14px",
                minWidth: 280,
                maxWidth: 380,
                display: "flex",
                gap: 10,
                alignItems: "flex-start",
                backdropFilter: "blur(8px)",
              }}
            >
              <motion.span
                animate={t.kind === "tx" ? { opacity: [0.3, 1, 0.3] } : {}}
                transition={{ duration: 1.4, repeat: Infinity }}
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: s.dot,
                  marginTop: 3,
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ font: `600 12px ${sans}`, color: s.title, lineHeight: 1.3 }}>
                  {t.title}
                </div>
                {t.body && (
                  <div style={{ font: `400 11px ${sans}`, color: "#6B6560", marginTop: 3, lineHeight: 1.4 }}>
                    {t.body}
                  </div>
                )}
              </div>
              <span style={{ font: `400 9px ${mono}`, color: "#3D3A36", flexShrink: 0, marginTop: 2 }}>
                ✕
              </span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
