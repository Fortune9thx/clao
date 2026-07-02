import type { StateCreator } from "zustand";
import type { ClaoStore, MemorySlice } from "@/store/types";
import { MEMORY_EVENTS } from "@/data/mockMemory";

export const createMemorySlice: StateCreator<ClaoStore, [], [], MemorySlice> = (set) => ({
  memory: MEMORY_EVENTS,

  addMemoryEvent: (event) =>
    set((s) => ({
      // Append chronologically; the timeline renders left→right by timestamp.
      memory: [...s.memory, event],
    })),
});
