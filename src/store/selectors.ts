import { useClaoStore } from "./useClaoStore";

// Focused selector hooks — components subscribe to the narrowest slice they
// need so unrelated state changes don't re-render the whole command center.

export const useSelectedProposal = () =>
  useClaoStore((s) => s.proposals.find((p) => p.id === s.selectedProposalId) ?? null);

export const useClaoCharacter = () => useClaoStore((s) => s.clao);
export const useValidation = () => useClaoStore((s) => s.validation);
export const useTreasury = () => useClaoStore((s) => s.treasury);
export const useReputation = () => useClaoStore((s) => s.reputation);
export const useMemory = () => useClaoStore((s) => s.memory);
export const useDispute = () => useClaoStore((s) => s.dispute);
export const useConnection = () => useClaoStore((s) => s.connection);
export const useTxs = () => useClaoStore((s) => s.txs);
export const useGovernanceEngine = () => useClaoStore((s) => s.governanceEngine);
