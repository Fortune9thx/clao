import type { StateCreator } from "zustand";
import type { ClaoStore, ReputationSlice } from "@/store/types";
import { REPUTATION } from "@/data/reputation";
import { clamp } from "@/lib/utils/format";

const composite = (factors: typeof REPUTATION.factors) =>
  Math.round(factors.reduce((acc, f) => acc + f.value * f.weight, 0));

export const createReputationSlice: StateCreator<ClaoStore, [], [], ReputationSlice> = (
  set,
) => ({
  reputation: REPUTATION,

  bumpReputation: (key, delta) =>
    set((s) => {
      const factors = s.reputation.factors.map((f) =>
        f.key === key ? { ...f, value: clamp(f.value + delta), delta } : f,
      );
      const score = composite(factors);
      return {
        reputation: {
          ...s.reputation,
          factors,
          composite: score,
          history: [...s.reputation.history.slice(-15), score],
        },
      };
    }),
});
