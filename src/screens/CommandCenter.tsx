import { useEffect, useRef, useState } from "react";
import { useViewStore, type ScreenId } from "@/store/useViewStore";
import { useClaoStore } from "@/store/useClaoStore";
import { useTreasury, useReputation, useMemory } from "@/store/selectors";
import { ClaoOrb } from "@/components/ClaoOrb";
import { usd, relativeTime } from "@/lib/utils/format";
import type { MemoryEventType } from "@/types";

function useCountUp(target: number, duration = 900): number {
  const [value, setValue] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    const start = prev.current;
    const startTime = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const cur = Math.round(start + (target - start) * eased);
      setValue(cur);
      if (t < 1) requestAnimationFrame(tick);
      else prev.current = target;
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return value;
}

const mono = "'IBM Plex Mono', monospace";
const sans = "'Space Grotesk', sans-serif";

function Skel({ w = 80, h = 14 }: { w?: number | string; h?: number }) {
  return <span className="skel" style={{ width: w, height: h, verticalAlign: "middle" }} />;
}

function StatCard({
  label,
  value,
  note,
  noteColor,
  goTo,
  loading,
}: {
  label: string;
  value: React.ReactNode;
  note: string;
  noteColor: string;
  goTo?: ScreenId;
  loading?: boolean;
}) {
  const go = useViewStore((s) => s.go);
  return (
    <div
      onClick={goTo ? () => go(goTo) : undefined}
      className={goTo ? "hov-border cursor-pointer" : undefined}
      style={{
        background: "#131315",
        border: "1px solid rgba(255,255,255,.06)",
        borderRadius: 7,
        padding: 16,
        transition: "border-color .15s",
      }}
    >
      <div style={{ font: `600 8px ${mono}`, color: "#6B6560", letterSpacing: 1, marginBottom: 5 }}>{label}</div>
      <div style={{ font: `300 24px/1 ${mono}`, color: "#F5F0E8" }}>
        {loading ? <Skel w={60} h={22} /> : value}
      </div>
      <div style={{ font: `500 9px ${mono}`, color: noteColor, marginTop: 4 }}>{note}</div>
    </div>
  );
}

const DOT_COLOR: Record<MemoryEventType, string> = {
  dispute: "#EF4444",
  ruling: "#10B981",
  proposal: "#8B5CF6",
  precedent: "#3B82F6",
};

const RISK_COLOR = (level: string) =>
  level === "HIGH" ? "#EF4444" : level === "MED" ? "#F59E0B" : "#10B981";

