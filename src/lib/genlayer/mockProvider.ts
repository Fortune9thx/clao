import type { ContractViewMethod, ContractWriteMethod } from "@/types";
import type { ContractGateway, WriteResult } from "./gateway";
import { PROPOSALS, CURRENT_DAO } from "@/data/mockDao";
import { MEMORY_EVENTS } from "@/data/mockMemory";
import { parseAmount } from "@/lib/utils/format";

// Deterministic-feeling simulation of CLAORegistry. Produces plausible tx
// hashes + latency so the full UX (signing → pending → finalized) works with no
// wallet, and returns a get_complete_storage snapshot shaped EXACTLY like the
// contract's view output so the on-chain hydration path is exercised in sim.

const rand = (n = 16) =>
  Array.from({ length: n }, () => Math.floor(Math.random() * 16).toString(16)).join("");

const fakeHash = () => `0x${rand(40)}` as const;

const COGNITIVE = new Set<ContractWriteMethod>(["cast_cognitive_vote", "resolve_dispute"]);

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** Mirror of the Python get_complete_storage() return shape. */
function completeStorageSnapshot() {
  return {
    dao: {
      id: CURRENT_DAO.id,
      name: CURRENT_DAO.name,
      treasury_label: CURRENT_DAO.treasury_balance,
      treasury_released: 0,
    },
    proposals: PROPOSALS.map((p) => ({
      id: p.id,
      title: p.title,
      proposer: p.proposer,
      amount: parseAmount(p.requested_amount),
      status: p.status,
      quorum_required: parseInt(p.cognitive_metrics.quorum_required, 10) || 60,
      agreement: p.validator_consensus.current_agreement,
      reasoning: p.validator_consensus.arguments_for,
    })),
    disputes: [],
    memory: MEMORY_EVENTS.map((m, i) => ({
      seq: i + 1,
      kind: m.type,
      proposal_id: m.proposalId ?? "",
      title: m.title,
      verdict: m.verdict ?? "",
      summary: m.summary,
    })),
  };
}

export class MockGateway implements ContractGateway {
  readonly live = false;

  async write(method: ContractWriteMethod): Promise<WriteResult> {
    // Simulate sign + network latency; LLM-backed methods take longer.
    await wait(COGNITIVE.has(method) ? 2600 : 1100 + Math.random() * 500);
    return { hash: fakeHash(), live: false, confirm: wait(1200) };
  }

  async read(method: ContractViewMethod): Promise<unknown> {
    await wait(220);
    if (method === "get_complete_storage") return completeStorageSnapshot();
    if (method === "get_memory_timeline") return completeStorageSnapshot().memory;
    return null;
  }
}
