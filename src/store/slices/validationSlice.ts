import type { StateCreator } from "zustand";
import type { ClaoStore, ValidationSlice } from "@/store/types";
import type { ValidatorNode } from "@/types";

export const seedNodes = (): ValidatorNode[] => [
  { id: "v-alpha", label: "Validator α", stance: "pending", weight: 0.26, confidence: 0 },
  { id: "v-beta", label: "Validator β", stance: "pending", weight: 0.22, confidence: 0 },
  { id: "v-gamma", label: "Validator γ", stance: "pending", weight: 0.2, confidence: 0 },
  { id: "v-delta", label: "Validator δ", stance: "pending", weight: 0.18, confidence: 0 },
  { id: "v-epsilon", label: "Validator ε", stance: "pending", weight: 0.14, confidence: 0 },
];

const MAX_LOG = 14;

export const createValidationSlice: StateCreator<ClaoStore, [], [], ValidationSlice> = (
  set,
) => ({
  validation: {
    active: false,
    phase: "idle",
    agreement: 0,
    nodes: seedNodes(),
    log: [],
  },

  resetValidation: () =>
    set({
      validation: {
        active: false,
        phase: "idle",
        agreement: 0,
        nodes: seedNodes(),
        log: [],
      },
    }),

  _setValidation: (patch) =>
    set((s) => ({ validation: { ...s.validation, ...patch } })),

  _pushReasoning: (text, kind) =>
    set((s) => ({
      validation: {
        ...s.validation,
        log: [
          ...s.validation.log.slice(-(MAX_LOG - 1)),
          { id: `r-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, t: Date.now(), kind, text },
        ],
      },
    })),
});
