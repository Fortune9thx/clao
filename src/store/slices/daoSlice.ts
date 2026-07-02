import type { StateCreator } from "zustand";
import type { ClaoStore, DaoSlice } from "@/store/types";
import {
  CURRENT_DAO,
  GOVERNANCE_PROFILE,
  GOVERNANCE_ENGINE,
  TREASURY,
} from "@/data/mockDao";
import { clamp } from "@/lib/utils/format";

export const createDaoSlice: StateCreator<ClaoStore, [], [], DaoSlice> = (set) => ({
  currentDAO: CURRENT_DAO,
  governanceProfile: GOVERNANCE_PROFILE,
  governanceEngine: GOVERNANCE_ENGINE,
  treasury: TREASURY,

  applyTreasuryRelease: (amount, tx) =>
    set((s) => ({
      treasury: {
        ...s.treasury,
        balanceValue: s.treasury.balanceValue - amount,
        released: s.treasury.released + amount,
        reserveRatio: clamp(s.treasury.reserveRatio - amount / 80_000),
        lastReleaseTx: tx,
      },
    })),

  nudgeGovernancePressure: (delta) =>
    set((s) => {
      const next = clamp(s.governanceEngine.governancePressure + delta);
      return {
        governanceEngine: {
          ...s.governanceEngine,
          governancePressure: next,
          pressureSeries: [...s.governanceEngine.pressureSeries.slice(-11), next],
        },
      };
    }),
});
