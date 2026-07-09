import type { StateCreator } from "zustand";
import type { ClaoStore, MemorySlice } from "@/store/types";

// Memory starts empty and hydrates from the on-chain append-only ledger.
export const createMemorySlice: StateCreator<ClaoStore, [], [], MemorySlice> = (set) => ({
  memory: [],

  addMemoryEvent: (event) =>
    set((s) => ({
      // Append chronologically; the timeline renders left→right by timestamp.
      memory: [...s.memory, event],
    })),
});
