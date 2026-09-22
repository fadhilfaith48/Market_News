"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { DEFAULT_SYMBOLS, WATCHLIST_STORAGE_KEY } from "@/lib/constants";

const VALID_CODES = new Set(
  DEFAULT_SYMBOLS.map((symbol) => symbol.replace("USDT", "")),
);

interface WatchState {
  codes: string[];
  toggle: (code: string) => void;
}

export function sanitizeCodes(codes: unknown): string[] {
  if (!Array.isArray(codes)) return [];
  return codes.filter(
    (code): code is string => typeof code === "string" && VALID_CODES.has(code),
  );
}

export const useWatchStore = create<WatchState>()(
  persist(
    (set) => ({
      codes: [],
      toggle: (code) =>
        set((state) => {
          if (state.codes.includes(code)) {
            return { codes: state.codes.filter((item) => item !== code) };
          }
          if (!VALID_CODES.has(code)) return state;
          return { codes: [...state.codes, code] };
        }),
    }),
    {
      name: WATCHLIST_STORAGE_KEY,
      merge: (persisted, current) => {
        const persistedState = persisted as Partial<WatchState> | undefined;
        return {
          ...current,
          ...persistedState,
          codes: sanitizeCodes(persistedState?.codes),
        };
      },
    },
  ),
);

export function useIsWatched(code: string): boolean {
  return useWatchStore((state) => state.codes.includes(code));
}