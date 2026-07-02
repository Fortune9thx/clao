// CLAO character (computational spirit) — state model.
// These map 1:1 onto the Rive state-machine inputs documented in
// /animations/claoStates.ts so the placeholder can be swapped for a .riv
// file with zero call-site changes.

export type ClaoMood =
  | "idle"
  | "thinking"
  | "warning"
  | "success"
  | "explaining"
  | "listening"
  | "alert";

/** Boolean Rive inputs — exactly one is the "active" mood at a time. */
export interface ClaoBooleanInputs {
  isIdle: boolean;
  isThinking: boolean;
  isWarning: boolean;
  isSuccess: boolean;
  isExplaining: boolean;
  isListening: boolean;
  isAlert: boolean;
}

/** Numeric Rive inputs (0-100). */
export interface ClaoNumericInputs {
  excitementLevel: number;
  confidenceLevel: number;
}

/** Fire-and-forget Rive triggers bound to major app events. */
export type ClaoTrigger =
  | "proposalSelected"
  | "disputeOpened"
  | "executionSuccess"
  | "anomalyDetected";

export interface ClaoState extends ClaoNumericInputs {
  mood: ClaoMood;
  /** Short line CLAO "says" in the HUD caption. */
  caption: string;
  /** Last trigger fired, consumed by the Rive component. */
  pendingTrigger: ClaoTrigger | null;
}
