"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { WATCHLIST_STORAGE_KEY } from "@/lib/constants";

interface WatchState {
  codes: string[];
  toggle: (code: string) => void;
}

export const useWatchStore = create<WatchState>()(
  persist(
    (set) => ({
      codes: [],
      toggle: (code) =>
        set((state) => ({
          codes: state.codes.includes(code)
            ? state.codes.filter((item) => item !== code)
            : [...state.codes, code],
        })),
    }),
    {
      name: WATCHLIST_STORAGE_KEY,
    },
  ),
);

export function useIsWatched(code: string): boolean {
  return useWatchStore((state) => state.codes.includes(code));
}