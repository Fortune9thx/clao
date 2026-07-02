import type { ContractViewMethod, ContractWriteMethod } from "@/types";

// Gateway abstraction: the rest of the app talks to ContractGateway and never
// imports genlayer-js directly. Two implementations exist — LiveGateway
// (real Studionet writes) and MockGateway (local simulation) — selected at
// runtime so the command center is fully interactive before a contract is
// deployed, then flips to live by connecting a wallet + setting VITE_CLAO_ADDRESS.

export interface WriteResult {
  hash: string;
  live: boolean;
  /** Resolves once the tx is FINALIZED on chain (live) or after the simulated
   *  settle delay (mock). The store awaits this to re-hydrate from chain. */
  confirm?: Promise<void>;
}

export interface ContractGateway {
  readonly live: boolean;
  write(
    method: ContractWriteMethod,
    args: unknown[],
    value?: bigint,
  ): Promise<WriteResult>;
  read(method: ContractViewMethod, args: unknown[]): Promise<unknown>;
}
