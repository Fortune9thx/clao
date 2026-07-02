import type { StateCreator } from "zustand";
import type { ClaoStore, GenLayerSlice } from "@/store/types";
import type { TxRecord } from "@/types";
import { claoContract } from "@/lib/genlayer/claoContract";
import { connectLive } from "@/lib/genlayer/client";
import { CONTRACT_ADDRESS } from "@/lib/genlayer/abi";
import { toast } from "@/store/useToastStore";

let txCounter = 0;

export const createGenLayerSlice: StateCreator<ClaoStore, [], [], GenLayerSlice> = (
  set,
  get,
) => ({
  connection: {
    status: "disconnected",
    chain: "studionet",
    contractAddress: CONTRACT_ADDRESS,
    live: false,
  },
  txs: [],

  addTx: (method, label) => {
    const id = `tx-${++txCounter}`;
    const record: TxRecord = {
      id,
      method,
      label,
      status: "signing",
      timestamp: Date.now(),
      live: claoContract.live,
    };
    set((s) => ({ txs: [record, ...s.txs].slice(0, 20) }));
    return id;
  },

  updateTx: (id, patch) =>
    set((s) => ({
      txs: s.txs.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    })),

  connectWallet: async (walletAddress?: `0x${string}`) => {
    set((s) => ({ connection: { ...s.connection, status: "connecting" } }));
    try {
      const { gateway, address, network } = await connectLive(walletAddress);
      claoContract.setGateway(gateway);
      set((s) => ({
        connection: {
          ...s.connection,
          status: "connected",
          address,
          chain: network,
          live: true,
          contractAddress: CONTRACT_ADDRESS,
        },
      }));
      get().setMood("success", `Live on ${network}`);
      toast.success(`Connected to GenLayer ${network}`, address);

      // Re-hydrate from chain to sync any on-chain state changes since last load.
      // Do NOT call bootstrapDao() here — App.tsx calls it on mount. Re-calling
      // would attempt to re-submit proposals that already exist on-chain, causing
      // "proposal already exists" contract errors.
      await get().hydrateFromChain();
    } catch (err) {
      const msg = err instanceof Error
        ? err.message
        : typeof err === "object" && err !== null
          ? JSON.stringify(err)
          : String(err);

      const lower = msg.toLowerCase();

      const isNoContract  = lower.includes("vite_clao_address") || lower.includes("not deployed");
      const isNoWallet    = lower.includes("eip-1193") || lower.includes("metamask");
      const isUserReject  = lower.includes("user rejected") || msg.includes("4001");
      const isPending     = lower.includes("already pending");
      const isWrongNet    = lower.includes("network") || lower.includes("chain");

      const newStatus = isNoWallet || isUserReject || isPending
        ? "disconnected"
        : isNoContract || isWrongNet
          ? "wrong_network"
          : "disconnected";

      const userMessage = isPending
        ? "A wallet request is already open — check MetaMask."
        : isNoContract
          ? "Contract not deployed — run `npm run gen:deploy` and set VITE_CLAO_ADDRESS."
          : isNoWallet
            ? "No wallet detected — install MetaMask to go live."
            : isUserReject
              ? "Connection cancelled."
              : isWrongNet
                ? "Switch MetaMask to GenLayer Studionet."
                : msg.length > 120 ? msg.slice(0, 120) + "…" : msg;

      console.warn("[CLAO] connectWallet failed, falling back to mock:", msg);
      set((s) => ({
        connection: { ...s.connection, status: newStatus },
        connectionError: userMessage,
      }));

      // Only show a toast for actionable errors — not for user-cancelled flows.
      if (!isUserReject) {
        toast.warning("Connection failed", userMessage);
      }
      get().setMood(isUserReject ? "idle" : "warning", userMessage);
    }
  },
});
