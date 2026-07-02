import { create } from "zustand";

export type ToastKind = "info" | "success" | "warning" | "error" | "tx";

export interface Toast {
  id: string;
  kind: ToastKind;
  title: string;
  body?: string;
  duration?: number; // ms; 0 = persist until dismissed
}

interface ToastStore {
  toasts: Toast[];
  addToast: (t: Omit<Toast, "id">) => string;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],

  addToast: (t) => {
    const id = `t-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    set((s) => ({ toasts: [...s.toasts, { ...t, id }] }));
    const dur = t.duration ?? 4000;
    if (dur > 0) setTimeout(() => get().removeToast(id), dur);
    return id;
  },

  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

// Fire-and-forget helpers — call from anywhere, no hook needed
export const toast = {
  info:    (title: string, body?: string) =>
    useToastStore.getState().addToast({ kind: "info",    title, body }),
  success: (title: string, body?: string) =>
    useToastStore.getState().addToast({ kind: "success", title, body }),
  warning: (title: string, body?: string) =>
    useToastStore.getState().addToast({ kind: "warning", title, body }),
  error:   (title: string, body?: string) =>
    useToastStore.getState().addToast({ kind: "error",   title, body, duration: 6000 }),
  tx:      (title: string, body?: string, duration = 0) =>
    useToastStore.getState().addToast({ kind: "tx",      title, body, duration }),
};
