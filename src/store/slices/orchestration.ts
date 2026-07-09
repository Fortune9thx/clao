import type { StateCreator } from "zustand";
import type { ClaoStore, OrchestrationSlice } from "@/store/types";
import type {
  ContractWriteMethod,
  MemoryEvent,
  Proposal,
  Stance,
} from "@/types";
import { claoContract } from "@/lib/genlayer/claoContract";
import type { WriteResult } from "@/lib/genlayer/gateway";
import { WRITE_METHODS } from "@/lib/genlayer/abi";
import { mergeProposals, mapMemory, mapTreasury, mapDispute } from "@/lib/genlayer/hydrate";
import { TREASURY } from "@/data/mockDao";
import { parseAmount, clamp } from "@/lib/utils/format";
import { toast } from "@/store/useToastStore";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Run a contract write through the tx lifecycle: signing → pending → finalized.
 *  Centralizes how EVERY on-chain option is written so the UI never duplicates
 *  this choreography. Returns the tx hash. */
async function runWrite(
  get: () => ClaoStore,
  method: ContractWriteMethod,
  fn: () => Promise<WriteResult>,
): Promise<string> {
  const id = get().addTx(method, WRITE_METHODS[method].label);
  try {
    const res = await fn();
    get().updateTx(id, { status: "pending", hash: res.hash, live: res.live });

    // Drive finalization off the gateway's confirm signal.
    // confirm rejects on [ContractError] (execution_result = FINISHED_WITH_ERROR)
    // or resolves on FINALIZED. Network transients are already swallowed inside
    // LiveGateway — we only see real contract-level rejections here.
    const settle = res.confirm ?? new Promise<void>((r) => setTimeout(r, 1500));
    void settle
      .then(() => {
        get().updateTx(id, { status: "finalized" });
        if (res.live) void get().hydrateFromChain();
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err);
        // Strip the "[ContractError] " prefix for the toast body.
        const body = msg.replace(/^\[ContractError\]\s*/, "");
        get().updateTx(id, { status: "failed" });
        toast.error(`${WRITE_METHODS[method].label} failed`, body);
      });

    return res.hash;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    get().updateTx(id, { status: "failed" });
    toast.error(`${WRITE_METHODS[method].label} failed`, msg);
    throw e;
  }
}

const findProposal = (get: () => ClaoStore, id: string): Proposal | undefined =>
  get().proposals.find((p) => p.id === id);

export const createOrchestrationSlice: StateCreator<
  ClaoStore,
  [],
  [],
  OrchestrationSlice
