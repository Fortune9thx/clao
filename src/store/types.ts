import type {
  CurrentDAO,
  GovernanceProfile,
  GovernanceEngineState,
  TreasuryState,
  Proposal,
  ClaoState,
  ClaoMood,
  ClaoTrigger,
  ReputationState,
  MemoryEvent,
  DisputeState,
  ValidationState,
  GenLayerConnection,
  TxRecord,
  ContractWriteMethod,
} from "@/types";

// Full store shape. Each slice creator below is typed against this so slices
// can orchestrate across one another (e.g. running validation also moves the
// CLAO character + appends to institutional memory).

export interface DaoSlice {
  currentDAO: CurrentDAO;
  governanceProfile: GovernanceProfile;
  governanceEngine: GovernanceEngineState;
  treasury: TreasuryState;
  applyTreasuryRelease: (amount: number, tx: string) => void;
  nudgeGovernancePressure: (delta: number) => void;
}

export interface ProposalSlice {
  proposals: Proposal[];
  selectedProposalId: string | null;
  selectProposal: (id: string) => void;
  patchProposal: (id: string, patch: Partial<Proposal>) => void;
}

export interface ValidationSlice {
  validation: ValidationState;
  resetValidation: () => void;
  _setValidation: (patch: Partial<ValidationState>) => void;
  _pushReasoning: (text: string, kind: import("@/types").ReasoningKind) => void;
}

export interface ClaoSlice {
  clao: ClaoState;
  setMood: (mood: ClaoMood, caption?: string) => void;
  setLevels: (levels: Partial<Pick<ClaoState, "excitementLevel" | "confidenceLevel">>) => void;
  fireTrigger: (trigger: ClaoTrigger) => void;
  consumeTrigger: () => void;
}

export interface ReputationSlice {
  reputation: ReputationState;
  bumpReputation: (key: ReputationState["factors"][number]["key"], delta: number) => void;
}

export interface MemorySlice {
  memory: MemoryEvent[];
  addMemoryEvent: (event: MemoryEvent) => void;
}

export interface DisputeSlice {
  dispute: DisputeState;
  setDispute: (patch: Partial<DisputeState>) => void;
}

export interface GenLayerSlice {
  connection: GenLayerConnection;
  connectionError?: string;
  txs: TxRecord[];
  addTx: (method: ContractWriteMethod, label: string) => string;
  updateTx: (id: string, patch: Partial<TxRecord>) => void;
  connectWallet: (walletAddress?: `0x${string}`) => Promise<void>;
}

/** Cross-cutting orchestration — the verbs the UI actually calls. Each performs
 *  a real contract write (mock or live) and choreographs the whole command
 *  center: CLAO character, validation stream, treasury, memory. */
export interface OrchestrationSlice {
  /** Pull get_complete_storage and reconcile proposals/memory/treasury. */
  hydrateFromChain: () => Promise<void>;
  hydrating: boolean;
  lastSyncedAt: number | null;
  submitProposal: (title: string, amount: string, proposer?: string) => Promise<void>;
  runValidation: (proposalId: string) => Promise<void>;
  pinRuling: (proposalId: string) => Promise<void>;
  simulateExecution: (proposalId: string) => Promise<void>;
  challengeVerdict: (proposalId: string, reason?: string) => Promise<void>;
  adjudicateDispute: () => Promise<void>;
  commitReputation: (
    key: ReputationState["factors"][number]["key"],
    delta: number,
  ) => Promise<void>;
  bootstrapDao: () => Promise<void>;
}

export type ClaoStore = DaoSlice &
  ProposalSlice &
  ValidationSlice &
  ClaoSlice &
  ReputationSlice &
  MemorySlice &
  DisputeSlice &
  GenLayerSlice &
  OrchestrationSlice;
