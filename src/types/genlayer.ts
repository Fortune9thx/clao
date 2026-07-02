// GenLayer integration types — the bridge between UI actions and on-chain writes.

export type GlChainName = "studionet" | "testnetBradbury" | "testnetAsimov" | "localnet";

/** All write methods exposed by the CLAORegistry intelligent contract.
 *  Keeping these as a union means every UI action references a real,
 *  type-checked contract entrypoint (no "useless" unused methods). */
export type ContractWriteMethod =
  | "register_dao"
  | "submit_proposal"
  | "cast_cognitive_vote"
  | "record_ruling"
  | "open_dispute"
  | "resolve_dispute"
  | "finalize_execution"
  | "update_reputation";

export type ContractViewMethod =
  | "get_dao"
  | "get_proposal"
  | "get_memory_timeline"
  | "get_reputation"
  | "get_complete_storage";

export type TxLifecycle =
  | "idle"
  | "signing"
  | "pending" // optimistic / ACCEPTED
  | "finalized" // FINALIZED on chain
  | "failed";

export interface TxRecord {
  id: string;
  method: ContractWriteMethod;
  label: string;
  hash?: string;
  status: TxLifecycle;
  timestamp: number;
  /** Whether this ran against the live contract or the mock provider. */
  live: boolean;
  args?: unknown[];
}

export type WalletStatus = "disconnected" | "connecting" | "connected" | "wrong_network";

// --- On-chain read shapes (mirror CLAORegistry view returns) ---------------

export interface ChainProposal {
  id: string;
  title: string;
  proposer: string;
  amount: number;
  status: string;
  quorum_required: number;
  agreement: number;
  reasoning: string;
}

export interface ChainMemoryEntry {
  seq: number;
  kind: string;
  proposal_id: string;
  title: string;
  verdict: string;
  summary: string;
}

export interface ChainDispute {
  id: string;
  proposal_id: string;
  reason: string;
  status: string;
  outcome: string;
}

export interface ChainStorage {
  dao: { id: string; name: string; treasury_label: string; treasury_released: number };
  proposals: ChainProposal[];
  disputes: ChainDispute[];
  memory: ChainMemoryEntry[];
}

export interface GenLayerConnection {
  status: WalletStatus;
  address?: `0x${string}`;
  chain: GlChainName;
  contractAddress?: `0x${string}`;
  /** True when a real deployed address + provider are available. */
  live: boolean;
}
