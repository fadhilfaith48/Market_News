import { create } from "zustand";

import type { TickerWS } from "@/types";

interface MarketState {
  tickers: Record<string, TickerWS>;
  applyTicker: (ticker: TickerWS) => void;
}

export const useMarketStore = create<MarketState>()((set) => ({
  tickers: {},
  applyTicker: (ticker) =>
    set((state) => ({
      tickers: { ...state.tickers, [ticker.symbol]: ticker },
    })),
}));