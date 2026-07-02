import { create } from "zustand";
import type { ClaoStore } from "./types";
import { createDaoSlice } from "./slices/daoSlice";
import { createProposalSlice } from "./slices/proposalSlice";
import { createValidationSlice } from "./slices/validationSlice";
import { createClaoSlice } from "./slices/claoSlice";
import { createReputationSlice } from "./slices/reputationSlice";
import { createMemorySlice } from "./slices/memorySlice";
import { createDisputeSlice } from "./slices/disputeSlice";
import { createGenLayerSlice } from "./slices/genlayerSlice";
import { createOrchestrationSlice } from "./slices/orchestration";

// The CLAO command-center store — composed from independent, individually-typed
// slices. Orchestration is layered last so its cross-cutting actions can call
// into every other slice.
export const useClaoStore = create<ClaoStore>()((...a) => ({
  ...createDaoSlice(...a),
  ...createProposalSlice(...a),
  ...createValidationSlice(...a),
  ...createClaoSlice(...a),
  ...createReputationSlice(...a),
  ...createMemorySlice(...a),
  ...createDisputeSlice(...a),
  ...createGenLayerSlice(...a),
  ...createOrchestrationSlice(...a),
}));
