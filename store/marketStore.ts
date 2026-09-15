import { create } from "zustand";

import type { TickerWS } from "@/types";

interface MarketState {
  tickers: Record<string, TickerWS>;
  previousLastPrice: Record<string, number>;
  lastUpdate: number | null;
  applyTicker: (ticker: TickerWS) => void;
}

export const useMarketStore = create<MarketState>()((set) => ({
  tickers: {},
  previousLastPrice: {},
  lastUpdate: null,
  applyTicker: (ticker) =>
    set((state) => {
      const prev = state.tickers[ticker.symbol]?.lastPrice;
      return {
        tickers: { ...state.tickers, [ticker.symbol]: ticker },
        lastUpdate: Date.now(),
        previousLastPrice:
          prev !== undefined
            ? { ...state.previousLastPrice, [ticker.symbol]: prev }
            : state.previousLastPrice,
      };
    }),
}));