export function CommandCenter() {
  const go = useViewStore((s) => s.go);
  const hydrating = useClaoStore((s) => s.hydrating);
  const clao = useClaoStore((s) => s.clao);
  const proposals = useClaoStore((s) => s.proposals);
  const dispute = useClaoStore((s) => s.dispute);
  const treasury = useTreasury();
  const reputation = useReputation();
  const memory = useMemory();
  const selectProposal = useClaoStore((s) => s.selectProposal);

  const activeProposals = proposals.filter(
    (p) => p.status !== "Treasury_Released" && p.status !== "Rejected",
  );

  const avgConsensus =
    activeProposals.length > 0
      ? Math.round(
          activeProposals.reduce((s, p) => s + p.validator_consensus.current_agreement, 0) /
            activeProposals.length,
        )
      : 0;

  const disputeCount = dispute.open ? 1 : 0;

  const animActiveCount  = useCountUp(activeProposals.length);
  const animConsensus    = useCountUp(avgConsensus);
  const animReputation   = useCountUp(reputation.composite);
  const animDisputes     = useCountUp(disputeCount);

  const proposalRows = activeProposals.slice(0, 4).map((p) => ({
    id: p.id,
    title: p.title,
    meta: `${p.id} · ${p.requested_amount} · ${p.validator_consensus.current_agreement}%`,
    pct: p.validator_consensus.current_agreement,
    barColor:
      p.validator_consensus.current_agreement >= 80
        ? "#10B981"
        : p.validator_consensus.current_agreement >= 60
          ? "#F59E0B"
          : "#EF4444",
    tag:
      p.status === "Disputed"
        ? { text: "DISPUTE", color: "#F59E0B" }
        : p.cognitive_metrics.risk_score > 50
          ? { text: "RISK", color: "#F59E0B" }
          : p.status === "GenLayer_Validation"
            ? { text: "VALIDATING", color: "#8B5CF6" }
            : undefined,
  }));

  const insights = [...memory]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 4)
    .map((m, i) => ({
      dot: m.type === "ruling" && m.verdict === "Rejected" ? "#F59E0B" : DOT_COLOR[m.type],
      text: m.summary,
      textColor: i === 0 ? "#C4B5FD" : "#F5F0E8",
      when: relativeTime(m.timestamp),
      pulse: i === 0,
    }));

  const highRiskProposal = activeProposals.some((p) => p.cognitive_metrics.risk_score > 50);
  const riskCells = [
    { level: treasury.reserveRatio > 60 ? "LOW" : treasury.reserveRatio > 40 ? "MED" : "HIGH", area: "Treasury" },
    { level: highRiskProposal ? "MED" : "LOW", area: "Proposal" },
    { level: "LOW", area: "Sybil" },
    { level: "LOW", area: "Validator" },
    { level: dispute.open ? "HIGH" : "LOW", area: "Dispute" },
  ];

  const riskSummary = riskCells.some((c) => c.level === "HIGH")
    ? "ACTION REQUIRED"
    : riskCells.some((c) => c.level === "MED")
      ? "MONITOR ACTIVE"
      : "ALL SYSTEMS NOMINAL";

  const riskSummaryColor = riskCells.some((c) => c.level === "HIGH")
    ? "#EF4444"
    : riskCells.some((c) => c.level === "MED")
      ? "#F59E0B"
      : "#10B981";

  return (
    <div className="screen-fade" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}>
        {/* Treasury */}
        <div style={{ background: "#131315", border: "1px solid rgba(255,255,255,.06)", borderRadius: 8, padding: 24 }}>
          <div style={{ font: `600 9px ${mono}`, color: "#6B6560", letterSpacing: 2, marginBottom: 8 }}>TREASURY VALUE</div>
          <div style={{ font: `300 40px/1 ${mono}`, color: "#F5F0E8", letterSpacing: -2 }}>
            {hydrating ? <Skel w={200} h={36} /> : usd(treasury.balanceValue)}
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <span style={{ font: `500 10px ${mono}`, color: "#10B981" }}>Reserve: {treasury.reserveRatio}%</span>
            <span style={{ font: `400 10px ${mono}`, color: "#6B6560" }}>Released: {usd(treasury.released)}</span>
          </div>
          <div style={{ height: 64, marginTop: 16, background: "linear-gradient(to right,rgba(16,185,129,.02),rgba(16,185,129,.04))", borderRadius: 4, position: "relative", overflow: "hidden" }}>
            <svg width="100%" height="64" viewBox="0 0 800 64" preserveAspectRatio="none" style={{ position: "absolute", bottom: 0 }}>
              <path d="M0,48 C100,44 150,32 250,28 C350,24 400,40 500,34 C600,27 700,22 800,16" fill="none" stroke="rgba(16,185,129,.25)" strokeWidth="1.5" />
              <path d="M0,48 C100,44 150,32 250,28 C350,24 400,40 500,34 C600,27 700,22 800,16 L800,64 L0,64 Z" fill="rgba(16,185,129,.04)" />
            </svg>
          </div>
          <div style={{ display: "flex", gap: 20, marginTop: 12, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,.04)" }}>
            <div>
              <div style={{ font: `400 8px ${mono}`, color: "#6B6560", letterSpacing: 1 }}>BALANCE</div>
              <div style={{ font: `500 14px ${mono}`, color: "#F5F0E8" }}>{usd(treasury.balanceValue)}</div>
            </div>
            <div>
              <div style={{ font: `400 8px ${mono}`, color: "#6B6560", letterSpacing: 1 }}>RESERVE</div>
              <div style={{ font: `500 14px ${mono}`, color: treasury.reserveRatio > 60 ? "#10B981" : "#F59E0B" }}>{treasury.reserveRatio}%</div>
            </div>
            <div>
              <div style={{ font: `400 8px ${mono}`, color: "#6B6560", letterSpacing: 1 }}>RELEASED</div>
              <div style={{ font: `500 14px ${mono}`, color: "#F5F0E8" }}>{usd(treasury.released)}</div>
            </div>
          </div>
        </div>

        {/* CLAO Intelligence */}
        <div style={{ background: "linear-gradient(160deg,rgba(139,92,246,.05),rgba(13,13,15,.9))", border: "1px solid rgba(139,92,246,.1)", borderRadius: 8, padding: 18, display: "flex", flexDirection: "column", gap: 12, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "50%", left: "50%", width: 140, height: 140, borderRadius: "50%", background: "radial-gradient(circle,rgba(139,92,246,.08),transparent)", transform: "translate(-50%,-50%)", animation: "breathe 4s ease infinite", filter: "blur(20px)" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 5, position: "relative", zIndex: 1 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#8B5CF6", animation: "pulseGlow 2s ease infinite" }} />
            <span style={{ font: `600 9px ${mono}`, color: "#8B5CF6", letterSpacing: 2 }}>CLAO INTELLIGENCE</span>
          </div>
          <div style={{ flex: 1, minHeight: 80, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 1 }}>
            <ClaoOrb size={64} />
          </div>
          <div style={{ position: "relative", zIndex: 1, font: `400 11px/1.5 ${sans}`, color: "#C4B5FD" }}>
            {clao.caption}
          </div>
          <div style={{ position: "relative", zIndex: 1, display: "flex", gap: 5 }}>
            <button
              onClick={() => go("proposals")}
              className="hov-intel"
              style={{ font: `500 9px ${mono}`, color: "#8B5CF6", padding: "4px 9px", background: "rgba(139,92,246,.07)", border: "1px solid rgba(139,92,246,.12)", borderRadius: 4, cursor: "pointer" }}
            >
              View Analysis
            </button>
            <button
              className="hov-chip-soft"
              style={{ font: `500 9px ${mono}`, color: "#6B6560", padding: "4px 9px", background: "transparent", border: "1px solid rgba(255,255,255,.06)", borderRadius: 4, cursor: "pointer" }}
            >
              Ask CLAO
            </button>
          </div>
        </div>
      </div>

      {/* KPI stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        <StatCard
          label="ACTIVE PROPOSALS"
          value={String(hydrating ? 0 : animActiveCount)}
          note={`${activeProposals.filter((p) => p.cognitive_metrics.risk_score > 40).length} need attention`}
          noteColor="#F59E0B"
          goTo="proposals"
          loading={hydrating}
        />
        <StatCard
          label="CONSENSUS"
          value={`${hydrating ? 0 : animConsensus}%`}
          note={`${proposals.length} total proposals`}
          noteColor="#10B981"
          loading={hydrating}
        />
        <StatCard
          label="GOV SCORE"
          value={String(hydrating ? 0 : animReputation)}
          note="Reputation composite"
          noteColor="#B8B0A2"
          goTo="reputation"
          loading={hydrating}
        />
        <StatCard
          label="DISPUTES"
          value={String(hydrating ? 0 : animDisputes)}
          note={dispute.open ? `${dispute.status ?? "Open"}` : "No active disputes"}
          noteColor={disputeCount > 0 ? "#EF4444" : "#10B981"}
          goTo="disputes"
          loading={hydrating}
        />
      </div>

      {/* Proposals + Insights */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 16 }}>
        <div style={{ background: "#131315", border: "1px solid rgba(255,255,255,.06)", borderRadius: 8, overflow: "hidden" }}>
          <div style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,.04)" }}>
            <span style={{ font: `600 11px ${sans}`, color: "#F5F0E8" }}>Active Proposals</span>
            <span onClick={() => go("proposals")} className="hov-text" style={{ font: `500 9px ${mono}`, color: "#B8B0A2", cursor: "pointer" }}>
              View All →
            </span>
          </div>
          {proposalRows.length === 0 ? (
            <div style={{ padding: "24px 16px", font: `400 12px ${sans}`, color: "#3D3A36", textAlign: "center" }}>
              No active proposals
            </div>
          ) : (
            proposalRows.map((row, i) => (
              <div
                key={row.id}
                onClick={() => { selectProposal(row.id); go("proposals"); }}
                className="hov-row"
                style={{ padding: "10px 16px", borderBottom: i < proposalRows.length - 1 ? "1px solid rgba(255,255,255,.03)" : undefined, display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ font: `500 11px ${sans}`, color: "#F5F0E8" }}>{row.title}</span>
                    {row.tag && (
                      <span style={{ font: `600 7px ${mono}`, color: row.tag.color, background: `${row.tag.color}14`, border: `1px solid ${row.tag.color}1a`, borderRadius: 6, padding: "1px 5px" }}>
                        {row.tag.text}
                      </span>
                    )}
                  </div>
                  <span style={{ font: `400 9px ${mono}`, color: "#6B6560" }}>{row.meta}</span>
                </div>
                <div style={{ height: 3, width: 60, background: "#1A1A1E", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ width: `${row.pct}%`, height: "100%", background: row.barColor, borderRadius: 2 }} />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Governance Insights */}
        <div style={{ background: "#131315", border: "1px solid rgba(255,255,255,.06)", borderRadius: 8, overflow: "hidden" }}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,.04)" }}>
            <span style={{ font: `600 11px ${sans}`, color: "#F5F0E8" }}>Governance Insights</span>
          </div>
          {insights.map((ins, i) => (
            <div
              key={i}
              style={{ padding: "10px 16px", borderBottom: i < insights.length - 1 ? "1px solid rgba(255,255,255,.03)" : undefined, display: "flex", gap: 7 }}
            >
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: ins.dot, marginTop: 4, flexShrink: 0, animation: ins.pulse ? "pulseGlow 2s ease infinite" : undefined }} />
              <div>
                <div style={{ font: `400 11px/1.5 ${sans}`, color: ins.textColor }}>{ins.text}</div>
                <div style={{ font: `400 8px ${mono}`, color: "#6B6560", marginTop: 2 }}>{ins.when}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Engine */}
      <div style={{ background: "#131315", border: "1px solid rgba(255,255,255,.06)", borderRadius: 8, padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={{ font: `600 11px ${sans}`, color: "#F5F0E8" }}>Risk Engine</span>
          <span style={{ font: `500 8px ${mono}`, color: riskSummaryColor, letterSpacing: 1 }}>{riskSummary}</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8 }}>
          {riskCells.map((cell) => {
            const c = RISK_COLOR(cell.level);
            return (
              <div key={cell.area} style={{ padding: 8, background: `${c}08`, border: `1px solid ${c}14`, borderRadius: 4, textAlign: "center" }}>
                <div style={{ font: `600 8px ${mono}`, color: c, letterSpacing: 1, marginBottom: 2 }}>{cell.level}</div>
                <div style={{ font: `400 9px ${sans}`, color: "#6B6560" }}>{cell.area}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
