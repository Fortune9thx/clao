import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ConnectButton, useChainModal } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useClaoStore } from "@/store/useClaoStore";
import { useConnection } from "@/store/selectors";
import { useViewStore, SCREEN_TITLES } from "@/store/useViewStore";
import { SUPPORTED_CHAIN_IDS } from "@/lib/wagmi/config";

/** Syncs RainbowKit wallet state into the CLAO Zustand store.
 *  Only triggers when the user has entered the app (not on the landing page). */
function useWalletSync() {
  const { address, isConnected } = useAccount();
  const connectWallet = useClaoStore((s) => s.connectWallet);
  const connection = useConnection();
  const showLanding = useViewStore((s) => s.showLanding);

  useEffect(() => {
    if (showLanding) return;
    if (isConnected && address && connection.status !== "connected") {
      void connectWallet(address);
    }
  }, [isConnected, address, connection.status, connectWallet, showLanding]);
}

/** Full-width dismissable banner when wallet is on a non-GenLayer chain.
 *  Animates in/out via Framer Motion height transition. */
function NetworkGuard() {
  const { chain, isConnected } = useAccount();
  const { openChainModal } = useChainModal();
  const [dismissed, setDismissed] = useState(false);

  const wrongChain = isConnected && !!chain && !SUPPORTED_CHAIN_IDS.has(chain.id);

  // Auto-reset dismiss once the user fixes their chain.
  useEffect(() => {
    if (!wrongChain) setDismissed(false);
  }, [wrongChain]);

  const visible = wrongChain && !dismissed;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="net-guard"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 36, opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          style={{
            overflow: "hidden",
            background: "rgba(239,68,68,.07)",
            borderBottom: "1px solid rgba(239,68,68,.18)",
            flexShrink: 0,
          }}
        >
          <div className="flex h-full items-center justify-between px-5">
            <div className="flex items-center gap-2">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.2">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span
                className="mono text-[10px]"
                style={{ color: "#EF4444", letterSpacing: "0.02em" }}
              >
                Wrong network — switch to GenLayer Studionet or Bradbury to interact with CLAO
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={openChainModal}
                className="mono rounded px-2 py-0.5 text-[10px] font-semibold"
                style={{
                  background: "rgba(239,68,68,.14)",
                  color: "#EF4444",
                  border: "1px solid rgba(239,68,68,.28)",
                  cursor: "pointer",
                }}
              >
                Switch Network
              </button>
              <button
                onClick={() => setDismissed(true)}
                style={{ color: "#6B6560", cursor: "pointer", background: "none", border: "none", fontSize: 11, lineHeight: 1 }}
                title="Dismiss"
              >
                ✕
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function WalletChip() {
  useWalletSync();
  const connection = useConnection();
  const live = connection.status === "connected";

  return (
    <ConnectButton.Custom>
      {({ account, chain, openConnectModal, openAccountModal, openChainModal, mounted }) => {
        const rbConnected = mounted && !!account && !!chain;
        const wrongChain = rbConnected && chain.unsupported;
        const onClick = !rbConnected
          ? openConnectModal
          : wrongChain
            ? openChainModal
            : openAccountModal;

        return (
          <button
            onClick={onClick}
            className="hov-chip flex cursor-pointer items-center gap-[5px] rounded px-2.5 py-1"
            style={{
              background: "rgba(255,255,255,.04)",
              border: "1px solid rgba(255,255,255,.06)",
            }}
            title={
              !rbConnected
                ? "Connect wallet"
                : wrongChain
                  ? "Wrong network — switch to GenLayer Studionet"
                  : `${connection.chain ?? "GenLayer"}${live ? " · live" : ""}`
            }
          >
            <span
              className="h-[5px] w-[5px] rounded-full"
              style={{
                background: !rbConnected ? "#6B6560" : wrongChain ? "#EF4444" : live ? "#10B981" : "#F59E0B",
              }}
            />
            <span className="mono text-[10px] font-medium" style={{ color: "#B8B0A2" }}>
              {rbConnected ? account.displayName : "Connect Wallet"}
            </span>
          </button>
        );
      }}
    </ConnectButton.Custom>
  );
}

export function TopBar() {
  const screen = useViewStore((s) => s.screen);
  const dao = useClaoStore((s) => s.currentDAO);

  return (
    <div style={{ flexShrink: 0 }}>
      <NetworkGuard />
      <div
        className="flex h-12 items-center justify-between px-5"
        style={{ background: "#111113", borderBottom: "1px solid rgba(255,255,255,.06)" }}
      >
        <div className="flex items-center gap-3.5">
          {/* DAO switcher */}
          <div
            className="hov-chip flex cursor-pointer items-center gap-1.5 rounded-[5px] px-2.5 py-1"
            style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.06)" }}
          >
            <span
              className="flex h-[13px] w-[13px] items-center justify-center rounded-sm"
              style={{ background: "#1A1A1E", border: "1px solid rgba(255,255,255,.08)" }}
            >
              <span className="text-[6px] font-bold" style={{ color: "#B8B0A2" }}>
                {(dao?.name ?? "Bradbury")[0]}
              </span>
            </span>
            <span className="text-[11px] font-medium" style={{ color: "#F5F0E8" }}>
              {dao?.name ?? "Bradbury Alpha DAO"}
            </span>
            <span className="text-[8px]" style={{ color: "#3D3A36" }}>▾</span>
          </div>
          <span className="text-xs font-medium" style={{ color: "#B8B0A2" }}>
            {SCREEN_TITLES[screen]}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div
            className="w-40 rounded px-2.5 py-[5px] text-[10px]"
            style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.06)", color: "#3D3A36" }}
          >
            ⌘K Search...
          </div>
          <button
            className="hov-chip relative flex h-7 w-7 cursor-pointer items-center justify-center rounded-[5px] border-0"
            style={{ background: "rgba(255,255,255,.04)" }}
            title="Notifications"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6B6560" strokeWidth="1.8">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 01-3.46 0" />
            </svg>
            <span className="absolute right-1 top-1 h-[5px] w-[5px] rounded-full bg-danger" />
          </button>
          <WalletChip />
        </div>
      </div>
    </div>
  );
}
