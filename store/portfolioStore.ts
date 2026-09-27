"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { PORTFOLIO_STORAGE_KEY, VALID_CODES } from "@/lib/constants";
import type { Holding } from "@/lib/portfolio";

interface PortfolioState {
  holdings: Record<string, Holding>;
  upsert: (code: string, qty: number, avgCost: number) => void;
  remove: (code: string) => void;
}

export function sanitizeHoldings(holdings: unknown): Record<string, Holding> {
  if (!holdings || typeof holdings !== "object" || Array.isArray(holdings)) {
    return {};
  }
  const result: Record<string, Holding> = {};
  for (const [code, value] of Object.entries(holdings)) {
    if (!VALID_CODES.has(code)) continue;
    if (!value || typeof value !== "object") continue;
    const holding = value as Record<string, unknown>;
    const { qty, avgCost } = holding;
    if (typeof qty !== "number" || typeof avgCost !== "number") continue;
    if (!Number.isFinite(qty) || !Number.isFinite(avgCost)) continue;
    if (qty < 0 || avgCost < 0) continue;
    result[code] = { qty, avgCost };
  }
  return result;
}

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set) => ({
      holdings: {},
      upsert: (code, qty, avgCost) =>
        set((state) => {
          if (!VALID_CODES.has(code)) return state;
          if (!Number.isFinite(qty) || !Number.isFinite(avgCost)) return state;
          if (qty < 0 || avgCost < 0) return state;
          return {
            holdings: { ...state.holdings, [code]: { qty, avgCost } },
          };
        }),
      remove: (code) =>
        set((state) => {
          const next = { ...state.holdings };
          if (!(code in next)) return state;
          delete next[code];
          return { holdings: next };
        }),
    }),
    {
      name: PORTFOLIO_STORAGE_KEY,
      merge: (persisted, current) => {
        const persistedState = persisted as Partial<PortfolioState> | undefined;
        return {
          ...current,
          ...persistedState,
          holdings: sanitizeHoldings(persistedState?.holdings),
        };
      },
    },
  ),
);