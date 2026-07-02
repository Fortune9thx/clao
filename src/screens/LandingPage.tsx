import { useViewStore } from "@/store/useViewStore";
import { ClaoOrb } from "@/components/ClaoOrb";
import { LandingSubPage } from "@/screens/LandingSubPages";

const mono = "'IBM Plex Mono', monospace";
const sans = "'Space Grotesk', sans-serif";

/* ── Mini app previews for feature sections ──────────────────────────── */

function PreviewCommandCenter() {
  return (
    <div style={{ padding: 12, background: "#0D0D0F", height: "100%", overflow: "hidden", fontSize: 0 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: 8, marginBottom: 8 }}>
        <div style={{ background: "#131315", border: "1px solid rgba(255,255,255,.06)", borderRadius: 5, padding: 12 }}>
          <div style={{ font: `600 6px ${mono}`, color: "#6B6560", letterSpacing: 1 }}>TREASURY VALUE</div>
          <div style={{ font: `300 20px/1 ${mono}`, color: "#F5F0E8", marginTop: 4 }}>$47,238,491</div>
          <div style={{ font: `500 6px ${mono}`, color: "#10B981", marginTop: 4 }}>↑ 3.2% · 24h</div>
          <div style={{ height: 24, marginTop: 6, background: "linear-gradient(to right,rgba(16,185,129,.03),rgba(16,185,129,.06))", borderRadius: 2, position: "relative", overflow: "hidden" }}>
            <svg width="100%" height="24" viewBox="0 0 200 24" preserveAspectRatio="none" style={{ position: "absolute", bottom: 0 }}>
              <path d="M0,18 C30,16 50,10 80,9 C110,8 130,14 160,11 C180,9 195,7 200,5" fill="none" stroke="rgba(16,185,129,.3)" strokeWidth="1" />
            </svg>
          </div>
        </div>
        <div style={{ background: "linear-gradient(160deg,rgba(139,92,246,.06),rgba(13,13,15,.95))", border: "1px solid rgba(139,92,246,.12)", borderRadius: 5, padding: 8, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
          <ClaoOrb size={28} />
          <div style={{ font: `600 5px ${mono}`, color: "#8B5CF6", letterSpacing: 1 }}>CLAO INTEL</div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 4, marginBottom: 8 }}>
        {[["12", "#F59E0B"], ["89.4%", "#10B981"], ["94", "#B8B0A2"], ["2", "#EF4444"]].map(([v], i) => (
          <div key={i} style={{ background: "#131315", border: "1px solid rgba(255,255,255,.06)", borderRadius: 4, padding: "6px 5px" }}>
            <div style={{ font: `300 12px/1 ${mono}`, color: "#F5F0E8" }}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
        {[1, 2].map((i) => (
          <div key={i} style={{ background: "#131315", border: "1px solid rgba(255,255,255,.06)", borderRadius: 4, height: 40 }} />
        ))}
      </div>
    </div>
  );
}

function PreviewReputation() {
  const rows = [94, 71, 88, 85, 68];
  return (
    <div style={{ padding: 12, background: "#0D0D0F", height: "100%", overflow: "hidden", display: "grid", gridTemplateColumns: "1fr 100px", gap: 8 }}>
      <div style={{ background: "#131315", border: "1px solid rgba(255,255,255,.06)", borderRadius: 5, overflow: "hidden" }}>
        {rows.map((s, i) => (
          <div key={i} style={{ padding: "5px 8px", borderBottom: "1px solid rgba(255,255,255,.03)", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ font: `500 7px ${mono}`, color: "#6B6560", width: 12 }}>{i + 1}</span>
            <div style={{ width: 10, height: 10, background: "#222228", borderRadius: "50%" }} />
            <span style={{ font: `500 7px ${mono}`, color: "#B8B0A2", flex: 1 }}>0x{Math.random().toString(16).slice(2, 6)}</span>
            <span style={{ font: `600 8px ${mono}`, color: s >= 85 ? "#10B981" : "#F59E0B" }}>{s}</span>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ background: "#131315", border: "1px solid rgba(255,255,255,.06)", borderRadius: 4, padding: 8, textAlign: "center" }}>
          <div style={{ font: `300 22px/1 ${mono}`, color: "#10B981" }}>94</div>
          <div style={{ font: `600 5px ${mono}`, color: "#6B6560", letterSpacing: 1, marginTop: 2 }}>SCORE</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3, flex: 1 }}>
          {["97", "91", "89", "96"].map((v, i) => (
            <div key={i} style={{ background: "#131315", border: "1px solid rgba(255,255,255,.06)", borderRadius: 3, padding: 4 }}>
              <div style={{ font: `500 9px ${mono}`, color: "#F5F0E8" }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PreviewMemory() {
  return (
    <div style={{ padding: 12, background: "#0D0D0F", height: "100%", position: "relative", overflow: "hidden" }}>
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <line x1="48%" y1="45%" x2="28%" y2="25%" stroke="rgba(239,68,68,.25)" strokeWidth="1" strokeDasharray="3 5" style={{ animation: "edgeFlow 2.4s linear infinite" }} />
        <line x1="52%" y1="42%" x2="72%" y2="30%" stroke="rgba(16,185,129,.25)" strokeWidth="1" strokeDasharray="3 5" style={{ animation: "edgeFlow 2.4s linear infinite" }} />
        <line x1="50%" y1="48%" x2="65%" y2="62%" stroke="rgba(16,185,129,.25)" strokeWidth="1" strokeDasharray="3 5" style={{ animation: "edgeFlow 2.4s linear infinite" }} />
      </svg>
      {[
        { id: "#47", s: "ACTIVE", c: "#8B5CF6", bc: "rgba(139,92,246,.3)", l: "38%", t: "36%", sel: true },
        { id: "#31", s: "REJECTED", c: "#EF4444", bc: "rgba(239,68,68,.2)", l: "18%", t: "16%" },
        { id: "#22", s: "PASSED", c: "#10B981", bc: "rgba(16,185,129,.2)", l: "62%", t: "22%" },
        { id: "#38", s: "PASSED", c: "#10B981", bc: "rgba(16,185,129,.2)", l: "56%", t: "58%" },
        { id: "#44", s: "PASSED", c: "#3B82F6", bc: "rgba(59,130,246,.2)", l: "12%", t: "55%" },
        { id: "#40", s: "DISPUTED", c: "#F59E0B", bc: "rgba(245,158,11,.2)", l: "30%", t: "74%" },
      ].map((n) => (
        <div key={n.id} style={{
          position: "absolute", left: n.l, top: n.t, background: "#1A1A1E",
          border: `${n.sel ? 2 : 1}px solid ${n.bc}`, borderRadius: 4, padding: "4px 6px", zIndex: 1,
          boxShadow: n.sel ? "0 0 10px rgba(139,92,246,.08)" : undefined,
        }}>
          <div style={{ font: `600 5px ${mono}`, color: n.c, letterSpacing: 0.5 }}>{n.id} · {n.s}</div>
          <div style={{ font: `500 6px ${sans}`, color: n.sel ? "#F5F0E8" : "#B8B0A2", marginTop: 1 }}>Proposal node</div>
        </div>
      ))}
    </div>
  );
}

function PreviewDispute() {
  return (
    <div style={{ padding: 12, background: "#0D0D0F", height: "100%", overflow: "hidden", display: "grid", gridTemplateColumns: "1fr 1px 1fr", gap: 8 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        <div style={{ font: `600 5px ${mono}`, color: "#6B6560", letterSpacing: 1 }}>EVIDENCE</div>
        <div style={{ background: "#131315", border: "1px solid rgba(16,185,129,.1)", borderRadius: 4, padding: 6 }}>
          <div style={{ font: `600 6px ${sans}`, color: "#F5F0E8" }}>Party A</div>
          <div style={{ font: `400 5px ${sans}`, color: "#B8B0A2", marginTop: 2 }}>$2.4M allocated without approval...</div>
        </div>
        <div style={{ background: "#131315", border: "1px solid rgba(239,68,68,.1)", borderRadius: 4, padding: 6 }}>
          <div style={{ font: `600 6px ${sans}`, color: "#F5F0E8" }}>Party B</div>
          <div style={{ font: `400 5px ${sans}`, color: "#B8B0A2", marginTop: 2 }}>Covered under emergency mandate...</div>
        </div>
        <div style={{ borderLeft: "1px solid rgba(255,255,255,.06)", marginLeft: 3, paddingLeft: 8, display: "flex", flexDirection: "column", gap: 3 }}>
          {["#10B981", "#3B82F6", "#EF4444", "#F59E0B"].map((c, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 3, height: 3, borderRadius: "50%", background: c }} />
              <span style={{ font: `400 5px ${sans}`, color: "#B8B0A2" }}>Event {i + 1}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background: "rgba(255,255,255,.06)" }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        <div style={{ font: `600 5px ${mono}`, color: "#6B6560", letterSpacing: 1 }}>REASONING</div>
        {["V1", "V2", "V3"].map((v, i) => (
          <div key={v} style={{ background: "#131315", border: "1px solid rgba(255,255,255,.06)", borderRadius: 4, padding: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ font: `700 5px ${mono}`, color: "#8B5CF6" }}>{v}</span>
              <span style={{ font: `600 5px ${mono}`, color: ["#10B981", "#EF4444", "#F59E0B"][i] }}>{["CLAIMANT", "RESPONDENT", "UNDECIDED"][i]}</span>
            </div>
          </div>
        ))}
        <div style={{ background: "linear-gradient(135deg,rgba(139,92,246,.06),transparent)", border: "1px solid rgba(139,92,246,.1)", borderRadius: 4, padding: 6 }}>
          <div style={{ font: `600 5px ${mono}`, color: "#8B5CF6", letterSpacing: 0.5 }}>CLAO SYNTHESIS</div>
          <div style={{ font: `400 5px ${sans}`, color: "#C4B5FD", marginTop: 2 }}>2/3 divergence...</div>
        </div>
      </div>
    </div>
  );
}

function FeaturePreview({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ aspectRatio: "4/3", background: "linear-gradient(135deg,#1A1A1E,#131315)", border: "1px solid rgba(255,255,255,.06)", borderRadius: 8, overflow: "hidden", position: "relative" }}>
      {children}
    </div>
  );
}

/* ── Feature data ────────────────────────────────────────────────────── */

const FEATURES = [
  {
    kicker: "Adaptive Governance", kickerColor: "#8B5CF6", dotColor: "#8B5CF6",
    title: "Governance that evolves with your DAO.",
    desc: "CLAO dynamically adjusts quorum thresholds, voting periods, and approval criteria based on proposal type, urgency, and historical patterns. No more one-size-fits-all governance.",
    bullets: ["Dynamic quorum adjustment per proposal category", "Context-aware voting period optimization", "Multi-sig emergency escalation protocols"],
    preview: <PreviewCommandCenter />,
  },
  {
    kicker: "Reputation Reasoning", kickerColor: "#3B82F6", dotColor: "#3B82F6",
    title: "Trust is earned. CLAO proves it.",
    desc: "Multi-dimensional reputation scoring that goes beyond token holdings. CLAO evaluates voting history, proposal quality, delegation patterns, and on-chain behavior to surface genuine governance contributors.",
    bullets: ["Behavioral reputation scoring across chains", "Sybil resistance through pattern analysis", "Delegation recommendations powered by AI"],
    preview: <PreviewReputation />,
    reverse: true,
  },
  {
    kicker: "Institutional Memory", kickerColor: "#10B981", dotColor: "#10B981",
    title: "Your DAO never forgets a decision.",
    desc: "A living knowledge graph of every proposal, debate, and outcome. CLAO connects historical precedents to current decisions, preventing repeated mistakes and surfacing patterns invisible to humans.",
    bullets: ["Full governance history as a searchable graph", "Precedent detection for new proposals", "Cross-DAO pattern intelligence"],
    preview: <PreviewMemory />,
  },
  {
    kicker: "Dispute Resolution", kickerColor: "#F59E0B", dotColor: "#F59E0B",
    title: "Subjective disputes. Objective resolution.",
    desc: "When governance conflicts arise, CLAO's subjective validator network evaluates evidence, reasons through competing claims, and delivers transparent adjudication — bringing institutional-grade dispute resolution on-chain.",
    bullets: ["Multi-party evidence submission and review", "AI-assisted reasoning chain transparency", "Binding on-chain resolution execution"],
    preview: <PreviewDispute />,
    reverse: true,
  },
];

const PROBLEM_STATS = [
  { val: "73%", color: "rgba(239,68,68,.6)", title: "Proposals fail from poor analysis", desc: "Without historical context or impact modeling, governance decisions repeat past mistakes." },
  { val: "$890M", color: "rgba(245,158,11,.6)", title: "Lost to governance attacks", desc: "Reputation gaming, vote manipulation, and undetected conflicts cost real capital." },
  { val: "12%", color: "rgba(139,92,246,.6)", title: "Average voter participation", desc: "Governance fatigue is real. Delegates lack the tools to make informed, efficient decisions." },
];

const FLOW_STEPS = [
  { num: "01", title: "Propose", desc: "Submit governance proposals", accent: "#6B6560", bg: "#1A1A1E", border: "rgba(255,255,255,.06)" },
  { num: "02", title: "CLAO Analyzes", desc: "AI-powered risk & impact analysis", accent: "#8B5CF6", bg: "linear-gradient(135deg,rgba(139,92,246,.08),rgba(139,92,246,.02))", border: "rgba(139,92,246,.15)" },
  { num: "03", title: "Validators Reason", desc: "Subjective consensus on complex decisions", accent: "#3B82F6", bg: "linear-gradient(135deg,rgba(59,130,246,.08),rgba(59,130,246,.02))", border: "rgba(59,130,246,.15)" },
  { num: "04", title: "Execute", desc: "On-chain execution with confidence", accent: "#10B981", bg: "#1A1A1E", border: "rgba(16,185,129,.15)" },
];

const HERO_STATS = [
  { label: "Treasury Secured", val: "$2.4B" },
  { label: "Proposals Analyzed", val: "18,400+" },
  { label: "Active DAOs", val: "47" },
  { label: "Validators", val: "1,200+" },
];

/* ── Landing Page ────────────────────────────────────────────────────── */

export function LandingPage() {
  const enterApp      = useViewStore((s) => s.enterApp);
  const goLandingPage = useViewStore((s) => s.goLandingPage);
  const landingPage   = useViewStore((s) => s.landingPage);

  function scrollTo(id: string) {
    // If on a sub-page, go home first then scroll
    if (landingPage !== "home") {
      goLandingPage("home");
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  const NAV_LINKS: { label: string; action: () => void }[] = [
    { label: "Product",   action: () => scrollTo("section-product") },
    { label: "Features",  action: () => scrollTo("section-features") },
    { label: "Docs",      action: () => goLandingPage("docs") },
    { label: "Community", action: () => scrollTo("section-community") },
  ];

  // Sub-page view — keep nav, swap body
  if (landingPage !== "home") {
    return (
      <div style={{ width: "100%", minHeight: "100vh", background: "#0D0D0F", color: "#F5F0E8", fontFamily: sans }}>
        <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "0 64px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(13,13,15,.9)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,.04)" }}>
          <div
            style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}
            onClick={() => goLandingPage("home")}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 4, width: 20 }}>
              <span style={{ height: 1.5, background: "linear-gradient(90deg,#C0C0C0,#505050)", borderRadius: 1 }} />
              <span style={{ height: 1.5, background: "linear-gradient(90deg,#A0A0A0,#404040)", borderRadius: 1, marginLeft: 3 }} />
              <span style={{ height: 1.5, background: "linear-gradient(90deg,#808080,#303030)", borderRadius: 1, marginLeft: 6 }} />
            </div>
            <span style={{ font: `700 18px/1 ${sans}`, color: "transparent", background: "linear-gradient(180deg,#E0E0E0,#909090)", WebkitBackgroundClip: "text", backgroundClip: "text", letterSpacing: 7 }}>CLAO</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            {NAV_LINKS.map(({ label, action }) => (
              <span key={label} onClick={action} style={{ font: `500 13px ${sans}`, color: "#6B6560", cursor: "pointer" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#B8B0A2")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#6B6560")}
              >{label}</span>
            ))}
            <button onClick={() => enterApp()} style={{ background: "#F5F0E8", color: "#0D0D0F", font: `600 13px ${sans}`, padding: "10px 22px", border: "none", cursor: "pointer", letterSpacing: 0.5 }}>
              Launch App
            </button>
          </div>
        </nav>
        <LandingSubPage page={landingPage} onBack={() => goLandingPage("home")} />
      </div>
    );
  }

  return (
    <div style={{ width: "100%", minHeight: "100vh", background: "#0D0D0F", color: "#F5F0E8", fontFamily: sans, overflowX: "hidden" }}>

      {/* NAV */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "0 64px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(13,13,15,.8)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,.04)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, width: 20 }}>
            <span style={{ height: 1.5, background: "linear-gradient(90deg,#C0C0C0,#505050)", borderRadius: 1 }} />
            <span style={{ height: 1.5, background: "linear-gradient(90deg,#A0A0A0,#404040)", borderRadius: 1, marginLeft: 3 }} />
            <span style={{ height: 1.5, background: "linear-gradient(90deg,#808080,#303030)", borderRadius: 1, marginLeft: 6 }} />
          </div>
          <span style={{ font: `700 18px/1 ${sans}`, color: "transparent", background: "linear-gradient(180deg,#E0E0E0,#909090)", WebkitBackgroundClip: "text", backgroundClip: "text", letterSpacing: 7 }}>CLAO</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          {NAV_LINKS.map(({ label, action }) => (
            <span
              key={label}
              onClick={action}
              style={{ font: `500 13px ${sans}`, color: "#6B6560", cursor: "pointer", transition: "color .15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#B8B0A2")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#6B6560")}
            >
              {label}
            </span>
          ))}
          <button onClick={() => enterApp()} style={{ background: "#F5F0E8", color: "#0D0D0F", font: `600 13px ${sans}`, padding: "10px 22px", border: "none", cursor: "pointer", letterSpacing: 0.5 }}>
            Launch App
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "140px 64px 72px", overflow: "hidden" }}>
        <video autoPlay loop muted playsInline style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}>
          <source src="/uploads/video_2026-07-01_09-27-37.mp4" type="video/mp4" />
        </video>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(0,0,0,.5) 0%,rgba(0,0,0,.65) 50%,rgba(0,0,0,.85) 100%)" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.02) 1px,transparent 1px)", backgroundSize: "80px 80px", opacity: 0.4 }} />

        <div style={{ position: "relative", zIndex: 2, maxWidth: 800 }}>
          <div style={{ font: `600 11px/1 ${mono}`, color: "rgba(255,255,255,.4)", letterSpacing: 3, textTransform: "uppercase", marginBottom: 24 }}>
            AI-Native Governance
          </div>
          <h1 style={{ font: `300 clamp(44px,5.5vw,72px)/0.95 ${sans}`, color: "#F5F0E8", letterSpacing: -2.5, margin: "0 0 24px" }}>
            The Cognition Layer for Autonomous Organizations
          </h1>
          <p style={{ font: `400 18px/1.6 ${sans}`, color: "#B8B0A2", maxWidth: 560, margin: "0 0 48px" }}>
            Institutional-grade governance intelligence. Adaptive proposals, reputation reasoning, and dispute resolution — powered by subjective AI validators.
          </p>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <button onClick={() => enterApp()} style={{ background: "#F5F0E8", color: "#0D0D0F", font: `600 15px ${sans}`, padding: "14px 32px", border: "none", cursor: "pointer", letterSpacing: 0.5 }}>
              Launch App
            </button>
            <button style={{ color: "#B8B0A2", font: `600 15px ${sans}`, padding: "14px 32px", background: "transparent", border: "1px solid rgba(255,255,255,.12)", cursor: "pointer", letterSpacing: 0.5 }}>
              Read Docs
            </button>
          </div>
        </div>

        <div style={{ position: "relative", zIndex: 2, display: "flex", gap: 48, marginTop: 64, paddingTop: 32, borderTop: "1px solid rgba(255,255,255,.06)" }}>
          {HERO_STATS.map((s) => (
            <div key={s.label}>
              <div style={{ font: `600 10px ${mono}`, color: "#6B6560", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>{s.label}</div>
              <div style={{ font: `300 32px/1 ${mono}`, color: "#F5F0E8", letterSpacing: -1 }}>{s.val}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PROBLEM */}
      <section style={{ padding: "128px 64px", background: "#131315", borderTop: "1px solid rgba(255,255,255,.04)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ font: `600 11px/1 ${mono}`, color: "#6B6560", letterSpacing: 3, textTransform: "uppercase", marginBottom: 24 }}>The Problem</div>
          <h2 style={{ font: `400 48px/1.05 ${sans}`, color: "#F5F0E8", letterSpacing: -1.5, margin: "0 0 64px", maxWidth: 900 }}>
            DAOs govern billions in assets with tools built for forum threads and snapshot votes.
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
            {PROBLEM_STATS.map((s) => (
              <div key={s.val} style={{ padding: 32, border: "1px solid rgba(255,255,255,.06)", borderRadius: 8 }}>
                <div style={{ font: `300 40px/1 ${mono}`, color: s.color, marginBottom: 16 }}>{s.val}</div>
                <div style={{ font: `500 16px/1.3 ${sans}`, color: "#F5F0E8", marginBottom: 8 }}>{s.title}</div>
                <div style={{ font: `400 14px/1.5 ${sans}`, color: "#6B6560" }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT IS CLAO */}
      <section id="section-product" style={{ padding: "128px 64px", background: "#0D0D0F", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle,rgba(139,92,246,.06),transparent 70%)", transform: "translate(-50%,-50%)", filter: "blur(60px)" }} />
        <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
            <span style={{ font: `600 11px/1 ${mono}`, color: "#8B5CF6", letterSpacing: 3, textTransform: "uppercase", border: "1px solid rgba(139,92,246,.3)", padding: "6px 14px", borderRadius: 20 }}>What is CLAO</span>
          </div>
          <h2 style={{ font: `400 48px/1.05 ${sans}`, color: "#F5F0E8", letterSpacing: -1.5, margin: "0 0 24px", maxWidth: 900 }}>
            The intelligence layer between human governance and on-chain execution.
          </h2>
          <p style={{ font: `400 18px/1.6 ${sans}`, color: "#B8B0A2", maxWidth: 640, margin: "0 0 80px" }}>
            CLAO uses subjective AI validators to reason about proposals, model outcomes, and surface institutional knowledge — so your DAO governs like a world-class organization.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr auto 1fr auto 1fr", gap: 0, alignItems: "center" }}>
            {FLOW_STEPS.map((s, i) => (
              <div key={s.num} style={{ display: "contents" }}>
                <div style={{ padding: 24, background: s.bg, border: `1px solid ${s.border}`, borderRadius: 8, textAlign: "center" }}>
                  <div style={{ font: `600 10px ${mono}`, color: s.accent, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>{s.num}</div>
                  <div style={{ font: `500 18px ${sans}`, color: s.accent === "#6B6560" ? "#F5F0E8" : s.accent === "#10B981" ? "#F5F0E8" : s.accent === "#8B5CF6" ? "#C4B5FD" : "#93C5FD", marginBottom: 8 }}>{s.title}</div>
                  <div style={{ font: `400 13px/1.4 ${sans}`, color: s.accent === "#6B6560" ? "#6B6560" : `${s.accent}80` }}>{s.desc}</div>
                </div>
                {i < 3 && <div style={{ font: `300 24px ${sans}`, color: "#3D3A36", padding: "0 12px" }}>→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      {FEATURES.map((f, i) => (
        <section id={i === 0 ? "section-features" : undefined} key={f.kicker} style={{ padding: "128px 64px", background: i % 2 === 0 ? "#131315" : "#0D0D0F", borderTop: i % 2 === 0 ? "1px solid rgba(255,255,255,.04)" : undefined }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 96, alignItems: "center" }}>
            {f.reverse ? (
              <>
                <FeaturePreview>{f.preview}</FeaturePreview>
                <FeatureText f={f} />
              </>
            ) : (
              <>
                <FeatureText f={f} />
                <FeaturePreview>{f.preview}</FeaturePreview>
              </>
            )}
          </div>
        </section>
      ))}

      {/* BUILT ON GENLAYER */}
      <section style={{ padding: "96px 64px", background: "#131315", borderTop: "1px solid rgba(255,255,255,.04)", borderBottom: "1px solid rgba(255,255,255,.04)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center" }}>
          <div style={{ font: `600 11px/1 ${mono}`, color: "#6B6560", letterSpacing: 3, textTransform: "uppercase", marginBottom: 32 }}>Built On</div>
          <img src="/uploads/7y04jSdw.png" style={{ height: 32, opacity: 0.7, marginBottom: 16 }} alt="GenLayer" />
          <p style={{ font: `400 16px/1.6 ${sans}`, color: "#6B6560", maxWidth: 480, margin: "0 auto" }}>
            The first blockchain with subjective smart contracts. Purpose-built for AI-native computation and reasoning.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section id="section-community" style={{ padding: "160px 64px", background: "#131315", position: "relative", overflow: "hidden", textAlign: "center" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", width: 800, height: 800, borderRadius: "50%", background: "radial-gradient(circle,rgba(255,255,255,.03),transparent 60%)", transform: "translate(-50%,-50%)", filter: "blur(80px)" }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 700, margin: "0 auto" }}>
          <h2 style={{ font: `300 56px/1 ${sans}`, color: "#F5F0E8", letterSpacing: -2, margin: "0 0 24px" }}>Govern with intelligence.</h2>
          <p style={{ font: `400 18px/1.6 ${sans}`, color: "#B8B0A2", margin: "0 0 48px" }}>
            Join the DAOs building the future of on-chain governance with CLAO.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
            <button onClick={() => enterApp()} style={{ background: "#F5F0E8", color: "#0D0D0F", font: `600 16px ${sans}`, padding: "16px 40px", border: "none", cursor: "pointer", letterSpacing: 0.5 }}>
              Launch App
            </button>
            <button style={{ color: "#B8B0A2", font: `600 16px ${sans}`, padding: "16px 40px", background: "transparent", border: "1px solid rgba(255,255,255,.12)", cursor: "pointer", letterSpacing: 0.5 }}>
              Join Discord
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: "64px 64px 32px", background: "#0D0D0F", borderTop: "1px solid rgba(255,255,255,.04)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 64, marginBottom: 64 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, width: 20 }}>
                  <span style={{ height: 1.5, background: "linear-gradient(90deg,#C0C0C0,#505050)", borderRadius: 1 }} />
                  <span style={{ height: 1.5, background: "linear-gradient(90deg,#A0A0A0,#404040)", borderRadius: 1, marginLeft: 3 }} />
                  <span style={{ height: 1.5, background: "linear-gradient(90deg,#808080,#303030)", borderRadius: 1, marginLeft: 6 }} />
                </div>
                <span style={{ font: `700 18px/1 ${sans}`, color: "transparent", background: "linear-gradient(180deg,#E0E0E0,#909090)", WebkitBackgroundClip: "text", backgroundClip: "text", letterSpacing: 7 }}>CLAO</span>
              </div>
              <p style={{ font: `400 14px/1.6 ${sans}`, color: "#6B6560", maxWidth: 280 }}>
                Cognition Layer for Autonomous Organizations. AI-native governance infrastructure built on GenLayer.
              </p>
            </div>
            {([
              {
                title: "Product",
                links: [
                  { label: "Command Center",       action: () => enterApp("home") },
                  { label: "Proposal Intelligence", action: () => enterApp("proposals") },
                  { label: "Reputation Engine",     action: () => enterApp("reputation") },
                  { label: "Dispute Resolution",    action: () => enterApp("disputes") },
                ],
              },
              {
                title: "Community",
                links: [
                  { label: "Blog",          action: () => goLandingPage("blog") },
                  { label: "Documentation", action: () => goLandingPage("docs") },
                  { label: "GitHub",        action: () => window.open("https://github.com/Fortune9thx/clao", "_blank") },
                ],
              },
              {
                title: "Legal",
                links: [
                  { label: "Terms of Use",   action: () => goLandingPage("terms") },
                  { label: "Privacy Policy", action: () => goLandingPage("privacy") },
                  { label: "Disclaimers",    action: () => goLandingPage("disclaimers") },
                ],
              },
            ] as { title: string; links: { label: string; action: () => void }[] }[]).map((col) => (
              <div key={col.title}>
                <div style={{ font: `600 10px ${mono}`, color: "#6B6560", letterSpacing: 2, textTransform: "uppercase", marginBottom: 20 }}>{col.title}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {col.links.map(({ label, action }) => (
                    <span
                      key={label}
                      onClick={action}
                      style={{ font: `400 14px ${sans}`, color: "#B8B0A2", cursor: "pointer", transition: "color .15s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#F5F0E8")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "#B8B0A2")}
                    >{label}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 24, borderTop: "1px solid rgba(255,255,255,.04)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 8, font: `400 12px ${mono}`, color: "#3D3A36" }}>
              © 2026 CLAO · Built on <img src="/uploads/7y04jSdw.png" style={{ height: 12, opacity: 0.4 }} alt="GenLayer" />
            </span>
            <span style={{ font: `400 12px ${mono}`, color: "#3D3A36" }}>All rights reserved</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ── Feature text column (extracted to avoid duplication) ─────────── */

function FeatureText({ f }: { f: typeof FEATURES[number] }) {
  const mono = "'IBM Plex Mono', monospace";
  const sans = "'Space Grotesk', sans-serif";
  return (
    <div>
      <div style={{ font: `600 11px/1 ${mono}`, color: f.kickerColor, letterSpacing: 3, textTransform: "uppercase", marginBottom: 24 }}>{f.kicker}</div>
      <h2 style={{ font: `400 40px/1.1 ${sans}`, color: "#F5F0E8", letterSpacing: -1, margin: "0 0 24px" }}>{f.title}</h2>
      <p style={{ font: `400 16px/1.6 ${sans}`, color: "#B8B0A2", margin: "0 0 32px" }}>{f.desc}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {f.bullets.map((b) => (
          <div key={b} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ width: 4, height: 4, background: f.dotColor, borderRadius: 1, flexShrink: 0 }} />
            <span style={{ font: `400 14px ${sans}`, color: "#B8B0A2" }}>{b}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