> = (set, get) => ({
  hydrating: false,
  lastSyncedAt: null,

  // -- Reconcile the command center with on-chain truth (get_complete_storage).
  hydrateFromChain: async () => {
    if (get().hydrating) return;
    set({ hydrating: true });
    try {
      const raw = await claoContract.getCompleteStorage();
      if (raw && Array.isArray(raw.proposals)) {
        const dispute = mapDispute(raw);
        set((s) => {
          const proposals = mergeProposals(raw, s.proposals);
          return {
            proposals,
            memory: mapMemory(raw),
            treasury: mapTreasury(raw, TREASURY),
            ...(dispute ? { dispute } : {}),
            // Keep a proposal selected so detail screens always have context.
            selectedProposalId: s.selectedProposalId ?? proposals[0]?.id ?? null,
            lastSyncedAt: Date.now(),
          };
        });
      }
    } catch (e) {
      console.warn("[CLAO] hydrate failed:", e);
    } finally {
      set({ hydrating: false });
    }
  },

  // -- Submit a new proposal into the cognitive pipeline. ----------------------
  submitProposal: async (title, amount, proposer) => {
    const id = `PROP-${Date.now().toString().slice(-4)}`;
    const proposal: Proposal = {
      id,
      title,
      proposer: proposer || get().governanceProfile.address,
      requested_amount: amount,
      status: "GenLayer_Validation",
      cognitive_metrics: {
        risk_score: 30,
        reputation_weight: 70,
        precedent_match: "—",
        quorum_required: "60%",
      },
      validator_consensus: {
        current_agreement: 0,
        status: "Pending",
        arguments_for: "",
        arguments_against: "",
      },
    };
    set((s) => ({ proposals: [...s.proposals, proposal] }));
    get().selectProposal(id);
    get().setMood("thinking", "New proposal submitted");

    toast.tx("Submitting proposal…", id);
    try {
      await runWrite(get, "submit_proposal", () => claoContract.submitProposal(proposal));
      toast.success("Proposal submitted", `${id} entered the cognitive pipeline`);
    } catch (e) {
      toast.error("Submission failed", e instanceof Error ? e.message : "Try again");
      throw e;
    }
    get().addMemoryEvent(memoryFrom(proposal, "proposal", "", "Proposal submitted for cognitive validation."));
  },

  // -- Cognitive validation: the centerpiece. Streams reasoning while the
  //    cast_cognitive_vote write runs the Equivalence Principle on-chain.
  //
  //    LIVE PATH  — awaits FINALIZED receipt, then reads the real LLM verdict,
  //                 agreement%, and reasoning back from the contract via hydrate.
  //    MOCK PATH  — fabricated score-based verdict for walletless simulation.
  runValidation: async (proposalId) => {
    const proposal = findProposal(get, proposalId);
    if (!proposal || get().validation.active) return;

    toast.tx("GenLayer validators activating…", `Reasoning over ${proposal.id}`);
    get().setMood("thinking", `Reasoning over ${proposal.id}…`);
    get().setLevels({ excitementLevel: 64, confidenceLevel: 42 });
    get()._setValidation({ active: true, proposalId, phase: "ingesting", agreement: 0 });
    get()._pushReasoning(`Ingesting ${proposal.id} + treasury & precedent context.`, "info");

    await sleep(550);
    get()._setValidation({ phase: "reasoning" });
    get()._pushReasoning(
      `FOR · ${proposal.validator_consensus.arguments_for || "Pending validator analysis…"}`,
      "for",
    );
    await sleep(650);
    get()._pushReasoning(
      `AGAINST · ${proposal.validator_consensus.arguments_against || "Pending validator analysis…"}`,
      "against",
    );

    // Kick the on-chain cognitive vote and capture the full WriteResult so the
    // live path can await the FINALIZED confirm signal.
    const txId = get().addTx("cast_cognitive_vote", WRITE_METHODS["cast_cognitive_vote"].label);
    let result: WriteResult;
    try {
      result = await claoContract.castCognitiveVote(proposal);
      get().updateTx(txId, { status: "pending", hash: result.hash, live: result.live });
    } catch (e) {
      get().updateTx(txId, { status: "failed" });
      get()._setValidation({ active: false, phase: "idle" });
      throw e;
    }

    await sleep(500);
    get()._setValidation({ phase: "precedent" });
    get()._pushReasoning(
      `Precedent match ${proposal.cognitive_metrics.precedent_match} against ratified standards.`,
      "precedent",
    );

    get()._setValidation({ phase: "consensus" });

    // Wait for GenLayer validators to finalize subjective consensus on-chain,
    // then hydrate the store and read the ACTUAL LLM verdict + reasoning.
    get()._pushReasoning(
      "GenLayer validators reasoning on-chain — awaiting subjective consensus finalization…",
      "info",
    );

    try {
      await result.confirm; // waitForTransactionReceipt({ status: "FINALIZED" })
    } catch {
      // Receipt timeout — continue; hydrate will get whatever state exists.
    }
    get().updateTx(txId, { status: "finalized" });

    await get().hydrateFromChain();

    const updated = findProposal(get, proposalId);
    const realAgreement = updated?.validator_consensus.current_agreement ?? 0;
    const realReasoning = updated?.validator_consensus.arguments_for ?? "";
    const realStatus = updated?.status ?? "GenLayer_Validation";

    const onChainVerdict: "Approved" | "Escalated" | "Rejected" =
      realStatus === "Validated" ? "Approved" :
      realStatus === "Rejected" ? "Rejected" : "Escalated";
    const risky = onChainVerdict !== "Approved";

    // Animate agreement counter up to the real on-chain value.
    for (let a = 0; a <= realAgreement; a += Math.max(4, Math.round(realAgreement / 10))) {
      get()._setValidation({ agreement: Math.min(a, realAgreement) });
      await sleep(70);
    }
    get()._setValidation({ agreement: realAgreement });

    const nodes = get().validation.nodes.map((n, i) => ({
      ...n,
      stance: (i === get().validation.nodes.length - 1 && !risky
        ? "against"
        : risky && i % 2
          ? "against"
          : "for") as Stance,
      confidence: clamp(realAgreement + (i - 2) * 4),
    }));
    get()._setValidation({ nodes });

    // Surface the real LLM reasoning text from the contract.
    if (realReasoning) {
      get()._pushReasoning(`GenLayer LLM · ${realReasoning}`, "verdict");
    }
    get()._pushReasoning(
      `On-chain consensus ${realAgreement}% → ${onChainVerdict}.`,
      "verdict",
    );
    get()._setValidation({ phase: risky ? "disputed" : "complete" });

    get().patchProposal(proposalId, {
      status: realStatus,
      validator_consensus: {
        ...proposal.validator_consensus,
        current_agreement: realAgreement,
        status: risky ? "Escalated — Subjective Dispute" : "Subjective Consensus Reached",
        arguments_for: realReasoning || proposal.validator_consensus.arguments_for,
      },
      ruling: {
        verdict: onChainVerdict,
        rationale: realReasoning || proposal.validator_consensus.arguments_for,
        recordedAt: Date.now(),
      },
    });

    if (risky) {
      toast.warning("Escalated — dispute recommended", `${realAgreement}% consensus · below threshold`);
      get().setMood("warning", "Elevated risk — dispute recommended");
      get().fireTrigger("anomalyDetected");
    } else {
      toast.success("Validation complete", `${realAgreement}% on-chain consensus`);
      get().setMood("success", `Validated at ${realAgreement}% on-chain consensus`);
      get().setLevels({ excitementLevel: 82, confidenceLevel: realAgreement });
    }
    get().nudgeGovernancePressure(risky ? 8 : -6);
    get().addMemoryEvent(
      memoryFrom(
        proposal,
        "ruling",
        onChainVerdict,
        `On-chain consensus ${realAgreement}%.${realReasoning ? ` ${realReasoning.slice(0, 80)}` : ""}`,
      ),
    );
  },

  // -- "View Intelligence Report" → operator pins the AI verdict to memory.
  //    Exercises record_ruling. --------------------------------------------------
  pinRuling: async (proposalId) => {
    const proposal = findProposal(get, proposalId);
    if (!proposal) return;
    const verdict = proposal.ruling?.verdict ?? "Approved";
    get().setMood("explaining", "Pinning ruling to institutional memory");
    const hash = await runWrite(get, "record_ruling", () =>
      claoContract.recordRuling(proposalId, verdict, proposal.validator_consensus.arguments_for),
    );
    get().addMemoryEvent(
      memoryFrom(proposal, "precedent", verdict, "Ruling pinned to memory.", hash),
    );
  },

  // -- "Simulate Onchain Execution" → finalize_execution (payable) + treasury. --
  simulateExecution: async (proposalId) => {
    const proposal = findProposal(get, proposalId);
    if (!proposal) return;
    get().setMood("thinking", "Simulating onchain execution…");
    get()._setValidation({ phase: "consensus" });

    const hash = await runWrite(get, "finalize_execution", () =>
      claoContract.finalizeExecution(proposalId),
    );

    const amount = parseAmount(proposal.requested_amount);
    get().applyTreasuryRelease(amount, hash);
    get().patchProposal(proposalId, { status: "Treasury_Released" });
    get()._setValidation({ phase: "complete" });
    get().fireTrigger("executionSuccess");
    get().setMood("success", "Treasury released · executed onchain");
    get().setLevels({ excitementLevel: 92, confidenceLevel: 96 });
    get().addMemoryEvent(
      memoryFrom(proposal, "ruling", "Approved", "Treasury released — executed onchain.", hash),
    );

    // Reward the proposer's reliability — exercises update_reputation.
    await get().commitReputation("reliability", +2);
  },

  // -- "Challenge Verdict" → open_dispute. --------------------------------------
  challengeVerdict: async (proposalId, reason = "Formatting deviation contested by reviewer.") => {
    const proposal = findProposal(get, proposalId);
    if (!proposal) return;
    const disputeId = `D-${Date.now().toString().slice(-5)}`;
    toast.tx("Opening dispute…", disputeId);
    get().setMood("alert", "Dispute opened — adjudicating");
    get().fireTrigger("disputeOpened");
    get().setDispute({ open: true, disputeId, proposalId, reason, status: "Filed" });

    const hash = await runWrite(get, "open_dispute", () =>
      claoContract.openDispute(disputeId, proposalId, reason),
    );
    toast.success("Dispute filed", `${disputeId} · awaiting adjudication`);
    get().setDispute({ status: "Adjudicating", tx: hash });
    get().patchProposal(proposalId, { status: "Disputed" });
    get()._setValidation({ phase: "disputed" });
    get().nudgeGovernancePressure(10);
    get().addMemoryEvent(memoryFrom(proposal, "dispute", "Escalated", reason, hash));
  },

  // -- Adjudicate the open dispute → resolve_dispute (LLM jury). -----------------
  adjudicateDispute: async () => {
    const { dispute } = get();
    if (!dispute.open || !dispute.disputeId) return;
    toast.tx("LLM jury adjudicating…", dispute.disputeId);
    get().setMood("thinking", "LLM jury adjudicating dispute…");
    const hash = await runWrite(get, "resolve_dispute", () =>
      claoContract.resolveDispute(dispute.disputeId!),
    );
    const outcome = "Upheld";
    toast.success("Dispute resolved", `Verdict: ${outcome}`);
    get().setDispute({ status: "Resolved", outcome, tx: hash });
    get().setMood("success", `Dispute ${outcome.toLowerCase()}`);
    get().nudgeGovernancePressure(-8);
    const proposal = dispute.proposalId ? findProposal(get, dispute.proposalId) : undefined;
    if (proposal) {
      get().addMemoryEvent(
        memoryFrom(proposal, "dispute", "Escalated", `Dispute resolved — ${outcome}.`, hash),
      );
    }
  },

  // -- Reputation write (also called standalone from the reputation panel). -----
  commitReputation: async (key, delta) => {
    get().bumpReputation(key, delta);
    const score = get().reputation.composite;
    await runWrite(get, "update_reputation", () =>
      claoContract.updateReputation(get().governanceProfile.address, score, `${key} ${delta > 0 ? "+" : ""}${delta}`),
    );
  },
});

// Build a MemoryEvent linked to recent proposals for the timeline's relation lines.
function memoryFrom(
  proposal: Proposal,
  type: MemoryEvent["type"],
  verdict: string,
  summary: string,
  tx?: string,
): MemoryEvent {
  return {
    id: `M-${Date.now().toString().slice(-6)}`,
    type,
    title: proposal.title,
    proposalId: proposal.id,
    timestamp: Date.now(),
    verdict: verdict as MemoryEvent["verdict"],
    summary,
    relatedIds: [],
    tx,
  };
}
