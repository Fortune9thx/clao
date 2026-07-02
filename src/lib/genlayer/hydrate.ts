import type {
  ChainStorage,
  DisputeState,
  Proposal,
  ProposalStatus,
  MemoryEvent,
  MemoryEventType,
  TreasuryState,
} from "@/types";

// Pure mappers: on-chain (get_complete_storage) → store-shaped values. Kept
// pure + framework-free so they're trivially testable and reused by both the
// live and mock hydration paths.

const STATUSES: ProposalStatus[] = [
  "Draft",
  "GenLayer_Validation",
  "Validated",
  "Treasury_Released",
  "Disputed",
  "Rejected",
];
const asStatus = (s: string): ProposalStatus =>
  (STATUSES.includes(s as ProposalStatus) ? s : "GenLayer_Validation") as ProposalStatus;

const KINDS: MemoryEventType[] = ["proposal", "ruling", "precedent", "dispute"];
const asKind = (k: string): MemoryEventType =>
  (KINDS.includes(k as MemoryEventType) ? k : "precedent") as MemoryEventType;

const asVerdict = (v: string): MemoryEvent["verdict"] =>
  v === "Approved" || v === "Rejected" || v === "Escalated" ? v : undefined;

/** Merge on-chain proposal state onto existing UI proposals (status, agreement,
 *  reasoning). Proposals only present on-chain are appended with sane defaults. */
export function mergeProposals(chain: ChainStorage, existing: Proposal[]): Proposal[] {
  const byId = new Map(existing.map((p) => [p.id, p]));
  const merged = existing.map((p) => {
    const c = chain.proposals.find((cp) => cp.id === p.id);
    if (!c) return p;
    return {
      ...p,
      status: asStatus(c.status),
      validator_consensus: {
        ...p.validator_consensus,
        current_agreement: c.agreement || p.validator_consensus.current_agreement,
        arguments_for: c.reasoning || p.validator_consensus.arguments_for,
      },
    };
  });
  for (const c of chain.proposals) {
    if (byId.has(c.id)) continue;
    merged.push({
      id: c.id,
      title: c.title,
      proposer: c.proposer,
      requested_amount: `${c.amount.toLocaleString()} USDC`,
      status: asStatus(c.status),
      cognitive_metrics: {
        risk_score: 30,
        reputation_weight: 70,
        precedent_match: "—",
        quorum_required: `${c.quorum_required}%`,
      },
      validator_consensus: {
        current_agreement: c.agreement,
        status: c.reasoning ? "On-chain" : "Pending",
        arguments_for: c.reasoning || "",
        arguments_against: "",
      },
    });
  }
  return merged;
}

/** Convert the on-chain append-only memory ledger to timeline events. Semantic
 *  relations are derived from shared proposal_id (the chain stores no links). */
export function mapMemory(chain: ChainStorage): MemoryEvent[] {
  const now = Date.now();
  const n = chain.memory.length;
  const byProposal = new Map<string, string[]>();
  const events = chain.memory.map((m, i) => {
    const id = `C-${m.seq}`;
    if (m.proposal_id) {
      const arr = byProposal.get(m.proposal_id) ?? [];
      arr.push(id);
      byProposal.set(m.proposal_id, arr);
    }
    return {
      id,
      type: asKind(m.kind),
      title: m.title || m.proposal_id || "Memory",
      proposalId: m.proposal_id || undefined,
      // Synthesize a monotonic timeline from seq order (newest = now).
      timestamp: now - (n - i - 1) * 3_600_000,
      verdict: asVerdict(m.verdict),
      summary: m.summary,
      relatedIds: [] as string[],
    } satisfies MemoryEvent;
  });
  // Link entries that touch the same proposal.
  for (const ids of byProposal.values()) {
    if (ids.length < 2) continue;
    for (const ev of events) {
      if (ids.includes(ev.id)) ev.relatedIds = ids.filter((x) => x !== ev.id);
    }
  }
  return events;
}

/** Map the latest on-chain dispute into the store's DisputeState. */
export function mapDispute(chain: ChainStorage): DisputeState | null {
  if (chain.disputes.length === 0) return null;
  const d = chain.disputes[chain.disputes.length - 1];
  const status = d.status === "Resolved" ? "Resolved" : d.status === "Adjudicating" ? "Adjudicating" : "Filed";
  return {
    open: status !== "Resolved",
    disputeId: d.id,
    proposalId: d.proposal_id,
    reason: d.reason,
    status,
    outcome: d.outcome || undefined,
  };
}

/** Map on-chain treasury figures onto the treasury panel, anchored to the
 *  original balance so releases subtract correctly. */
export function mapTreasury(chain: ChainStorage, base: TreasuryState): TreasuryState {
  const released = chain.dao.treasury_released || 0;
  return {
    ...base,
    balanceLabel: chain.dao.treasury_label || base.balanceLabel,
    balanceValue: Math.max(0, base.balanceValue + base.released - released),
    released,
  };
}
