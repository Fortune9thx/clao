import { useClaoStore } from "@/store/useClaoStore";
import { useReputation } from "@/store/selectors";

const mono = "'IBM Plex Mono', monospace";
const sans = "'Space Grotesk', sans-serif";

const HEADERS = ["#", "DELEGATE", "SCORE", "VOTES", "VP", "TREND"];
const COLS = "40px 1fr 70px 70px 70px 70px";

function scoreColor(n: number) {
  return n >= 80 ? "#10B981" : n >= 60 ? "#F59E0B" : "#EF4444";
}

export function ReputationEngine() {
  const reputation = useReputation();
  const profile = useClaoStore((s) => s.governanceProfile);
  const hydrating = useClaoStore((s) => s.hydrating);

  const factors = reputation.factors;

  // Build delegate list: first row is the connected profile, rest are mock peers
  const PEER_DELEGATES = [
    { addr: "0xd4e1...a73c", score: 71, votes: "623", vp: "1.8M", trend: "↓ 5", trendColor: "#EF4444" },
    { addr: "0x1f9e...b4d2", score: 88, votes: "512", vp: "940K", trend: "—",   trendColor: "#B8B0A2" },
    { addr: "0x5c3a...91ef", score: 85, votes: "489", vp: "780K", trend: "↑ 1", trendColor: "#10B981" },
    { addr: "0xa7b4...2e8f", score: 68, votes: "301", vp: "520K", trend: "↓ 2", trendColor: "#EF4444" },
  ];

  const allDelegates = [
    {
      addr: profile.address,
      score: reputation.composite,
      votes: "847",
      vp: "2.1M",
      trend: `↑ ${factors.find((f) => f.delta > 0)?.delta ?? 0}`,
      trendColor: "#10B981",
      selected: true,
    },
    ...PEER_DELEGATES.map((d) => ({ ...d, selected: false })),
  ].sort((a, b) => b.score - a.score).map((d, i) => ({ ...d, rank: i + 1 }));

  return (
    <div className="screen-fade" style={{ display: "grid", gridTemplateColumns: "1fr 350px", height: "100%", overflow: "hidden" }}>
      {/* Leaderboard */}
      <div style={{ padding: 20, overflowY: "auto" }}>
        <div style={{ background: "#131315", border: "1px solid rgba(255,255,255,.06)", borderRadius: 7, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: COLS, padding: "8px 12px", background: "rgba(255,255,255,.02)", borderBottom: "1px solid rgba(255,255,255,.04)" }}>
            {HEADERS.map((h) => (
              <div key={h} style={{ font: `600 7px ${mono}`, color: "#3D3A36", letterSpacing: 1 }}>{h}</div>
            ))}
          </div>
          {allDelegates.map((d, i) => (
            <div
              key={d.addr}
              className={d.selected ? undefined : "hov-row"}
              style={{
                display: "grid",
                gridTemplateColumns: COLS,
                padding: "9px 12px",
                borderBottom: i < allDelegates.length - 1 ? "1px solid rgba(255,255,255,.03)" : undefined,
                alignItems: "center",
                cursor: "pointer",
                background: d.selected ? "rgba(255,255,255,.03)" : undefined,
                borderLeft: d.selected ? "2px solid #C0C0C0" : "2px solid transparent",
              }}
            >
              <div style={{ font: `500 10px ${mono}`, color: "#6B6560" }}>{d.rank}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 18, height: 18, background: "#222228", borderRadius: "50%" }} />
                <span style={{ font: `500 11px ${mono}`, color: d.selected ? "#F5F0E8" : "#B8B0A2" }}>{d.addr}</span>
              </div>
              <div style={{ font: `600 12px ${mono}`, color: scoreColor(d.score) }}>{d.score}</div>
              <div style={{ font: `400 10px ${mono}`, color: "#B8B0A2" }}>{d.votes}</div>
              <div style={{ font: `400 10px ${mono}`, color: "#B8B0A2" }}>{d.vp}</div>
              <div style={{ font: `500 9px ${mono}`, color: d.trendColor }}>{d.trend}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Profile panel */}
      <div style={{ borderLeft: "1px solid rgba(255,255,255,.06)", padding: 20, overflowY: "auto", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 36, height: 36, background: "#222228", borderRadius: "50%" }} />
          <div>
            <div style={{ font: `600 13px ${sans}`, color: "#F5F0E8" }}>{profile.address}</div>
            <div style={{ font: `400 9px ${mono}`, color: "#6B6560" }}>{profile.role}</div>
          </div>
        </div>

        <div style={{ background: "#131315", border: "1px solid rgba(255,255,255,.06)", borderRadius: 5, padding: 16, textAlign: "center" }}>
          {hydrating ? (
            <span className="skel" style={{ width: 60, height: 40, display: "inline-block" }} />
          ) : (
            <div style={{ font: `300 42px/1 ${mono}`, color: scoreColor(reputation.composite) }}>{reputation.composite}</div>
          )}
          <div style={{ font: `600 8px ${mono}`, color: "#6B6560", letterSpacing: 2, marginTop: 4 }}>REPUTATION SCORE</div>
        </div>

        {/* Reputation history sparkline */}
        <div style={{ background: "#131315", border: "1px solid rgba(255,255,255,.06)", borderRadius: 5, padding: 12 }}>
          <div style={{ font: `600 8px ${mono}`, color: "#6B6560", letterSpacing: 1, marginBottom: 8 }}>HISTORY</div>
          <svg width="100%" height="40" viewBox={`0 0 ${reputation.history.length * 20} 40`} preserveAspectRatio="none">
            <polyline
              points={reputation.history.map((v, i) => `${i * 20},${40 - (v / 100) * 36}`).join(" ")}
              fill="none"
              stroke="#8B5CF6"
              strokeWidth="1.5"
            />
          </svg>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
          {factors.map((f) => (
            <div key={f.key} style={{ background: "#131315", border: "1px solid rgba(255,255,255,.06)", borderRadius: 4, padding: 9 }}>
              <div style={{ font: `400 8px ${mono}`, color: "#6B6560", letterSpacing: 1 }}>{f.label.toUpperCase()}</div>
              <div style={{ font: `500 16px ${mono}`, color: "#F5F0E8", marginTop: 1 }}>
                {f.value}
                <span style={{ font: `400 10px ${mono}`, color: f.delta >= 0 ? "#10B981" : "#EF4444", marginLeft: 4 }}>
                  {f.delta >= 0 ? `↑ ${f.delta}` : `↓ ${Math.abs(f.delta)}`}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: "linear-gradient(135deg,rgba(139,92,246,.05),transparent)", border: "1px solid rgba(139,92,246,.1)", borderRadius: 5, padding: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 3, marginBottom: 3 }}>
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#8B5CF6" }} />
            <span style={{ font: `600 8px ${mono}`, color: "#8B5CF6", letterSpacing: 1 }}>CLAO ASSESSMENT</span>
          </div>
          <div style={{ font: `400 10px/1.5 ${sans}`, color: "#C4B5FD" }}>
            {reputation.composite >= 80
              ? `Highly reliable. ${reputation.composite}% composite. ${reputation.confidence}% confidence.`
              : reputation.composite >= 60
                ? `Moderate reputation. ${reputation.composite}% composite. Monitor consistency.`
                : `Low reputation score. ${reputation.composite}% composite. Requires improvement.`}
          </div>
        </div>
      </div>
    </div>
  );
}
