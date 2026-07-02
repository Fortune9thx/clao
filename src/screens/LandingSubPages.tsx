import type { LandingPageId } from "@/store/useViewStore";

const mono = "'IBM Plex Mono', monospace";
const sans = "'Space Grotesk', sans-serif";

/* ── Shared wrapper ──────────────────────────────────────────────────── */

function SubPageShell({
  title,
  kicker,
  updated,
  onBack,
  children,
}: {
  title: string;
  kicker: string;
  updated?: string;
  onBack: () => void;
  children: React.ReactNode;
}) {
  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "120px 32px 96px" }}>
      <button
        onClick={onBack}
        style={{ font: `500 12px ${mono}`, color: "#6B6560", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, marginBottom: 48, letterSpacing: 0.5 }}
      >
        ← Back to CLAO
      </button>
      <div style={{ font: `600 10px ${mono}`, color: "#8B5CF6", letterSpacing: 3, textTransform: "uppercase", marginBottom: 16 }}>{kicker}</div>
      <h1 style={{ font: `300 48px/1.05 ${sans}`, color: "#F5F0E8", letterSpacing: -1.5, margin: "0 0 16px" }}>{title}</h1>
      {updated && <div style={{ font: `400 12px ${mono}`, color: "#3D3A36", marginBottom: 56 }}>Last updated: {updated}</div>}
      <div style={{ borderTop: "1px solid rgba(255,255,255,.06)", paddingTop: 48 }}>{children}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 48 }}>
      <h2 style={{ font: `500 16px/1.3 ${sans}`, color: "#F5F0E8", margin: "0 0 16px" }}>{title}</h2>
      <div style={{ font: `400 15px/1.8 ${sans}`, color: "#B8B0A2" }}>{children}</div>
    </div>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p style={{ margin: "0 0 14px" }}>{children}</p>;
}

