import type { StateCreator } from "zustand";
import type { ClaoStore, ClaoSlice } from "@/store/types";
import type { ClaoMood } from "@/types";

const MOOD_LABELS: Record<ClaoMood, string> = {
  idle: "Observing", thinking: "Reasoning", explaining: "Explaining",
  listening: "Listening", success: "Validated", warning: "Caution", alert: "Anomaly",
};

export const createClaoSlice: StateCreator<ClaoStore, [], [], ClaoSlice> = (set) => ({
  clao: {
    mood: "idle",
    caption: "Observing the organization",
    excitementLevel: 30,
    confidenceLevel: 70,
    pendingTrigger: null,
  },

  setMood: (mood, caption) =>
    set((s) => ({
      clao: {
        ...s.clao,
        mood,
        caption: caption ?? MOOD_LABELS[mood],
      },
    })),

  setLevels: (levels) => set((s) => ({ clao: { ...s.clao, ...levels } })),

  fireTrigger: (trigger) => set((s) => ({ clao: { ...s.clao, pendingTrigger: trigger } })),

  consumeTrigger: () => set((s) => ({ clao: { ...s.clao, pendingTrigger: null } })),
});
