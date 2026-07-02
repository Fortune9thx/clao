import { create } from "zustand";

export type ScreenId =
  | "home"
  | "proposals"
  | "memory"
  | "reputation"
  | "disputes"
  | "settings";

export type LandingPageId = "home" | "terms" | "privacy" | "disclaimers" | "blog" | "docs";

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
  landingPage: LandingPageId;
  go: (screen: ScreenId) => void;
  enterApp: (screen?: ScreenId) => void;
  goToLanding: () => void;
  goLandingPage: (page: LandingPageId) => void;
  openNewProposal: () => void;
  closeNewProposal: () => void;
}

export const useViewStore = create<ViewState>((set) => ({
  showLanding: true,
  screen: "home",
  showNewProposal: false,
  landingPage: "home",
  go: (screen) => set({ screen }),
  enterApp: (screen = "home") => set({ showLanding: false, screen }),
  goToLanding: () => set({ showLanding: true, landingPage: "home" }),
  goLandingPage: (page) => set({ landingPage: page }),
  openNewProposal: () => set({ showNewProposal: true }),
  closeNewProposal: () => set({ showNewProposal: false }),
}));
