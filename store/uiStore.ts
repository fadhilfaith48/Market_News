"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { UI_STORAGE_KEY } from "@/lib/constants";
import type { ConnectionStatus, Theme } from "@/types";

interface UIState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  currency: string;
  setCurrency: (currency: string) => void;
  connectionStatus: ConnectionStatus;
  setConnectionStatus: (status: ConnectionStatus) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      theme: "dark",
      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set({ theme: get().theme === "dark" ? "light" : "dark" }),
      currency: "USD",
      setCurrency: (currency) => set({ currency }),
      connectionStatus: "connecting",
      setConnectionStatus: (connectionStatus) => set({ connectionStatus }),
    }),
    {
      name: UI_STORAGE_KEY,
      partialize: (state) => ({ theme: state.theme, currency: state.currency }),
    },
  ),
);