import { create } from "zustand";

export type ScreenId =
  | "home"
  | "proposals"
  | "memory"
  | "reputation"
  | "disputes"
  | "settings";

export const SCREEN_TITLES: Record<ScreenId, string> = {
  home: "Command Center",
  proposals: "Proposal #47",
  memory: "Institutional Memory",
  reputation: "Reputation Engine",
  disputes: "Dispute #7",
  settings: "Settings",
};

interface ViewState {
  showLanding: boolean;
  screen: ScreenId;
  showNewProposal: boolean;
  go: (screen: ScreenId) => void;
  enterApp: () => void;
  goToLanding: () => void;
  openNewProposal: () => void;
  closeNewProposal: () => void;
}

export const useViewStore = create<ViewState>((set) => ({
  showLanding: true,
  screen: "home",
  showNewProposal: false,
  go: (screen) => set({ screen }),
  enterApp: () => set({ showLanding: false, screen: "home" }),
  goToLanding: () => set({ showLanding: true }),
  openNewProposal: () => set({ showNewProposal: true }),
  closeNewProposal: () => set({ showNewProposal: false }),
}));
