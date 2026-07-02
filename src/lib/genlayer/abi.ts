import type { ContractWriteMethod } from "@/types";

// Lightweight descriptor of the CLAORegistry write surface. This keeps the UI,
// the toast labels, and the CLAO character reactions referencing the SAME set of
// real contract entrypoints — proving every option is actually written to.

export interface WriteMethodMeta {
  method: ContractWriteMethod;
  label: string; // human label for tx toasts / history
  /** Whether this method invokes the LLM / Equivalence Principle on-chain. */
  cognitive: boolean;
  payable?: boolean;
}

export const WRITE_METHODS: Record<ContractWriteMethod, WriteMethodMeta> = {
  register_dao: { method: "register_dao", label: "Register DAO", cognitive: false },
  submit_proposal: { method: "submit_proposal", label: "Submit Proposal", cognitive: false },
  cast_cognitive_vote: {
    method: "cast_cognitive_vote",
    label: "Cognitive Validation",
    cognitive: true,
  },
  record_ruling: { method: "record_ruling", label: "Record Ruling", cognitive: false },
  open_dispute: { method: "open_dispute", label: "Open Dispute", cognitive: false },
  resolve_dispute: {
    method: "resolve_dispute",
    label: "Adjudicate Dispute",
    cognitive: true,
  },
  finalize_execution: {
    method: "finalize_execution",
    label: "Finalize Execution",
    cognitive: false,
    payable: true,
  },
  update_reputation: { method: "update_reputation", label: "Update Reputation", cognitive: false },
};

export const CONTRACT_ADDRESS = import.meta.env.VITE_CLAO_ADDRESS as
  | `0x${string}`
  | undefined;
