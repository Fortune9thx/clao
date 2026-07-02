import type { StateCreator } from "zustand";
import type { ClaoStore, DisputeSlice } from "@/store/types";

export const createDisputeSlice: StateCreator<ClaoStore, [], [], DisputeSlice> = (set) => ({
  dispute: { open: false },

  setDispute: (patch) => set((s) => ({ dispute: { ...s.dispute, ...patch } })),
});
