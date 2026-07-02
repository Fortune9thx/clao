// Institutional Memory — the on-chain ledger CLAO writes rulings into.

export type MemoryEventType = "proposal" | "ruling" | "precedent" | "dispute";

export interface MemoryEvent {
  id: string;
  type: MemoryEventType;
  title: string;
  /** Proposal this event is anchored to, if any. */
  proposalId?: string;
  timestamp: number;
  verdict?: "Approved" | "Rejected" | "Escalated";
  summary: string;
  /** Semantic relationships → drawn as precedent lines in the timeline. */
  relatedIds: string[];
  /** On-chain tx hash if this event was written to GenLayer. */
  tx?: string;
}

export interface ReputationFactor {
  key: "credibility" | "shippedCode" | "research" | "reliability";
  label: string;
  value: number; // 0-100
  weight: number; // 0-1, contribution to composite
  delta: number; // recent change
}

export interface ReputationState {
  composite: number; // 0-100
  confidence: number; // 0-100
  factors: ReputationFactor[];
  history: number[]; // composite over time, for the history graph
}

export interface DisputeState {
  open: boolean;
  disputeId?: string;
  proposalId?: string;
  reason?: string;
  status?: "Filed" | "Adjudicating" | "Resolved";
  outcome?: string;
  tx?: string;
}
