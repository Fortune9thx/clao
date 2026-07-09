import type { ContractViewMethod, ContractWriteMethod } from "@/types";

// Gateway abstraction: the rest of the app talks to ContractGateway. Two
// implementations exist — ReadOnlyGateway (real chain reads, no wallet;
// writes rejected) and LiveGateway (signed writes after wallet connect).
// Every byte of governance data the UI shows comes from the chain.

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
