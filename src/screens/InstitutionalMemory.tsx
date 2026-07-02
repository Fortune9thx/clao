import { useMemory } from "@/store/selectors";
import type { MemoryEvent } from "@/types";

const mono = "'IBM Plex Mono', monospace";
const sans = "'Space Grotesk', sans-serif";

// Fixed layout positions for up to 7 nodes — these create the organic graph feel.
// New events beyond the seeded 5 stack in the bottom-right overflow area.
const POSITIONS = [
  { left: "44%", top: "36%" }, // center-selected
  { left: "24%", top: "18%" }, // top-left
  { left: "64%", top: "26%" }, // top-right
  { left: "58%", top: "56%" }, // right
  { left: "16%", top: "53%" }, // left
  { left: "31%", top: "72%" }, // bottom-left
  { left: "74%", top: "66%" }, // bottom-right
];

function verdictToStatus(m: MemoryEvent): { status: string; statusColor: string; borderColor: string } {
  if (m.type === "dispute") return { status: "DISPUTED", statusColor: "#F59E0B", borderColor: "rgba(245,158,11,.2)" };
  if (m.verdict === "Approved") return { status: "PASSED", statusColor: "#10B981", borderColor: "rgba(16,185,129,.2)" };
  if (m.verdict === "Rejected") return { status: "REJECTED", statusColor: "#EF4444", borderColor: "rgba(239,68,68,.2)" };
  if (m.verdict === "Escalated") return { status: "ESCALATED", statusColor: "#F59E0B", borderColor: "rgba(245,158,11,.2)" };
  if (m.type === "precedent") return { status: "PRECEDENT", statusColor: "#3B82F6", borderColor: "rgba(59,130,246,.2)" };
  return { status: "PENDING", statusColor: "#8B5CF6", borderColor: "rgba(139,92,246,.3)" };
}

interface EdgeDef { x1: string; y1: string; x2: string; y2: string; stroke: string; dash: string; animated?: boolean }

const LEGEND = [
  { color: "#10B981", label: "Passed" },
  { color: "#EF4444", label: "Rejected" },
  { color: "#F59E0B", label: "Disputed" },
  { color: "#8B5CF6", label: "Pending" },
];

export function InstitutionalMemory() {
  const memory = useMemory();

  if (memory.length === 0) {
    return (
      <div className="screen-fade" style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(139,92,246,.4)" strokeWidth="1.5">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" />
        </svg>
        <div style={{ font: `500 13px ${sans}`, color: "#F5F0E8" }}>No governance history yet</div>
        <div style={{ font: `400 11px ${sans}`, color: "#6B6560", textAlign: "center", maxWidth: 260 }}>
          Memory nodes appear here after proposals are validated or decisions are recorded on-chain.
        </div>
      </div>
    );
  }

  const sorted = [...memory].sort((a, b) => a.timestamp - b.timestamp);

  // Build nodes: most recent event is "selected" (center node)
  const newestId = sorted[sorted.length - 1]?.id;
  const nodes = sorted.slice(0, 7).map((m, i) => {
    const { status, statusColor, borderColor } = verdictToStatus(m);
    const selected = m.id === newestId;
    return {
      id: m.proposalId ?? m.id,
      status,
      statusColor,
      borderColor: selected ? "rgba(139,92,246,.4)" : borderColor,
      title: m.title,
      pos: POSITIONS[i],
      selected,
      sub: m.relatedIds.length > 0 ? `${m.relatedIds.length} related` : undefined,
    };
  });

  // Build edges from relatedIds
  const edges: EdgeDef[] = [];
  sorted.slice(0, 7).forEach((m, fromIdx) => {
    m.relatedIds.forEach((relId) => {
      const toIdx = sorted.findIndex((n) => n.id === relId);
      if (toIdx < 0 || toIdx >= 7) return;
      const from = POSITIONS[fromIdx];
      const to = POSITIONS[toIdx];
      const isActive = m.id === newestId || sorted[toIdx]?.id === newestId;
      edges.push({
        x1: from.left, y1: from.top,
        x2: to.left,   y2: to.top,
        stroke: isActive ? "rgba(139,92,246,.25)" : "rgba(255,255,255,.08)",
        dash: isActive ? "5 7" : "3 8",
        animated: isActive,
      });
    });
  });

  return (
    <div
      className="screen-fade"
      style={{ height: "100%", position: "relative", overflow: "hidden", background: "radial-gradient(ellipse at 50% 50%,rgba(139,92,246,.02),transparent 70%)" }}
    >
      {/* Edge lines */}
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} preserveAspectRatio="none">
        {edges.map((e, i) => (
          <line
            key={i}
            x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
            stroke={e.stroke}
            strokeWidth={e.animated ? 1.5 : 1}
            strokeDasharray={e.dash}
            style={e.animated ? { animation: "edgeFlow 2.4s linear infinite" } : undefined}
          />
        ))}
      </svg>

      {/* Nodes */}
      {nodes.map((n) => (
        <div
          key={n.id}
          style={{
            position: "absolute",
            left: n.pos.left,
            top: n.pos.top,
            transform: "translate(-50%, -50%)",
            background: "#1A1A1E",
            border: n.selected ? `2px solid ${n.borderColor}` : `1px solid ${n.borderColor}`,
            borderRadius: n.selected ? 7 : 6,
            padding: n.selected ? "11px 14px" : "8px 11px",
            boxShadow: n.selected ? "0 0 16px rgba(139,92,246,.08)" : undefined,
            cursor: "pointer",
            zIndex: 1,
            maxWidth: 180,
          }}
        >
          <div style={{ font: `600 ${n.selected ? 8 : 7}px ${mono}`, color: n.statusColor, letterSpacing: n.selected ? 1 : 0.5, whiteSpace: "nowrap" }}>
            {n.id} · {n.status}
          </div>
          <div style={{ font: `500 ${n.selected ? 12 : 10}px ${sans}`, color: n.selected ? "#F5F0E8" : "#B8B0A2", marginTop: 2 }}>
            {n.title}
          </div>
          {n.sub && <div style={{ font: `400 9px ${mono}`, color: "#6B6560", marginTop: 2 }}>{n.sub}</div>}
        </div>
      ))}

      {/* Legend */}
      <div style={{ position: "absolute", bottom: 16, left: 16, display: "flex", gap: 12, padding: "7px 12px", background: "rgba(13,13,15,.85)", border: "1px solid rgba(255,255,255,.06)", borderRadius: 5, zIndex: 2 }}>
        {LEGEND.map((l) => (
          <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 3 }}>
            <span style={{ width: 5, height: 5, borderRadius: 2, background: l.color }} />
            <span style={{ font: `400 8px ${mono}`, color: "#6B6560" }}>{l.label}</span>
          </div>
        ))}
      </div>

      {/* Event count */}
      <div style={{ position: "absolute", bottom: 16, right: 16, font: `400 9px ${mono}`, color: "#3D3A36" }}>
        {memory.length} events · showing {Math.min(memory.length, 7)}
      </div>
    </div>
  );
}
