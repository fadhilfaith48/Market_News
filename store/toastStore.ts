import { create } from "zustand";

export type ToastTone = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  tone: ToastTone;
  title: string;
  description?: string;
}

interface ToastState {
  toasts: Toast[];
  add: (tone: ToastTone, title: string, description?: string) => string;
  dismiss: (id: string) => void;
  clear: () => void;
}

let counter = 0;

function makeId(): string {
  counter += 1;
  return `${Date.now().toString(36)}-${counter.toString(36)}`;
}

/**
 * Store toast ringan (tanpa dependency) untuk umpan balik aksi pengguna.
 * Toast tidak di-persist; auto-dismiss di sisi komponen `Toaster`.
 */
export const useToastStore = create<ToastState>()((set) => ({
  toasts: [],
  add: (tone, title, description) => {
    const id = makeId();
    set((state) => ({ toasts: [...state.toasts, { id, tone, title, description }] }));
    return id;
  },
  dismiss: (id) =>
    set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
  clear: () => set({ toasts: [] }),
}));
