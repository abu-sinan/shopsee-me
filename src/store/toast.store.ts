// @ts-nocheck
import { create } from "zustand";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id:       string;
  type:     ToastType;
  title:    string;
  message?: string;
  duration: number;
}

interface ToastStore {
  toasts:  Toast[];
  push:    (toast: Omit<Toast, "id">) => void;
  dismiss: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],

  push: (toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, toast.duration);
  },

  dismiss: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

/* Convenience helpers — call these from anywhere */
export const toast = {
  success: (title: string, message?: string) =>
    useToastStore.getState().push({ type: "success", title, message, duration: 3500 }),
  error: (title: string, message?: string) =>
    useToastStore.getState().push({ type: "error", title, message, duration: 5000 }),
  info: (title: string, message?: string) =>
    useToastStore.getState().push({ type: "info", title, message, duration: 3500 }),
  warning: (title: string, message?: string) =>
    useToastStore.getState().push({ type: "warning", title, message, duration: 4000 }),
};
