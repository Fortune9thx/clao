import type { StateCreator } from "zustand";
import type { ClaoStore, ProposalSlice } from "@/store/types";
import { PROPOSALS } from "@/data/mockDao";

export const createProposalSlice: StateCreator<ClaoStore, [], [], ProposalSlice> = (
  set,
  get,
) => ({
  proposals: PROPOSALS,
  selectedProposalId: PROPOSALS[0]?.id ?? null,

  selectProposal: (id) => {
    if (get().selectedProposalId === id && get().validation.active) return;
    set({ selectedProposalId: id });
    const proposal = get().proposals.find((p) => p.id === id);
    // Selecting a proposal primes the validation stage + wakes CLAO.
    get().resetValidation();
    get()._setValidation({ proposalId: id });
    get().fireTrigger("proposalSelected");
    get().setMood("explaining", `Reviewing ${proposal?.id ?? "proposal"}…`);
  },

  patchProposal: (id, patch) =>
    set((s) => ({
      proposals: s.proposals.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    })),
});
