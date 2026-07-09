import type {
  CurrentDAO,
  GovernanceProfile,
  GovernanceEngineState,
  TreasuryState,
} from "@/types";

// Static DAO configuration matching the on-chain CLAORegistry constructor args.
// Proposals, memory, disputes, and treasury releases all hydrate from chain
// (get_complete_storage) — nothing here fabricates governance activity.

export const CURRENT_DAO: CurrentDAO = {
  id: "dao-01",
  name: "Bradbury Alpha DAO",
  treasury_balance: "2,450,000 USD",
  risk_mode: "Adaptive · Elevated",
};

export const GOVERNANCE_PROFILE: GovernanceProfile = {
  address: "0xFortune...G9D",
  role: "DAO Ambassador & Protocol Builder",
  reputation_score: 84,
  voting_weight_multiplier: "1.4x",
};

export const GOVERNANCE_ENGINE: GovernanceEngineState = {
  quorumCurrent: 58,
  quorumTarget: 65,
  quorumBase: 50, // static charter baseline
  quorumAdjustment: 15, // dynamic uplift from treasury risk → 65% required
  governancePressure: 62,
  pressureSeries: [38, 41, 47, 44, 52, 58, 55, 61, 62],
  // Required-quorum % across the last 9 governance epochs — the engine has been
  // ratcheting quorum up as treasury exposure climbed (vertical bar history).
  quorumHistory: [50, 52, 50, 55, 58, 55, 60, 62, 65],
  riskScore: 34,
};

export const TREASURY: TreasuryState = {
  balanceLabel: "2,450,000 USD",
  balanceValue: 2_450_000,
  reserveRatio: 72,
  released: 0,
};
