import type { ContractViewMethod, ContractWriteMethod } from "@/types";
import type { ContractGateway, WriteResult } from "./gateway";
import { CONTRACT_ADDRESS } from "./abi";
import * as gl from "genlayer-js";

// ReadOnlyGateway — the default gateway before a wallet connects.
//
// Reads go straight to the deployed CLAORegistry on GenLayer (no wallet, no
// account: readContract is a gas-free JSON-RPC call). Every visitor sees the
// REAL on-chain state the moment the app loads.
//
// Writes are rejected with a clear "connect your wallet" error — there is no
// simulation path. The orchestration layer surfaces that message as a toast.

const NETWORK = (import.meta.env.VITE_GL_NETWORK as string) || "testnetBradbury";

type GlReadClient = {
  readContract(args: {
    address: `0x${string}`;
    functionName: string;
    args?: unknown[];
    jsonSafeReturn?: boolean;
  }): Promise<unknown>;
};

export class ReadOnlyGateway implements ContractGateway {
  readonly live = false; // cannot write; reads are still real chain reads
  private client: GlReadClient | null = null;

  private getClient(): GlReadClient {
    if (!this.client) {
      const allChains = gl.chains as Record<string, unknown>;
      const chain = allChains[NETWORK] ?? allChains["testnetBradbury"];
      this.client = gl.createClient({ chain: chain as never }) as unknown as GlReadClient;
    }
    return this.client;
  }

  async write(method: ContractWriteMethod): Promise<WriteResult> {
    throw new Error(
      `Connect your wallet to run ${method} on-chain. CLAO has no simulation mode: every action is a real GenLayer transaction.`,
    );
  }

  async read(method: ContractViewMethod, args: unknown[]): Promise<unknown> {
    return this.getClient().readContract({
      address: CONTRACT_ADDRESS,
      functionName: method,
      args,
      jsonSafeReturn: true,
    });
  }
}
