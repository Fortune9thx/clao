import { motion } from "framer-motion";
import { useViewStore, type ScreenId } from "@/store/useViewStore";

interface IconDef {
  id: ScreenId;
  label: string;
  icon: React.ReactNode;
  badge?: boolean;
}

function NavIcon({ def }: { def: IconDef }) {
  const screen          = useViewStore((s) => s.screen);
  const go              = useViewStore((s) => s.go);
  const active          = screen === def.id;

  return (
    <motion.button
      onClick={() => go(def.id)}
      title={def.label}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.90 }}
      transition={{ type: "spring", stiffness: 500, damping: 28 }}
      className="relative flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-[7px] border-0 p-0"
      style={{ background: active ? "rgba(255,255,255,.07)" : "transparent", position: "relative" }}
    >
      {/* Active left-edge indicator */}
      {active && (
        <motion.span
          layoutId="sidebar-active"
          style={{
            position: "absolute",
            left: -10,
            top: "50%",
            translateY: "-50%",
            width: 3,
            height: 18,
            borderRadius: 2,
            background: "#8B5CF6",
            boxShadow: "0 0 8px rgba(139,92,246,.6)",
          }}
          transition={{ type: "spring", stiffness: 480, damping: 34 }}
        />
      )}
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke={active ? "#E0E0E0" : "#6B6560"}
        strokeWidth="1.8"
        style={{ transition: "stroke .15s" }}
      >
        {def.icon}
      </svg>
      {def.badge && (
        <span className="absolute right-1.5 top-1.5 h-[5px] w-[5px] rounded-full bg-danger" />
      )}
    </motion.button>
  );
}

const MAIN_ICONS: IconDef[] = [
  {
    id: "home",
    label: "Command Center",
    icon: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="4" rx="1" />
        <rect x="14" y="11" width="7" height="10" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
      </>
    ),
  },
  {
    id: "proposals",
    label: "Proposals",
    icon: (
      <>
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="9" y1="15" x2="15" y2="15" />
        <line x1="9" y1="11" x2="13" y2="11" />
      </>
    ),
  },
  {
    id: "memory",
    label: "Institutional Memory",
    icon: (
      <>
        <circle cx="12" cy="12" r="3" />
        <circle cx="5" cy="6" r="2" />
        <circle cx="19" cy="6" r="2" />
        <circle cx="5" cy="18" r="2" />
        <circle cx="19" cy="18" r="2" />
        <line x1="9.5" y1="10" x2="6.5" y2="7.5" />
        <line x1="14.5" y1="10" x2="17.5" y2="7.5" />
        <line x1="9.5" y1="14" x2="6.5" y2="16.5" />
        <line x1="14.5" y1="14" x2="17.5" y2="16.5" />
      </>
    ),
  },
  {
    id: "reputation",
    label: "Reputation Engine",
    icon: (
      <>
        <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </>
    ),
  },
  {
    id: "disputes",
    label: "Disputes",
    badge: true,
    icon: (
      <>
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </>
    ),
  },
];

const SETTINGS_ICON: IconDef = {
  id: "settings",
  label: "Settings",
  icon: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </>
  ),
};

export function Sidebar() {
  const go              = useViewStore((s) => s.go);
  const openNewProposal = useViewStore((s) => s.openNewProposal);

  return (
    <div
      className="flex w-[60px] shrink-0 flex-col items-center gap-1 py-3"
      style={{ background: "#111113", borderRight: "1px solid rgba(255,255,255,.06)" }}
    >
      {/* Logo */}
      <motion.button
        onClick={() => go("home")}
        title="CLAO"
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.93 }}
        transition={{ type: "spring", stiffness: 500, damping: 28 }}
        className="mb-[14px] flex w-9 cursor-pointer flex-col items-center gap-[3px] border-0 bg-transparent p-0"
      >
        <span className="h-[1.5px] w-5" style={{ background: "linear-gradient(90deg,#C0C0C0,#505050)" }} />
        <span className="ml-[3px] h-[1.5px] w-5" style={{ background: "linear-gradient(90deg,#A0A0A0,#404040)" }} />
        <span className="ml-1.5 h-[1.5px] w-5" style={{ background: "linear-gradient(90deg,#808080,#303030)" }} />
      </motion.button>

      {/* New Proposal "+" button */}
      <motion.button
        onClick={openNewProposal}
        title="New Proposal"
        whileHover={{ scale: 1.1, background: "rgba(139,92,246,.14)" }}
        whileTap={{ scale: 0.90 }}
        transition={{ type: "spring", stiffness: 500, damping: 28 }}
        className="mb-2 flex h-[28px] w-[28px] cursor-pointer items-center justify-center rounded-[6px] border-0"
        style={{ background: "rgba(139,92,246,.08)", border: "1px solid rgba(139,92,246,.18)" }}
      >
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
          <line x1="5.5" y1="1" x2="5.5" y2="10" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="1" y1="5.5" x2="10" y2="5.5" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </motion.button>

      {MAIN_ICONS.map((def) => (
        <NavIcon key={def.id} def={def} />
      ))}

      <div className="flex-1" />

      <NavIcon def={SETTINGS_ICON} />
      <div
        className="mt-1.5 h-[30px] w-[30px] rounded-full"
        style={{ background: "#1A1A1E", border: "1px solid rgba(255,255,255,.06)" }}
      />
    </div>
  );
}
