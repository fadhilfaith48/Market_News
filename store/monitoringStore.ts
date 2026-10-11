"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { appendLog, createLogEntry, sanitizeLogs } from "@/lib/monitoring";
import type { DiagnosticEntry, LogLevel } from "@/lib/monitoring";
import { DIAGNOSTICS_STORAGE_KEY } from "@/lib/constants";

interface MonitoringState {
  entries: DiagnosticEntry[];
  viewedAt: number;
  add: (
    level: LogLevel,
    scope: string,
    message: string,
    detail?: string,
  ) => void;
  addEntry: (entry: DiagnosticEntry) => void;
  clear: () => void;
  markViewed: () => void;
}

export const useMonitoringStore = create<MonitoringState>()(
  persist(
    (set, get) => ({
      entries: [],
      viewedAt: 0,
      add: (level, scope, message, detail) =>
        set({
          entries: appendLog(
            get().entries,
            createLogEntry(level, scope, message, detail),
          ),
        }),
      addEntry: (entry) =>
        set({ entries: appendLog(get().entries, entry) }),
      clear: () => set({ entries: [] }),
      markViewed: () => set({ viewedAt: Date.now() }),
    }),
    {
      name: DIAGNOSTICS_STORAGE_KEY,
      merge: (persisted, current) => {
        const persistedState = persisted as
          | Partial<MonitoringState>
          | undefined;
        return {
          ...current,
          ...persistedState,
          entries: sanitizeLogs(persistedState?.entries),
        };
      },
    },
  ),
);
