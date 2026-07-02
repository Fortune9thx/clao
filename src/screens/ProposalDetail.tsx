import { useClaoStore } from "@/store/useClaoStore";
import { useSelectedProposal } from "@/store/selectors";
import { ValidatorStream } from "@/components/ValidatorStream";

const mono = "'IBM Plex Mono', monospace";
const sans = "'Space Grotesk', sans-serif";

function Skel({ w = 120, h = 14 }: { w?: number | string; h?: number }) {
  return <span className="skel" style={{ width: w, height: h, verticalAlign: "middle" }} />;
}

const STATUS_LABEL: Record<string, string> = {
  Draft: "DRAFT",
  GenLayer_Validation: "VALIDATING",
  Validated: "VALIDATED",
  Treasury_Released: "EXECUTED",
  Disputed: "DISPUTED",
  Rejected: "REJECTED",
};

const STATUS_COLOR: Record<string, string> = {
  Draft: "#6B6560",
  GenLayer_Validation: "#8B5CF6",
  Validated: "#10B981",
  Treasury_Released: "#3B82F6",
  Disputed: "#F59E0B",
  Rejected: "#EF4444",
};

export function ProposalDetail() {
  const proposal = useSelectedProposal();
  const hydrating = useClaoStore((s) => s.hydrating);
  const proposals = useClaoStore((s) => s.proposals);
  const selectProposal = useClaoStore((s) => s.selectProposal);
  const runValidation = useClaoStore((s) => s.runValidation);

  if (!proposal) {
    return (
      <div className="screen-fade" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", font: `400 13px ${sans}`, color: "#3D3A36" }}>
        No proposal selected
      </div>
    );
  }

  const vc = proposal.validator_consensus;
  const cm = proposal.cognitive_metrics;
  const forPct = vc.current_agreement;
  const againstPct = 100 - forPct;
  const statusColor = STATUS_COLOR[proposal.status] ?? "#6B6560";
  const statusLabel = STATUS_LABEL[proposal.status] ?? proposal.status;

  return (
    <div className="screen-fade" style={{ display: "grid", gridTemplateColumns: "1fr 340px", height: "100%", overflow: "hidden" }}>
      {/* Main content */}
      <div style={{ padding: 20, overflowY: "auto", display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Proposal selector tabs */}
        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }}>
          {proposals.map((p) => (
            <button
              key={p.id}
              onClick={() => selectProposal(p.id)}
              className="hov-chip"
              style={{
                font: `500 10px ${mono}`,
                color: p.id === proposal.id ? "#F5F0E8" : "#6B6560",
                padding: "4px 8px",
                background: p.id === proposal.id ? "rgba(255,255,255,.08)" : "transparent",
                border: "1px solid",
                borderColor: p.id === proposal.id ? "rgba(255,255,255,.1)" : "rgba(255,255,255,.04)",
                borderRadius: 5,
                cursor: "pointer",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              {p.id}
            </button>
          ))}
        </div>

        <h2 style={{ font: `500 22px ${sans}`, color: "#F5F0E8", letterSpacing: -0.5, margin: 0 }}>
          {hydrating ? <Skel w="80%" h={22} /> : proposal.title}
        </h2>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ font: `400 10px ${mono}`, color: "#6B6560" }}>
            By: {proposal.proposer}
          </span>
          <span style={{ font: `400 10px ${mono}`, color: "#6B6560" }}>
            Amount: {proposal.requested_amount}
          </span>
          <span style={{
            font: `600 7px ${mono}`,
            color: statusColor,
            background: `${statusColor}14`,
            border: `1px solid ${statusColor}1a`,
            borderRadius: 6,
            padding: "2px 6px",
          }}>
            {statusLabel}
          </span>
        </div>

        {/* Vote bar */}
        <div style={{ background: "#131315", border: "1px solid rgba(255,255,255,.06)", borderRadius: 6, padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ font: `600 11px ${sans}`, color: "#10B981" }}>For: {forPct}%</span>
            <span style={{ font: `600 11px ${sans}`, color: "#EF4444" }}>Against: {againstPct}%</span>
          </div>
          <div style={{ height: 6, background: "#1A1A1E", borderRadius: 3, overflow: "hidden", display: "flex", marginBottom: 8 }}>
            <div style={{ width: `${forPct}%`, background: "linear-gradient(90deg,#10B981,#059669)", borderRadius: 3 }} />
            <div style={{ width: `${againstPct}%`, background: "linear-gradient(90deg,#DC2626,#EF4444)", borderRadius: 3 }} />
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <span style={{ font: `400 10px ${mono}`, color: "#6B6560" }}>Quorum: {cm.quorum_required}</span>
            <span style={{ font: `400 10px ${mono}`, color: "#6B6560" }}>Rep weight: {cm.reputation_weight}</span>
            <span style={{ font: `400 10px ${mono}`, color: "#6B6560" }}>Precedent: {cm.precedent_match}</span>
          </div>
        </div>

        {/* Arguments */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div style={{ background: "rgba(16,185,129,.03)", border: "1px solid rgba(16,185,129,.08)", borderRadius: 5, padding: 12 }}>
            <div style={{ font: `600 8px ${mono}`, color: "#10B981", letterSpacing: 1, marginBottom: 5 }}>FOR</div>
            <p style={{ font: `400 11px/1.6 ${sans}`, color: "#B8B0A2", margin: 0 }}>{vc.arguments_for}</p>
          </div>
          <div style={{ background: "rgba(239,68,68,.03)", border: "1px solid rgba(239,68,68,.08)", borderRadius: 5, padding: 12 }}>
            <div style={{ font: `600 8px ${mono}`, color: "#EF4444", letterSpacing: 1, marginBottom: 5 }}>AGAINST</div>
            <p style={{ font: `400 11px/1.6 ${sans}`, color: "#B8B0A2", margin: 0 }}>{vc.arguments_against}</p>
          </div>
        </div>

        {/* Impact */}
        <div style={{ background: "#131315", border: "1px solid rgba(255,255,255,.06)", borderRadius: 6, padding: 16 }}>
          <div style={{ font: `600 8px ${mono}`, color: "#6B6560", letterSpacing: 2, marginBottom: 12 }}>COGNITIVE METRICS</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
            {[
              { label: "Risk Score", value: cm.risk_score, color: cm.risk_score > 50 ? "#EF4444" : cm.risk_score > 30 ? "#F59E0B" : "#10B981" },
              { label: "Rep Weight", value: cm.reputation_weight, color: "#B8B0A2" },
              { label: "Precedent", value: cm.precedent_match, color: "#3B82F6" },
              { label: "Quorum Req", value: cm.quorum_required, color: "#8B5CF6" },
            ].map((m) => (
              <div key={m.label}>
                <div style={{ font: `400 9px ${mono}`, color: "#6B6560" }}>{m.label}</div>
                <div style={{ font: `500 16px ${mono}`, color: m.color }}>{m.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Action button */}
        {proposal.status === "Draft" || proposal.status === "GenLayer_Validation" ? (
          <button
            onClick={() => void runValidation(proposal.id)}
            className="hov-intel"
            style={{
              alignSelf: "flex-start",
              font: `500 11px ${mono}`,
              color: "#8B5CF6",
              padding: "8px 16px",
              background: "rgba(139,92,246,.08)",
              border: "1px solid rgba(139,92,246,.15)",
              borderRadius: 5,
              cursor: "pointer",
            }}
          >
            Run Validation →
          </button>
        ) : null}
      </div>

      {/* CLAO Analysis sidebar — live ValidatorStream */}
      <div style={{ background: "linear-gradient(180deg,rgba(139,92,246,.03),transparent)", borderLeft: "1px solid rgba(139,92,246,.06)", padding: 18, overflowY: "auto" }}>
        <ValidatorStream />

        {proposal.ruling && (
          <div style={{ background: "rgba(16,185,129,.04)", border: "1px solid rgba(16,185,129,.1)", borderRadius: 5, padding: 12, marginTop: 14 }}>
            <div style={{ font: `600 8px ${mono}`, color: "#10B981", letterSpacing: 1, marginBottom: 5 }}>RULING</div>
            <div style={{ font: `500 12px ${sans}`, color: "#F5F0E8", marginBottom: 4 }}>{proposal.ruling.verdict}</div>
            <div style={{ font: `400 10px/1.5 ${sans}`, color: "#B8B0A2" }}>{proposal.ruling.rationale}</div>
          </div>
        )}
      </div>
    </div>
  );
}
