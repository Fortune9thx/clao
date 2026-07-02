import { useClaoStore } from "@/store/useClaoStore";

const mono = "'IBM Plex Mono', monospace";
const sans = "'Space Grotesk', sans-serif";

const NAV_ITEMS = ["Governance", "Members", "Integrations", "CLAO Behavior", "Notifications", "Security"];

export function Settings() {
  const dao = useClaoStore((s) => s.currentDAO);
  const engine = useClaoStore((s) => s.governanceEngine);
  const profile = useClaoStore((s) => s.governanceProfile);

  const params = [
    { label: "Default Quorum",     desc: "Minimum participation",    value: `${engine.quorumBase}%` },
    { label: "Adaptive Quorum",    desc: "Current required (adjusted)", value: `${engine.quorumTarget}%` },
    { label: "Approval Threshold", desc: "% of For votes needed",    value: "66%" },
    { label: "Emergency Period",   desc: "Shortened urgent window",   value: "48 hours" },
  ];

  return (
    <div className="screen-fade" style={{ display: "grid", gridTemplateColumns: "180px 1fr", height: "100%", overflow: "hidden" }}>
      {/* Settings nav */}
      <div style={{ borderRight: "1px solid rgba(255,255,255,.06)", padding: "16px 12px", display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV_ITEMS.map((item, i) => (
          <div
            key={item}
            className={i > 0 ? "hov-chip-soft" : undefined}
            style={{
              padding: "7px 10px",
              borderRadius: 5,
              font: `500 12px ${sans}`,
              color: i === 0 ? "#F5F0E8" : "#6B6560",
              background: i === 0 ? "rgba(255,255,255,.06)" : undefined,
              cursor: "pointer",
            }}
          >
            {item}
          </div>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: 28, overflowY: "auto", maxWidth: 720, display: "flex", flexDirection: "column", gap: 20 }}>
        <div>
          <h3 style={{ font: `500 18px ${sans}`, color: "#F5F0E8", margin: "0 0 3px" }}>Governance Parameters</h3>
          <p style={{ font: `400 12px ${sans}`, color: "#6B6560", margin: 0 }}>
            {dao.name} · Risk mode: {dao.risk_mode}
          </p>
        </div>

        {/* Profile card */}
        <div style={{ background: "#131315", border: "1px solid rgba(255,255,255,.06)", borderRadius: 7, padding: 16, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, background: "#222228", borderRadius: "50%", flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ font: `500 13px ${sans}`, color: "#F5F0E8" }}>{profile.address}</div>
            <div style={{ font: `400 11px ${sans}`, color: "#6B6560", marginTop: 2 }}>{profile.role}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ font: `300 20px ${mono}`, color: "#8B5CF6" }}>{profile.reputation_score}</div>
            <div style={{ font: `400 8px ${mono}`, color: "#6B6560", letterSpacing: 1 }}>REP SCORE</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ font: `500 14px ${mono}`, color: "#F5F0E8" }}>{profile.voting_weight_multiplier}</div>
            <div style={{ font: `400 8px ${mono}`, color: "#6B6560", letterSpacing: 1 }}>VOTE WEIGHT</div>
          </div>
        </div>

        <div style={{ background: "#131315", border: "1px solid rgba(255,255,255,.06)", borderRadius: 7, padding: 18, display: "flex", flexDirection: "column", gap: 16 }}>
          {params.map((p, i) => (
            <div
              key={p.label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingBottom: i < params.length - 1 ? 14 : 0,
                borderBottom: i < params.length - 1 ? "1px solid rgba(255,255,255,.04)" : undefined,
              }}
            >
              <div>
                <div style={{ font: `500 13px ${sans}`, color: "#F5F0E8" }}>{p.label}</div>
                <div style={{ font: `400 11px ${sans}`, color: "#6B6560", marginTop: 1 }}>{p.desc}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ font: `500 14px ${mono}`, color: "#F5F0E8" }}>{p.value}</div>
                <div
                  className="hov-chip-soft"
                  style={{ font: `500 10px ${sans}`, color: "#B8B0A2", padding: "5px 10px", border: "1px solid rgba(255,255,255,.1)", borderRadius: 5, cursor: "pointer" }}
                >
                  Edit
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Governance pressure bar */}
        <div style={{ background: "#131315", border: "1px solid rgba(255,255,255,.06)", borderRadius: 7, padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ font: `500 11px ${sans}`, color: "#F5F0E8" }}>Governance Pressure</span>
            <span style={{ font: `500 11px ${mono}`, color: engine.governancePressure > 70 ? "#EF4444" : engine.governancePressure > 50 ? "#F59E0B" : "#10B981" }}>
              {engine.governancePressure}%
            </span>
          </div>
          <div style={{ height: 4, background: "#1A1A1E", borderRadius: 2, overflow: "hidden" }}>
            <div style={{
              width: `${engine.governancePressure}%`,
              height: "100%",
              background: engine.governancePressure > 70 ? "#EF4444" : engine.governancePressure > 50 ? "#F59E0B" : "#10B981",
              borderRadius: 2,
              transition: "width .3s ease",
            }} />
          </div>
        </div>

        {/* Adaptive Governance toggle */}
        <div style={{ background: "linear-gradient(135deg,rgba(139,92,246,.05),transparent)", border: "1px solid rgba(139,92,246,.1)", borderRadius: 7, padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#8B5CF6" }} />
              <span style={{ font: `600 10px ${mono}`, color: "#8B5CF6", letterSpacing: 1 }}>ADAPTIVE GOVERNANCE</span>
            </div>
            <div style={{ width: 40, height: 22, background: "#8B5CF6", borderRadius: 11, padding: 2, cursor: "pointer", display: "flex", justifyContent: "flex-end" }}>
              <div style={{ width: 18, height: 18, background: "#fff", borderRadius: "50%" }} />
            </div>
          </div>
          <div style={{ font: `400 12px/1.5 ${sans}`, color: "#C4B5FD" }}>
            CLAO dynamically adjusts quorum and voting periods based on proposal type, urgency, and historical patterns. Current quorum uplift: +{engine.quorumAdjustment}%.
          </div>
        </div>
      </div>
    </div>
  );
}
