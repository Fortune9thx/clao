import type {
  CurrentDAO,
  GovernanceProfile,
  Proposal,
  GovernanceEngineState,
  TreasuryState,
} from "@/types";

// Seed state from the Bradbury brief — the exact PROP-402 scenario plus
// supporting proposals so the feed and timeline feel like a living org.

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

export const PROPOSALS: Proposal[] = [
  {
    id: "PROP-402",
    title: "Release Milestone 2 Payout for Dev Core Team",
    proposer: "0xAlphaBuilder",
    requested_amount: "50,000 USDC",
    status: "GenLayer_Validation",
    cognitive_metrics: {
      risk_score: 34,
      reputation_weight: 88,
      precedent_match: "94%",
      quorum_required: "65%",
    },
    validator_consensus: {
      current_agreement: 82,
      status: "Reaching Subjective Consensus",
      arguments_for: "Code verified on GitHub milestone tracking.",
      arguments_against: "Formatting deviation in report submission.",
    },
  },
  {
    id: "PROP-401",
    title: "Adopt Adaptive Quorum for Treasury Proposals > $100k",
    proposer: "0xGovSteward",
    requested_amount: "0 USDC",
    status: "Validated",
    cognitive_metrics: {
      risk_score: 21,
      reputation_weight: 76,
      precedent_match: "71%",
      quorum_required: "60%",
    },
    validator_consensus: {
      current_agreement: 91,
      status: "Consensus Finalized",
      arguments_for: "Reduces governance capture risk on large outflows.",
      arguments_against: "Adds latency to time-sensitive payouts.",
    },
  },
  {
    id: "PROP-400",
    title: "Grant: Independent Security Audit of Vault v2",
    proposer: "0xSecDAO",
    requested_amount: "120,000 USDC",
    status: "Disputed",
    cognitive_metrics: {
      risk_score: 57,
      reputation_weight: 64,
      precedent_match: "48%",
      quorum_required: "70%",
    },
    validator_consensus: {
      current_agreement: 58,
      status: "Subjective Dispute Open",
      arguments_for: "Vault v2 holds majority of treasury; audit is prudent.",
      arguments_against: "Auditor reputation unverified; scope ambiguous.",
    },
  },
  {
    id: "PROP-399",
    title: "Quarterly Contributor Retro Rewards",
    proposer: "0xContribOps",
    requested_amount: "18,500 USDC",
    status: "Treasury_Released",
    cognitive_metrics: {
      risk_score: 12,
      reputation_weight: 81,
      precedent_match: "97%",
      quorum_required: "55%",
    },
    validator_consensus: {
      current_agreement: 96,
      status: "Executed Onchain",
      arguments_for: "Strong precedent; low risk; verified contributions.",
      arguments_against: "None material.",
    },
  },
];

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