function UL({ items }: { items: string[] }) {
  return (
    <ul style={{ margin: "0 0 14px", paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
      {items.map((item, i) => (
        <li key={i} style={{ font: `400 15px/1.6 ${sans}`, color: "#B8B0A2" }}>{item}</li>
      ))}
    </ul>
  );
}

/* ── Terms of Use ────────────────────────────────────────────────────── */

export function TermsPage({ onBack }: { onBack: () => void }) {
  return (
    <SubPageShell title="Terms of Use" kicker="Legal" updated="July 2026" onBack={onBack}>
      <Section title="1. Acceptance of Terms">
        <P>By accessing or using CLAO ("the Platform"), you agree to be bound by these Terms of Use. If you do not agree, do not use the Platform. CLAO is a governance intelligence layer built on the GenLayer blockchain network, designed for decentralized autonomous organizations (DAOs).</P>
      </Section>

      <Section title="2. Platform Description">
        <P>CLAO provides AI-assisted governance tooling including proposal submission, validator-based consensus, reputation scoring, institutional memory, and dispute resolution — all operating through intelligent contracts deployed on the GenLayer network.</P>
        <P>The Platform is a software interface. CLAO does not custody funds, execute treasury actions directly, or make governance decisions on behalf of any DAO or participant.</P>
      </Section>

      <Section title="3. Wallet Connection & On-Chain Activity">
        <P>To interact with CLAO's live features, you must connect a compatible Web3 wallet (e.g. MetaMask). By connecting your wallet:</P>
        <UL items={[
          "You authorize the Platform to read your wallet address and on-chain state for display purposes.",
          "All write transactions require your explicit cryptographic signature — CLAO never submits transactions without your approval.",
          "You are solely responsible for safeguarding your private keys and seed phrase. CLAO has no ability to recover lost credentials.",
          "Transaction fees (gas) on the GenLayer network are your responsibility.",
        ]} />
      </Section>

      <Section title="4. Governance Participation">
        <P>Proposals, votes, and rulings submitted through CLAO are executed on-chain and are irreversible once finalized. You are responsible for reviewing all governance actions before signing. CLAO's AI validators provide reasoning and analysis — their outputs are advisory and do not constitute binding legal or financial decisions.</P>
      </Section>

      <Section title="5. No Financial Advice">
        <P>Nothing on the Platform constitutes financial, investment, legal, or tax advice. CLAO's reputation scores, proposal analysis, and validator reasoning are informational tools only. You should conduct your own due diligence and consult qualified professionals before making governance or financial decisions.</P>
      </Section>

      <Section title="6. Limitation of Liability">
        <P>To the maximum extent permitted by applicable law, CLAO and its contributors shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Platform — including but not limited to loss of funds due to smart contract vulnerabilities, network failures, or governance outcomes.</P>
        <P>The Platform is provided "as is" and "as available" without warranties of any kind, express or implied.</P>
      </Section>

      <Section title="7. Intellectual Property">
        <P>The CLAO interface, branding, and source code are proprietary. The underlying CLAORegistry intelligent contract is open for inspection on the GenLayer network. You may not reproduce, distribute, or create derivative works from the Platform's interface without prior written consent.</P>
      </Section>

      <Section title="8. Modifications">
        <P>We reserve the right to modify these Terms at any time. Material changes will be communicated through the Platform. Continued use after changes constitutes acceptance of the updated Terms.</P>
      </Section>

      <Section title="9. Governing Law">
        <P>These Terms shall be governed by and construed in accordance with applicable international law. Disputes shall be resolved through binding arbitration, except where prohibited by local law.</P>
      </Section>

      <Section title="10. Contact">
        <P>For questions regarding these Terms, contact us at <span style={{ color: "#8B5CF6" }}>fortuneemx@gmail.com</span>.</P>
      </Section>
    </SubPageShell>
  );
}

/* ── Privacy Policy ─────────────────────────────────────────────────── */

export function PrivacyPage({ onBack }: { onBack: () => void }) {
  return (
    <SubPageShell title="Privacy Policy" kicker="Legal" updated="July 2026" onBack={onBack}>
      <Section title="1. Overview">
        <P>CLAO is designed with a privacy-first architecture. We do not collect, store, or sell personal data. Your interaction with CLAO is primarily on-chain, meaning your wallet address and governance activity are recorded on the GenLayer public blockchain — not on CLAO's servers.</P>
      </Section>

      <Section title="2. Information We Collect">
        <P>When you use CLAO, the following information may be processed:</P>
        <UL items={[
          "Wallet address — used to identify your governance participation and reputation score on-chain.",
          "On-chain transaction data — proposals submitted, votes cast, disputes filed — all publicly visible on GenLayer.",
          "Browser session data — standard web analytics (page views, referrer) collected anonymously if analytics are enabled. No personally identifiable information is linked.",
          "We do NOT collect: names, email addresses, IP addresses stored long-term, or off-chain behavioral profiles.",
        ]} />
      </Section>

      <Section title="3. How We Use Information">
        <P>Data processed by CLAO is used exclusively to:</P>
        <UL items={[
          "Display your governance history, reputation score, and proposals.",
          "Enable on-chain contract interactions via your connected wallet.",
          "Improve Platform performance through aggregated, anonymous usage analytics.",
        ]} />
      </Section>

      <Section title="4. Third-Party Services">
        <P>CLAO integrates with the following third-party services, each with their own privacy practices:</P>
        <UL items={[
          "GenLayer Network — all smart contract interactions are recorded on the public blockchain.",
          "RainbowKit / wagmi — wallet connection infrastructure. No data is shared with these services beyond what is necessary for wallet connectivity.",
          "MetaMask / Injected Wallets — governed by your wallet provider's privacy policy.",
        ]} />
      </Section>

      <Section title="5. Data Retention">
        <P>On-chain data is permanent and public by the nature of blockchain technology — CLAO cannot delete your on-chain governance history. Off-chain session data (if collected) is retained for no longer than 90 days.</P>
      </Section>

      <Section title="6. Your Rights">
        <P>Since CLAO does not store off-chain personal data, traditional data deletion requests are not applicable. You can disconnect your wallet at any time to stop further on-chain interactions through the Platform. Your on-chain history remains accessible on the public blockchain.</P>
      </Section>

      <Section title="7. Contact">
        <P>For privacy-related inquiries, contact us at <span style={{ color: "#8B5CF6" }}>fortuneemx@gmail.com</span>.</P>
      </Section>
    </SubPageShell>
  );
}

/* ── Disclaimers ─────────────────────────────────────────────────────── */

export function DisclaimersPage({ onBack }: { onBack: () => void }) {
  return (
    <SubPageShell title="Disclaimers" kicker="Legal" updated="July 2026" onBack={onBack}>
      <Section title="Not Financial or Legal Advice">
        <P>All content on the CLAO Platform — including proposal analysis, validator reasoning, reputation scores, dispute outcomes, and AI-generated summaries — is provided for informational and governance coordination purposes only. Nothing on this Platform constitutes financial advice, investment advice, legal advice, or any other professional advice.</P>
        <P>Consult a qualified financial advisor, attorney, or other professional before making decisions based on information provided by CLAO.</P>
      </Section>

      <Section title="Smart Contract Risk">
        <P>CLAO operates through intelligent contracts deployed on the GenLayer network. Smart contracts are software and may contain bugs, vulnerabilities, or behave unexpectedly under edge conditions. Interactions with smart contracts are irreversible. CLAO's contributors cannot reverse on-chain transactions once submitted.</P>
        <UL items={[
          "Always review transaction details before signing.",
          "Never submit more funds or governance actions than you are prepared to have permanently recorded on-chain.",
          "Smart contract audits, while planned, do not guarantee the absence of all vulnerabilities.",
        ]} />
      </Section>

      <Section title="GenLayer Network Risk">
        <P>CLAO is built on GenLayer, an experimental blockchain with subjective AI validators. GenLayer Studionet and Testnet environments are pre-production networks. Network performance, validator availability, and finality times may vary. Mainnet deployment involves additional risks inherent to any public blockchain.</P>
      </Section>

      <Section title="AI Validator Risk">
        <P>CLAO's governance intelligence is powered by LLM-based validators using GenLayer's <span style={{ fontFamily: mono, fontSize: 13, color: "#C4B5FD" }}>eq_principle</span> framework. AI reasoning outputs are probabilistic and may not always reflect the correct or intended governance outcome. Validator consensus should be treated as input to governance decisions, not as authoritative rulings in themselves.</P>
      </Section>

      <Section title="Governance Participation Risk">
        <P>Participating in on-chain governance carries inherent risks. Proposals, once executed, may have irreversible financial or operational consequences for a DAO and its treasury. Participants are solely responsible for the governance actions they initiate, vote on, or support.</P>
      </Section>

      <Section title="Experimental Software">
        <P>CLAO is in active development and is targeting the Bradbury milestone on the GenLayer network. Features may change, APIs may break, and data may be reset between network upgrades. Use on production treasuries or critical governance decisions is at your own risk.</P>
      </Section>

      <Section title="No Warranties">
        <P>THE PLATFORM IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND. CLAO'S CONTRIBUTORS EXPRESSLY DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.</P>
      </Section>
    </SubPageShell>
  );
}

/* ── Blog ────────────────────────────────────────────────────────────── */

const BLOG_POSTS = [
  {
    date: "July 2026",
    tag: "Product",
    tagColor: "#8B5CF6",
    title: "Introducing CLAO: The Cognition Layer for Autonomous Organizations",
    excerpt: "Today we're announcing CLAO — an AI-native governance intelligence layer built on GenLayer's subjective smart contract network. Here's what we're building and why it matters for the future of on-chain governance.",
    readTime: "5 min read",
  },
  {
    date: "June 2026",
    tag: "Technical",
    tagColor: "#3B82F6",
    title: "How GenLayer's Subjective Validators Enable Real Governance Intelligence",
    excerpt: "Traditional smart contracts are deterministic. GenLayer's eq_principle framework enables LLM-backed validators to reason about subjective governance questions — opening the door to a new class of intelligent DAO tooling.",
    readTime: "8 min read",
  },
  {
    date: "June 2026",
    tag: "Governance",
    tagColor: "#10B981",
    title: "The Problem with Current DAO Tooling (And How We're Fixing It)",
    excerpt: "73% of DAO proposals fail due to poor analysis. $890M has been lost to governance attacks. Voter participation averages 12%. These aren't unsolvable problems — they're engineering challenges. CLAO tackles each one head-on.",
    readTime: "6 min read",
  },
  {
    date: "Coming Soon",
    tag: "Deep Dive",
    tagColor: "#F59E0B",
    title: "Reputation Without Tokens: CLAO's Multi-Dimensional Scoring System",
    excerpt: "Token-weighted voting is broken. We built a behavioral reputation system that evaluates voting history, proposal quality, delegation patterns, and on-chain consistency — surfacing genuine governance contributors.",
    readTime: "Coming soon",
    upcoming: true,
  },
  {
    date: "Coming Soon",
    tag: "Deep Dive",
    tagColor: "#F59E0B",
    title: "Institutional Memory: Building a Knowledge Graph for Your DAO",
    excerpt: "Every DAO makes the same mistakes because governance history is locked in forum threads and Notion docs. CLAO's memory graph surfaces precedents, connects proposals, and gives your DAO the institutional knowledge of a world-class organization.",
    readTime: "Coming soon",
    upcoming: true,
  },
];

export function BlogPage({ onBack }: { onBack: () => void }) {
  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "120px 32px 96px" }}>
      <button
        onClick={onBack}
        style={{ font: `500 12px ${mono}`, color: "#6B6560", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, marginBottom: 48, letterSpacing: 0.5 }}
      >
        ← Back to CLAO
      </button>
      <div style={{ font: `600 10px ${mono}`, color: "#8B5CF6", letterSpacing: 3, textTransform: "uppercase", marginBottom: 16 }}>Blog</div>
      <h1 style={{ font: `300 48px/1.05 ${sans}`, color: "#F5F0E8", letterSpacing: -1.5, margin: "0 0 16px" }}>Insights on AI Governance</h1>
      <p style={{ font: `400 16px/1.6 ${sans}`, color: "#6B6560", margin: "0 0 64px" }}>Thinking on DAOs, intelligent contracts, and the future of on-chain coordination.</p>

      <div style={{ borderTop: "1px solid rgba(255,255,255,.06)", display: "flex", flexDirection: "column" }}>
        {BLOG_POSTS.map((post, i) => (
          <div
            key={i}
            style={{
              padding: "40px 0",
              borderBottom: "1px solid rgba(255,255,255,.06)",
              opacity: post.upcoming ? 0.45 : 1,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <span style={{ font: `600 9px ${mono}`, color: post.tagColor, letterSpacing: 2, textTransform: "uppercase", border: `1px solid ${post.tagColor}30`, padding: "3px 8px", borderRadius: 20 }}>{post.tag}</span>
              <span style={{ font: `400 11px ${mono}`, color: "#3D3A36" }}>{post.date}</span>
              <span style={{ font: `400 11px ${mono}`, color: "#3D3A36" }}>·</span>
              <span style={{ font: `400 11px ${mono}`, color: "#3D3A36" }}>{post.readTime}</span>
            </div>
            <h2 style={{ font: `500 22px/1.3 ${sans}`, color: "#F5F0E8", margin: "0 0 12px", letterSpacing: -0.3 }}>{post.title}</h2>
            <p style={{ font: `400 15px/1.7 ${sans}`, color: "#B8B0A2", margin: "0 0 20px", maxWidth: 640 }}>{post.excerpt}</p>
            {!post.upcoming && (
              <span style={{ font: `600 12px ${sans}`, color: "#8B5CF6", cursor: "pointer" }}>Read more →</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Documentation ───────────────────────────────────────────────────── */

const DOC_SECTIONS = [
  {
    title: "Getting Started",
    accent: "#8B5CF6",
    items: [
      { heading: "What is CLAO?", body: "CLAO (Cognition Layer for Autonomous Organizations) is an AI-native governance intelligence platform built on GenLayer. It provides adaptive proposal analysis, reputation scoring, institutional memory, and on-chain dispute resolution — powered by subjective AI validators." },
      { heading: "Supported Networks", body: "CLAO currently operates on GenLayer Studionet (chain ID 61999) for development and GenLayer Bradbury Testnet (chain ID 4221). Production mainnet support will follow GenLayer's mainnet launch." },
      { heading: "Prerequisites", body: "You need a Web3 wallet (MetaMask recommended) and GEN tokens on the GenLayer network for gas fees. Visit the GenLayer faucet to obtain testnet GEN." },
    ],
  },
  {
    title: "Connecting Your Wallet",
    accent: "#3B82F6",
    items: [
      { heading: "Step 1 — Install MetaMask", body: "Download MetaMask from metamask.io and create or import a wallet. Keep your seed phrase secure — CLAO cannot recover it." },
      { heading: "Step 2 — Add GenLayer Network", body: "Click 'Connect Wallet' in the CLAO top bar. CLAO will prompt MetaMask to add the GenLayer Studionet network automatically. Approve the network addition." },
      { heading: "Step 3 — Connect & Sync", body: "Once connected, CLAO syncs your on-chain state — existing proposals, reputation score, and governance history load automatically. The wallet chip turns green when live." },
    ],
  },
  {
    title: "Submitting Proposals",
    accent: "#10B981",
    items: [
      { heading: "Creating a Proposal", body: "Click the '+' button in the sidebar to open the Submit Proposal modal. Enter a title (required), funding amount, and optional description. CLAO submits the proposal to the CLAORegistry intelligent contract on GenLayer." },
      { heading: "Proposal Lifecycle", body: "Proposals move through states: Draft → GenLayer Validation → Validated → Treasury Released (or Rejected / Disputed). Each state transition is recorded on-chain and reflected in real time." },
      { heading: "Running Validation", body: "From the Proposals screen, click 'Run Validators' to trigger CLAO's subjective AI validator network. Validators use GenLayer's eq_principle framework to reason about proposal merit and reach consensus. This can take 1–3 minutes on testnet." },
    ],
  },
  {
    title: "Reputation System",
    accent: "#F59E0B",
    items: [
      { heading: "How Scores Are Calculated", body: "CLAO's reputation engine evaluates four dimensions: Voting Consistency (track record of informed votes), Proposal Quality (outcomes of proposals you've submitted), Delegation Authority (trust extended to you by other members), and Dispute Record (fairness in dispute resolution)." },
      { heading: "Score Range", body: "Scores range from 0–100. Scores above 85 are highlighted green (trusted contributor). 70–84 is yellow (active participant). Below 70 indicates limited governance history." },
      { heading: "Improving Your Score", body: "Participate consistently, submit well-reasoned proposals, avoid governance attacks, and build a track record of accurate votes. Reputation is earned on-chain — it cannot be bought or gamed through token acquisition." },
    ],
  },
  {
    title: "Dispute Resolution",
    accent: "#EF4444",
    items: [
      { heading: "Filing a Dispute", body: "If a governance decision appears improper, members can file a dispute from the Disputes screen. Provide a clear reason for the challenge. Disputes trigger a secondary validator round using CLAO's LLM jury system." },
      { heading: "The Adjudication Process", body: "Three validators independently evaluate the dispute evidence and reach a verdict: Favors Claimant, Favors Respondent, or Undecided. CLAO synthesizes their reasoning and issues a binding on-chain ruling." },
      { heading: "Dispute Outcomes", body: "Resolved disputes are added to the DAO's institutional memory and influence future governance precedents. Parties with a pattern of frivolous disputes see their reputation score affected." },
    ],
  },
];

export function DocsPage({ onBack }: { onBack: () => void }) {
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "120px 32px 96px", display: "grid", gridTemplateColumns: "200px 1fr", gap: 64 }}>
      {/* Sidebar nav */}
      <div style={{ position: "sticky", top: 96, alignSelf: "start" }}>
        <button
          onClick={onBack}
          style={{ font: `500 11px ${mono}`, color: "#6B6560", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, marginBottom: 32, letterSpacing: 0.5 }}
        >
          ← Back
        </button>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {DOC_SECTIONS.map((s) => (
            <a
              key={s.title}
              href={`#doc-${s.title.toLowerCase().replace(/ /g, "-")}`}
              style={{ font: `400 12px ${sans}`, color: "#6B6560", textDecoration: "none", padding: "5px 0", transition: "color .15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#B8B0A2")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#6B6560")}
            >
              {s.title}
            </a>
          ))}
        </div>
      </div>

      {/* Content */}
      <div>
        <div style={{ font: `600 10px ${mono}`, color: "#8B5CF6", letterSpacing: 3, textTransform: "uppercase", marginBottom: 16 }}>Documentation</div>
        <h1 style={{ font: `300 48px/1.05 ${sans}`, color: "#F5F0E8", letterSpacing: -1.5, margin: "0 0 16px" }}>CLAO Developer Docs</h1>
        <p style={{ font: `400 16px/1.6 ${sans}`, color: "#6B6560", margin: "0 0 64px" }}>Everything you need to participate in AI-native governance on GenLayer.</p>

        {DOC_SECTIONS.map((section) => (
          <div key={section.title} id={`doc-${section.title.toLowerCase().replace(/ /g, "-")}`} style={{ marginBottom: 64 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32, paddingBottom: 16, borderBottom: `1px solid ${section.accent}20` }}>
              <span style={{ width: 3, height: 18, background: section.accent, borderRadius: 2, flexShrink: 0 }} />
              <h2 style={{ font: `500 20px ${sans}`, color: "#F5F0E8", margin: 0 }}>{section.title}</h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
              {section.items.map((item) => (
                <div key={item.heading}>
                  <h3 style={{ font: `500 14px ${sans}`, color: "#F5F0E8", margin: "0 0 8px" }}>{item.heading}</h3>
                  <p style={{ font: `400 14px/1.7 ${sans}`, color: "#B8B0A2", margin: 0 }}>{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Router ──────────────────────────────────────────────────────────── */

export function LandingSubPage({ page, onBack }: { page: LandingPageId; onBack: () => void }) {
  switch (page) {
    case "terms":        return <TermsPage onBack={onBack} />;
    case "privacy":      return <PrivacyPage onBack={onBack} />;
    case "disclaimers":  return <DisclaimersPage onBack={onBack} />;
    case "blog":         return <BlogPage onBack={onBack} />;
    case "docs":         return <DocsPage onBack={onBack} />;
    default:             return null;
  }
}
