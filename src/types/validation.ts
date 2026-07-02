// GenLayer Live Validation Stream — the center-stage cognitive process model.

export type ValidationPhase =
  | "idle"
  | "ingesting" // pulling proposal + precedent context
  | "reasoning" // validators run LLM reasoning
  | "precedent" // matching institutional memory
  | "consensus" // converging on subjective agreement
  | "complete"
  | "disputed";

export type Stance = "for" | "against" | "pending";

export interface ValidatorNode {
  id: string;
  label: string;
  stance: Stance;
  weight: number; // 0-1 influence
  confidence: number; // 0-100
}

export type ReasoningKind = "info" | "for" | "against" | "precedent" | "verdict";

export interface ReasoningLine {
  id: string;
  t: number;
  kind: ReasoningKind;
  text: string;
}

export interface ValidationState {
  active: boolean;
  proposalId?: string;
  phase: ValidationPhase;
  agreement: number; // live subjective consensus %
  nodes: ValidatorNode[];
  log: ReasoningLine[];
}
