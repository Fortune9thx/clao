import type { ContractWriteMethod, Proposal } from "@/types";
import type { ContractGateway } from "./gateway";
import { ReadOnlyGateway } from "./readOnlyProvider";
import { parseAmount } from "@/lib/utils/format";

// ClaoContract — the typed, app-facing facade over whichever gateway is active.
// Each method below maps an in-app governance action to a concrete CLAORegistry
// write entrypoint, encoding domain objects into contract args. This is the
// single place that "writes data" into the intelligent contract.
//
// Boots with ReadOnlyGateway (real chain reads, writes require wallet);
// connectWallet() swaps in LiveGateway for signed transactions.

export class ClaoContract {
  private gateway: ContractGateway = new ReadOnlyGateway();

  /** Swap in the live gateway once a wallet connects. */
  setGateway(gateway: ContractGateway) {
    this.gateway = gateway;
  }

  get live() {
    return this.gateway.live;
  }

  private write(method: ContractWriteMethod, args: unknown[], value?: bigint) {
    return this.gateway.write(method, args, value);
  }

  // --- High-level governance actions (1:1 with contract write methods) -------

  registerDao(id: string, name: string, treasuryLabel: string) {
    return this.write("register_dao", [id, name, treasuryLabel]);
  }

  submitProposal(p: Proposal) {
    return this.write("submit_proposal", [
      p.id,
      p.title,
      p.proposer,
      parseAmount(p.requested_amount),
      parseInt(p.cognitive_metrics.quorum_required, 10) || 60,
    ]);
  }

  /** Cognitive validation — invokes the LLM / Equivalence Principle on-chain. */
  castCognitiveVote(p: Proposal) {
    return this.write("cast_cognitive_vote", [
      p.id,
      p.validator_consensus.arguments_for,
      p.validator_consensus.arguments_against,
    ]);
  }

  recordRuling(proposalId: string, verdict: string, rationale: string) {
    return this.write("record_ruling", [proposalId, verdict, rationale]);
  }

  openDispute(disputeId: string, proposalId: string, reason: string) {
    return this.write("open_dispute", [disputeId, proposalId, reason]);
  }

  resolveDispute(disputeId: string) {
    return this.write("resolve_dispute", [disputeId]);
  }

  /** Payable: releases treasury for a validated proposal. */
  finalizeExecution(proposalId: string) {
    return this.write("finalize_execution", [proposalId], 0n);
  }

  updateReputation(address: string, newScore: number, reason: string) {
    return this.write("update_reputation", [address, Math.round(newScore), reason]);
  }

  // --- Reads -----------------------------------------------------------------
  getMemoryTimeline() {
    return this.gateway.read("get_memory_timeline", []);
  }

  /** Full on-chain snapshot used to hydrate the command center. */
  getCompleteStorage() {
    return this.gateway.read("get_complete_storage", []) as Promise<
      import("@/types").ChainStorage | null
    >;
  }
}

/** App-wide singleton — the one writer into the cognitive branch. */
export const claoContract = new ClaoContract();
