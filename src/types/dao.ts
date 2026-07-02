// Domain types for the autonomous organization CLAO governs.

export type ProposalStatus =
  | "Draft"
  | "GenLayer_Validation"
  | "Validated"
  | "Treasury_Released"
  | "Disputed"
  | "Rejected";

/** Cognitive scoring produced by the CLAO cognitive branch. */
export interface CognitiveMetrics {
  risk_score: number; // 0-100, lower is safer
  reputation_weight: number; // 0-100
  precedent_match: string; // e.g. "94%"
  quorum_required: string; // e.g. "65%"
}

/** Subjective-consensus snapshot from GenLayer validators. */
export interface ValidatorConsensus {
  current_agreement: number; // 0-100
  status: string;
  arguments_for: string;
  arguments_against: string;
}

export interface Proposal {
  id: string;
  title: string;
  proposer: string;
  requested_amount: string;
  status: ProposalStatus;
  cognitive_metrics: CognitiveMetrics;
  validator_consensus: ValidatorConsensus;
  /** Filled once a ruling is recorded to institutional memory. */
  ruling?: ProposalRuling;
}

export interface ProposalRuling {
  verdict: "Approved" | "Rejected" | "Escalated";
  rationale: string;
  recordedTx?: string;
  recordedAt: number;
}

export interface CurrentDAO {
  id: string;
  name: string;
  treasury_balance: string;
  risk_mode: string;
}

export interface GovernanceProfile {
  address: string;
  role: string;
  reputation_score: number;
  voting_weight_multiplier: string;
}

/** Adaptive Governance Engine signals (left sidebar). */
export interface GovernanceEngineState {
  quorumCurrent: number; // % live subjective agreement tracking the bar
  quorumTarget: number; // % required quorum (= base + adjustment)
  quorumBase: number; // % static baseline rule
  quorumAdjustment: number; // % dynamic uplift applied by the engine (treasury risk)
  governancePressure: number; // 0-100
  pressureSeries: number[]; // sparkline history
  quorumHistory: number[]; // required-quorum % per recent governance epoch (bar chart)
  riskScore: number; // 0-100
}

export interface TreasuryState {
  balanceLabel: string;
  balanceValue: number;
  reserveRatio: number; // 0-100
  released: number; // cumulative released this session
  lastReleaseTx?: string;
}
