import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sidebar } from "@/shell/Sidebar";
import { TopBar } from "@/shell/TopBar";
import { LandingPage } from "@/screens/LandingPage";
import { CommandCenter } from "@/screens/CommandCenter";
import { ProposalDetail } from "@/screens/ProposalDetail";
import { InstitutionalMemory } from "@/screens/InstitutionalMemory";
import { ReputationEngine } from "@/screens/ReputationEngine";
import { DisputeDetail } from "@/screens/DisputeDetail";
import { Settings } from "@/screens/Settings";
import { ToastContainer } from "@/components/Toast";
import { CommandPalette } from "@/components/CommandPalette";
import { SubmitProposalModal } from "@/components/SubmitProposalModal";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useClaoStore } from "@/store/useClaoStore";
import { useViewStore, type ScreenId } from "@/store/useViewStore";

const SCREEN_COMPONENT: Record<ScreenId, React.FC> = {
  home:       CommandCenter,
  proposals:  ProposalDetail,
  memory:     InstitutionalMemory,
  reputation: ReputationEngine,
  disputes:   DisputeDetail,
  settings:   Settings,
};

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
                      <Screen />
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
