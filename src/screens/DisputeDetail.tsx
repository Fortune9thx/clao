import { useClaoStore } from "@/store/useClaoStore";
import { useDispute } from "@/store/selectors";

const mono = "'IBM Plex Mono', monospace";
const sans = "'Space Grotesk', sans-serif";

// Static validator reasoning — derived from on-chain validation state when wired
const VALIDATORS = [
  { tag: "V1", addr: "0x4f2a", stance: "FAVORS CLAIMANT",   stanceColor: "#10B981", quote: '"Proposal notification period was not honoured per governance charter §4."', conf: "91%" },
  { tag: "V2", addr: "0x9c1b", stance: "FAVORS RESPONDENT", stanceColor: "#EF4444", quote: '"Action covered under emergency mandate. Multisig acted within delegated authority."', conf: "78%" },
  { tag: "V3", addr: "0x2e8d", stance: "UNDECIDED",         stanceColor: "#F59E0B", quote: '"Need on-chain timestamps to determine feasibility of notification."', conf: "52%" },
];

export function DisputeDetail() {
  const dispute = useDispute();
  const adjudicate = useClaoStore((s) => s.adjudicateDispute);
  const clao = useClaoStore((s) => s.clao);

  if (!dispute.open) {
    return (
      <div className="screen-fade" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(16,185,129,.1)", border: "1px solid rgba(16,185,129,.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ font: `600 14px ${mono}`, color: "#10B981" }}>✓</span>
        </div>
        <div style={{ font: `500 14px ${sans}`, color: "#F5F0E8" }}>No Active Dispute</div>
        <div style={{ font: `400 11px ${sans}`, color: "#6B6560" }}>Governance is running smoothly</div>
      </div>
    );
  }

  const timeline = [
    { color: "#10B981", text: "Dispute filed", when: dispute.proposalId ? `Proposal ${dispute.proposalId}` : "Filed" },
    { color: "#3B82F6", text: "Evidence opened", when: "In review" },
    ...(dispute.status === "Adjudicating" || dispute.status === "Resolved"
      ? [{ color: "#EF4444", text: "Escalated", when: "Validators active" }]
      : []),
    {
      color: dispute.status === "Resolved" ? "#10B981" : "#F59E0B",
      text: dispute.status === "Resolved" ? "Resolved" : "Awaiting reasoning",
      when: "Now",
      pulse: dispute.status !== "Resolved",
      highlight: true,
    },
  ];

  return (
    <div className="screen-fade" style={{ display: "grid", gridTemplateColumns: "1fr 1px 1fr", height: "100%", overflow: "hidden" }}>
      {/* Evidence & Claims */}
      <div style={{ padding: 18, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ font: `600 8px ${mono}`, color: "#6B6560", letterSpacing: 2 }}>EVIDENCE & CLAIMS</div>
          {dispute.disputeId && (
            <span style={{ font: `500 8px ${mono}`, color: "#8B5CF6" }}>#{dispute.disputeId}</span>
          )}
        </div>

        {dispute.reason && (
          <div style={{ background: "#131315", border: "1px solid rgba(245,158,11,.1)", borderRadius: 5, padding: 12 }}>
            <div style={{ font: `600 8px ${mono}`, color: "#F59E0B", letterSpacing: 1, marginBottom: 5 }}>DISPUTE REASON</div>
            <div style={{ font: `400 11px/1.5 ${sans}`, color: "#B8B0A2" }}>{dispute.reason}</div>
          </div>
        )}

        <div style={{ background: "#131315", border: "1px solid rgba(16,185,129,.1)", borderRadius: 5, padding: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ font: `600 11px ${sans}`, color: "#F5F0E8" }}>Party A — Claimant</span>
            <span style={{ font: `600 7px ${mono}`, color: "#10B981" }}>CLAIMANT</span>
          </div>
          <div style={{ font: `400 11px/1.5 ${sans}`, color: "#B8B0A2" }}>
            Governance action taken without required proposal process approval.
          </div>
        </div>

        <div style={{ background: "#131315", border: "1px solid rgba(239,68,68,.1)", borderRadius: 5, padding: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ font: `600 11px ${sans}`, color: "#F5F0E8" }}>Party B — Respondent</span>
            <span style={{ font: `600 7px ${mono}`, color: "#EF4444" }}>RESPONDENT</span>
          </div>
          <div style={{ font: `400 11px/1.5 ${sans}`, color: "#B8B0A2" }}>
            Action covered under emergency mandate. Multisig acted within delegated authority.
          </div>
        </div>

        <div style={{ font: `600 8px ${mono}`, color: "#6B6560", letterSpacing: 2, marginTop: 4 }}>TIMELINE</div>
        <div style={{ borderLeft: "2px solid rgba(255,255,255,.06)", marginLeft: 5, paddingLeft: 14, display: "flex", flexDirection: "column", gap: 5 }}>
          {timeline.map((t, i) => (
            <div key={i} style={{ position: "relative" }}>
              <span style={{
                position: "absolute", left: -19, top: 3,
                width: 5, height: 5, borderRadius: "50%", background: t.color,
                animation: t.pulse ? "pulseGlow 2s ease infinite" : undefined,
              }} />
              <div style={{ font: `500 10px ${sans}`, color: t.highlight ? "#F59E0B" : "#F5F0E8" }}>{t.text}</div>
              <div style={{ font: `400 8px ${mono}`, color: "#6B6560" }}>{t.when}</div>
            </div>
          ))}
        </div>

        {dispute.status !== "Resolved" && (
          <button
            onClick={() => void adjudicate()}
            className="hov-intel"
            style={{
              alignSelf: "flex-start",
              font: `500 10px ${mono}`,
              color: "#8B5CF6",
              padding: "7px 14px",
              background: "rgba(139,92,246,.08)",
              border: "1px solid rgba(139,92,246,.15)",
              borderRadius: 5,
              cursor: "pointer",
              marginTop: 4,
            }}
          >
            Adjudicate →
          </button>
        )}

        {dispute.outcome && (
          <div style={{ background: "rgba(16,185,129,.05)", border: "1px solid rgba(16,185,129,.12)", borderRadius: 5, padding: 12 }}>
            <div style={{ font: `600 8px ${mono}`, color: "#10B981", letterSpacing: 1, marginBottom: 4 }}>OUTCOME</div>
            <div style={{ font: `400 11px/1.5 ${sans}`, color: "#F5F0E8" }}>{dispute.outcome}</div>
          </div>
        )}
      </div>

      {/* Divider */}
      <div style={{ background: "rgba(255,255,255,.06)" }} />

      {/* Validator Reasoning */}
      <div style={{ padding: 18, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ font: `600 8px ${mono}`, color: "#6B6560", letterSpacing: 2 }}>VALIDATOR REASONING</div>

        {VALIDATORS.map((v) => (
          <div key={v.tag} style={{ background: "#131315", border: "1px solid rgba(255,255,255,.06)", borderRadius: 5, padding: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 14, height: 14, background: "rgba(139,92,246,.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ font: `700 6px 'IBM Plex Mono'`, color: "#8B5CF6" }}>{v.tag}</span>
                </div>
                <span style={{ font: `500 9px ${mono}`, color: "#B8B0A2" }}>{v.addr}</span>
              </div>
              <span style={{ font: `600 8px ${mono}`, color: v.stanceColor }}>{v.stance}</span>
            </div>
            <div style={{ font: `400 10px/1.5 ${sans}`, color: "#B8B0A2" }}>{v.quote}</div>
            <div style={{ font: `400 8px ${mono}`, color: "#6B6560", marginTop: 3 }}>Confidence: {v.conf}</div>
          </div>
        ))}

        <div style={{ background: "linear-gradient(135deg,rgba(139,92,246,.06),transparent)", border: "1px solid rgba(139,92,246,.1)", borderRadius: 5, padding: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 3, marginBottom: 4 }}>
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#8B5CF6" }} />
            <span style={{ font: `600 8px ${mono}`, color: "#8B5CF6", letterSpacing: 1 }}>CLAO SYNTHESIS</span>
          </div>
          <div style={{ font: `400 10px/1.5 ${sans}`, color: "#C4B5FD" }}>{clao.caption}</div>
        </div>
      </div>
    </div>
  );
}
