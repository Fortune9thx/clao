import type { MemoryEvent } from "@/types";

// Institutional Memory Timeline seed. `relatedIds` create the semantic
// precedent lines drawn between nodes in the bottom panel.

const now = Date.now();
const days = (n: number) => now - n * 86_400_000;

export const MEMORY_EVENTS: MemoryEvent[] = [
  {
    id: "M-390",
    type: "precedent",
    title: "Milestone Payout Standard Ratified",
    proposalId: "PROP-380",
    timestamp: days(64),
    summary: "Established GitHub-verified milestone tracking as payout precedent.",
    relatedIds: ["M-399", "M-402"],
  },
  {
    id: "M-399",
    type: "ruling",
    title: "Contributor Retro Rewards Approved",
    proposalId: "PROP-399",
    timestamp: days(28),
    verdict: "Approved",
    summary: "96% subjective consensus. Treasury released 18,500 USDC.",
    relatedIds: ["M-390"],
    tx: "0xmem399…executed",
  },
  {
    id: "M-401",
    type: "ruling",
    title: "Adaptive Quorum Policy Validated",
    proposalId: "PROP-401",
    timestamp: days(12),
    verdict: "Approved",
    summary: "Adaptive quorum adopted for outflows over $100k.",
    relatedIds: ["M-400", "M-402"],
    tx: "0xmem401…finalized",
  },
  {
    id: "M-400",
    type: "dispute",
    title: "Vault v2 Audit Grant Disputed",
    proposalId: "PROP-400",
    timestamp: days(6),
    summary: "Subjective dispute opened over auditor reputation and scope.",
    relatedIds: ["M-401"],
  },
  {
    id: "M-402",
    type: "proposal",
    title: "Milestone 2 Payout Under Validation",
    proposalId: "PROP-402",
    timestamp: days(1),
    summary: "94% precedent match against ratified payout standard.",
    relatedIds: ["M-390", "M-399"],
  },
];
