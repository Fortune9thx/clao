import type { ReputationState } from "@/types";

// Reputation Reasoning Engine seed (right panel). Composite is a weighted
// blend of the factors; history drives the confidence/history graph.

export const REPUTATION: ReputationState = {
  composite: 84,
  confidence: 91,
  factors: [
    { key: "credibility", label: "Governance Credibility", value: 88, weight: 0.3, delta: +3 },
    { key: "shippedCode", label: "Shipped Code", value: 92, weight: 0.3, delta: +6 },
    { key: "research", label: "Governance Research", value: 74, weight: 0.2, delta: +1 },
    { key: "reliability", label: "Historical Reliability", value: 81, weight: 0.2, delta: -2 },
  ],
  history: [62, 66, 64, 70, 73, 71, 77, 80, 79, 82, 84],
};
