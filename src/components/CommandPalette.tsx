import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useViewStore } from "@/store/useViewStore";
import { useClaoStore } from "@/store/useClaoStore";

const mono = "'IBM Plex Mono', monospace";
const sans = "'Space Grotesk', sans-serif";

interface Item {
  id: string;
  group: string;
  icon: string;
  label: string;
  sub?: string;
  action: () => void;
}

function useItems(query: string, close: () => void): Item[] {
  const go             = useViewStore((s) => s.go);
  const proposals      = useClaoStore((s) => s.proposals);
  const selectProposal = useClaoStore((s) => s.selectProposal);

  const NAV: Item[] = [
    { id: "home",       group: "Navigate", icon: "⊞", label: "Command Center",       action: () => { go("home");       close(); } },
    { id: "proposals",  group: "Navigate", icon: "⊡", label: "Proposals",            action: () => { go("proposals");  close(); } },
    { id: "memory",     group: "Navigate", icon: "◈", label: "Institutional Memory", action: () => { go("memory");     close(); } },
    { id: "reputation", group: "Navigate", icon: "◉", label: "Reputation Engine",    action: () => { go("reputation"); close(); } },
    { id: "disputes",   group: "Navigate", icon: "△", label: "Disputes",             action: () => { go("disputes");   close(); } },
    { id: "settings",   group: "Navigate", icon: "◎", label: "Settings",             action: () => { go("settings");   close(); } },
  ];

  const PROPS: Item[] = proposals.map((p) => ({
    id:     `p-${p.id}`,
    group:  "Proposals",
    icon:   "⊡",
    label:  p.id,
    sub:    p.title,
    action: () => { selectProposal(p.id); go("proposals"); close(); },
  }));

  const all = [...NAV, ...PROPS];
  if (!query.trim()) return all;
  const q = query.toLowerCase();
  return all.filter(
    (i) =>
      i.label.toLowerCase().includes(q) ||
      i.sub?.toLowerCase().includes(q) ||
      i.group.toLowerCase().includes(q),
  );
}

export function CommandPalette() {
  const [open,      setOpen]      = useState(false);
  const [query,     setQuery]     = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef  = useRef<HTMLInputElement>(null);
  const close     = () => { setOpen(false); setQuery(""); setActiveIdx(0); };
  const items     = useItems(query, close);

  // Cmd+K / Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => { if (o) close(); else { setOpen(true); } return !o; });
      }
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", down);
    return () => window.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 40);
  }, [open]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, items.length - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, 0)); }
    if (e.key === "Enter" && items[activeIdx]) items[activeIdx].action();
  };

  // Group
  const groups: Record<string, Item[]> = {};
  items.forEach((item) => { (groups[item.group] ??= []).push(item); });

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="palette-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={close}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9990,
            background: "rgba(0,0,0,.55)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            paddingTop: 120,
          }}
        >
          <motion.div
            key="palette-panel"
            initial={{ opacity: 0, scale: 0.96, y: -16 }}
            animate={{ opacity: 1, scale: 1,    y: 0    }}
            exit={{    opacity: 0, scale: 0.96, y: -16  }}
            transition={{ type: "spring", stiffness: 480, damping: 36 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 560,
              background: "#111113",
              border: "1px solid rgba(255,255,255,.1)",
              borderRadius: 10,
              overflow: "hidden",
              boxShadow: "0 32px 96px rgba(0,0,0,.7), 0 0 0 1px rgba(255,255,255,.04)",
            }}
          >
            {/* Search row */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "14px 16px",
              borderBottom: "1px solid rgba(255,255,255,.06)",
            }}>
              <span style={{ font: `500 14px ${mono}`, color: "#3D3A36", userSelect: "none" }}>⌘</span>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => { setQuery(e.target.value); setActiveIdx(0); }}
                onKeyDown={onKey}
                placeholder="Search screens, proposals, actions…"
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  font: `400 14px ${sans}`,
                  color: "#F5F0E8",
                }}
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  style={{
                    font: `400 9px ${mono}`,
                    color: "#3D3A36",
                    background: "transparent",
                    border: "1px solid rgba(255,255,255,.06)",
                    borderRadius: 4,
                    padding: "2px 7px",
                    cursor: "pointer",
                  }}
                >
                  Clear
                </button>
              )}
            </div>

            {/* Results */}
            <div style={{ maxHeight: 360, overflowY: "auto", padding: "6px 0" }}>
              {Object.entries(groups).map(([grp, grpItems]) => (
                <div key={grp}>
                  <div style={{
                    font: `600 8px ${mono}`,
                    color: "#3D3A36",
                    letterSpacing: 2,
                    padding: "8px 16px 4px",
                  }}>
                    {grp.toUpperCase()}
                  </div>
                  {grpItems.map((item) => {
                    const gi = items.indexOf(item);
                    const isActive = gi === activeIdx;
                    return (
                      <motion.div
                        key={item.id}
                        onClick={item.action}
                        onHoverStart={() => setActiveIdx(gi)}
                        animate={{ background: isActive ? "rgba(139,92,246,.08)" : "transparent" }}
                        transition={{ duration: 0.12 }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "9px 16px",
                          cursor: "pointer",
                        }}
                      >
                        <span style={{
                          font: `400 13px ${mono}`,
                          color: isActive ? "#8B5CF6" : "#3D3A36",
                          width: 18,
                          textAlign: "center",
                          flexShrink: 0,
                        }}>
                          {item.icon}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            font: `500 13px ${sans}`,
                            color: isActive ? "#F5F0E8" : "#B8B0A2",
                          }}>
                            {item.label}
                          </div>
                          {item.sub && (
                            <div style={{
                              font: `400 10px ${mono}`,
                              color: "#3D3A36",
                              marginTop: 1,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}>
                              {item.sub}
                            </div>
                          )}
                        </div>
                        {isActive && (
                          <span style={{ font: `400 9px ${mono}`, color: "#3D3A36" }}>↵</span>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              ))}
              {items.length === 0 && (
                <div style={{
                  padding: "28px 16px",
                  font: `400 12px ${sans}`,
                  color: "#3D3A36",
                  textAlign: "center",
                }}>
                  No results for "{query}"
                </div>
              )}
            </div>

            {/* Footer hints */}
            <div style={{
              padding: "8px 16px",
              borderTop: "1px solid rgba(255,255,255,.04)",
              display: "flex",
              gap: 16,
              alignItems: "center",
            }}>
              {[["↵", "Select"], ["↑↓", "Navigate"], ["Esc", "Close"]].map(([k, l]) => (
                <div key={k} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{
                    font: `600 9px ${mono}`,
                    color: "#3D3A36",
                    background: "rgba(255,255,255,.04)",
                    border: "1px solid rgba(255,255,255,.06)",
                    borderRadius: 3,
                    padding: "1px 6px",
                  }}>
                    {k}
                  </span>
                  <span style={{ font: `400 9px ${mono}`, color: "#3D3A36" }}>{l}</span>
                </div>
              ))}
              <div style={{ marginLeft: "auto", font: `400 9px ${mono}`, color: "#3D3A36" }}>
                ⌘K
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
