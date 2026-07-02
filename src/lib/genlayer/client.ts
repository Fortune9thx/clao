import type { ContractViewMethod, ContractWriteMethod, GlChainName } from "@/types";
import type { ContractGateway, WriteResult } from "./gateway";
import { CONTRACT_ADDRESS } from "./abi";
import * as gl from "genlayer-js";

// LiveGateway — real GenLayer writes via genlayer-js v1.1.8.
//
// Design decisions:
//   1. genlayer-js is dynamically imported inside connectLive() so the initial
//      bundle stays lean; mock path works with zero deps.
//   2. GlClient is a local interface that captures exactly the v1.1.8 methods
//      we use — avoids importing the full complex GenLayerClient<GenLayerChain>
//      type which requires chain generics not available at module scope.
//   3. waitForTransactionReceipt uses "FINALIZED" string (= TransactionStatus.FINALIZED
//      enum value) — avoids importing the enum at module level.
//   4. After finalization we inspect leaderReceipt.execution_result to surface
//      contract-level errors ("proposal already exists", etc.) that the EVM
//      layer doesn't propagate as reverts on GenLayer.
//   5. Timeout/network transients in the confirm promise are swallowed; the
//      orchestration layer will re-hydrate from chain to recover state.

// Subset of GenLayerClient<GenLayerChain> v1.1.8 we actually call.
// Kept minimal and explicit — if the SDK changes a signature, TS will catch it
// here rather than silently coercing an `any` chain.
interface GlClient {
  writeContract(args: {
    address: `0x${string}`;
    functionName: string;
    args?: unknown[];
    value: bigint;
    leaderOnly?: boolean;
  }): Promise<`0x${string}`>;

  readContract(args: {
    address: `0x${string}`;
    functionName: string;
    args?: unknown[];
    jsonSafeReturn?: boolean;
  }): Promise<unknown>;

  // status is TransactionStatus enum — "FINALIZED" matches TransactionStatus.FINALIZED.
  // Returns GenLayerTransaction; we only inspect leaderReceipt.
  waitForTransactionReceipt(args: {
    hash: `0x${string}`;
    status?: string;
    interval?: number;
    retries?: number;
  }): Promise<{
    leaderReceipt?: {
      execution_result: string; // "FINISHED_WITH_RETURN" | "FINISHED_WITH_ERROR"
      error: string | null;
      result?: string;          // LLM / function return value (raw string)
    };
  }>;

  connect(network?: string): Promise<void>;
}

interface Eip1193 {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
}

export interface LiveConnection {
  gateway: ContractGateway;
  address: `0x${string}`;
  network: GlChainName;
}

// Network from env — validated against known chain keys at connect time.
const NETWORK = ((import.meta.env.VITE_GL_NETWORK as string) || "studionet") as GlChainName;

const TX_FINALIZED = "FINALIZED";

// How long to wait for an intelligent contract to reach FINALIZED status.
// LLM-backed methods (cast_cognitive_vote, resolve_dispute) can take 2-3 minutes
// on a loaded testnet. 36 × 5 s = 180 s max.
const RECEIPT_RETRIES = 36;
const RECEIPT_INTERVAL_MS = 5_000;

export class LiveGateway implements ContractGateway {
  readonly live = true;
  private readonly client: GlClient;
  private readonly address: `0x${string}`;

  constructor(client: GlClient, address: `0x${string}`) {
    this.client = client;
    this.address = address;
  }

  async write(method: ContractWriteMethod, args: unknown[], value = 0n): Promise<WriteResult> {
    // writeContract returns the tx hash immediately (before FINALIZED).
    const hash = await this.client.writeContract({
      address: this.address,
      functionName: method,
      args,
      value,
    });

    // confirm resolves once the tx is FINALIZED, or rejects on contract-level errors.
    // Network/timeout errors are caught and swallowed — orchestration re-hydrates anyway.
    const confirm = (async (): Promise<void> => {
      try {
        const receipt = await this.client.waitForTransactionReceipt({
          hash,
          status: TX_FINALIZED,
          interval: RECEIPT_INTERVAL_MS,
          retries: RECEIPT_RETRIES,
        });

        // Intelligent contracts don't revert at the EVM layer on logic errors —
        // they set execution_result to "FINISHED_WITH_ERROR" instead.
        // Surface these so the orchestration layer can update tx status + toast.
        if (receipt?.leaderReceipt?.execution_result === "FINISHED_WITH_ERROR") {
          const contractErr = receipt.leaderReceipt.error ?? "Contract execution failed";
          throw new Error(`[ContractError] ${contractErr}`);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        // Re-throw contract-level errors; swallow transient network/timeout errors.
        if (msg.startsWith("[ContractError]")) throw err;
        console.warn(`[CLAO] Receipt pending/timeout for ${hash} (${method}):`, msg);
      }
    })();

    return { hash, live: true, confirm };
  }

  async read(method: ContractViewMethod, args: unknown[]): Promise<unknown> {
    return this.client.readContract({
      address: this.address,
      functionName: method,
      args,
      // GenLayer returns Python dicts as JSON strings — jsonSafeReturn coerces
      // them to JS objects so we don't have to JSON.parse manually.
      jsonSafeReturn: true,
    });
  }
}

/** Connect the active wallet to GenLayer and return a live gateway + address.
 *
 *  Accepts an optional walletAddress from RainbowKit/wagmi so we skip the
 *  eth_requestAccounts prompt (user already approved the connection).
 *
 *  Throws with a user-friendly message on:
 *    - Missing VITE_CLAO_ADDRESS (contract not deployed)
 *    - No EIP-1193 provider (MetaMask not installed)
 *    - User rejection (MetaMask cancel)
 *    - Unknown network key in VITE_GL_NETWORK
 */
export async function connectLive(walletAddress?: `0x${string}`): Promise<LiveConnection> {
  if (!CONTRACT_ADDRESS) {
    throw new Error(
      "Contract not deployed — set VITE_CLAO_ADDRESS in .env.local after running `npm run gen:deploy`.",
    );
  }

  const eth = (window as unknown as { ethereum?: Eip1193 }).ethereum;
  if (!eth) {
    throw new Error(
      "No EIP-1193 wallet found. Install MetaMask (metamask.io) to connect to GenLayer.",
    );
  }

  // Resolve the wallet address — prefer the one wagmi already obtained
  // so we never double-prompt for account approval.
  let address: `0x${string}`;
  if (walletAddress) {
    address = walletAddress;
  } else {
    const accounts = (await eth.request({ method: "eth_requestAccounts" })) as string[];
    if (!accounts?.[0]) throw new Error("No account selected in wallet.");
    address = accounts[0] as `0x${string}`;
  }

  const allChains = gl.chains as Record<string, unknown>;

  const networkKey = NETWORK as string;
  const chain = allChains[networkKey] ?? allChains["studionet"];
  if (!allChains[networkKey]) {
    console.warn(
      `[CLAO] Unknown VITE_GL_NETWORK="${networkKey}". Falling back to studionet.`,
      `Known networks: ${Object.keys(allChains).join(", ")}`,
    );
  }

  const client = gl.createClient({
    chain: chain as never,
    account: address,
    provider: eth as never,
  }) as unknown as GlClient;

  // connect() triggers MetaMask to add/switch to the GenLayer network.
  await client.connect(networkKey);

  return {
    gateway: new LiveGateway(client, CONTRACT_ADDRESS),
    address,
    network: NETWORK,
  };
}
