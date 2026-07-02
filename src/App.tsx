import { lazy, Suspense, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sidebar } from "@/shell/Sidebar";
import { TopBar } from "@/shell/TopBar";
import { LandingPage } from "@/screens/LandingPage";
import { ToastContainer } from "@/components/Toast";
import { CommandPalette } from "@/components/CommandPalette";
import { SubmitProposalModal } from "@/components/SubmitProposalModal";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useClaoStore } from "@/store/useClaoStore";
import { useViewStore, type ScreenId } from "@/store/useViewStore";

// Lazy-load each screen so they split into separate chunks.
// Named exports require the .then(m => ({ default: m.X })) unwrap.
const CommandCenter      = lazy(() => import("@/screens/CommandCenter").then(m => ({ default: m.CommandCenter })));
const ProposalDetail     = lazy(() => import("@/screens/ProposalDetail").then(m => ({ default: m.ProposalDetail })));
const InstitutionalMemory = lazy(() => import("@/screens/InstitutionalMemory").then(m => ({ default: m.InstitutionalMemory })));
const ReputationEngine   = lazy(() => import("@/screens/ReputationEngine").then(m => ({ default: m.ReputationEngine })));
const DisputeDetail      = lazy(() => import("@/screens/DisputeDetail").then(m => ({ default: m.DisputeDetail })));
const Settings           = lazy(() => import("@/screens/Settings").then(m => ({ default: m.Settings })));

const SCREEN_COMPONENT: Record<ScreenId, React.LazyExoticComponent<React.FC>> = {
  home:       CommandCenter,
  proposals:  ProposalDetail,
  memory:     InstitutionalMemory,
  reputation: ReputationEngine,
  disputes:   DisputeDetail,
  settings:   Settings,
};

function ScreenFallback() {
  return (
    <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 20, height: 20, border: "1.5px solid rgba(139,92,246,.3)", borderTopColor: "#8B5CF6", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
    </div>
  );
}

export default function App() {
  const bootstrapDao = useClaoStore((s) => s.bootstrapDao);
  const showLanding  = useViewStore((s) => s.showLanding);
  const screen       = useViewStore((s) => s.screen);
  const booted       = useRef(false);

  useEffect(() => {
    if (booted.current) return;
    booted.current = true;
    void bootstrapDao();
  }, [bootstrapDao]);

  const Screen = SCREEN_COMPONENT[screen];

  return (
    <>
      <AnimatePresence mode="wait">
        {showLanding ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{ position: "fixed", inset: 0, overflowY: "auto" }}
          >
            <LandingPage />
          </motion.div>
        ) : (
          <motion.div
            key="app"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh", display: "flex", background: "#0D0D0F", overflow: "hidden" }}
          >
            <Sidebar />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <TopBar />
              <div style={{ flex: 1, overflow: "auto", position: "relative" }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={screen}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    style={{ position: "absolute", inset: 0 }}
                  >
                    <ErrorBoundary name={screen}>
                      <Suspense fallback={<ScreenFallback />}>
                        <Screen />
                      </Suspense>
                    </ErrorBoundary>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global overlays — outside app shell so they always render on top */}
      <CommandPalette />
      <SubmitProposalModal />
      <ToastContainer />
    </>
  );
}
