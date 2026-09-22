import { create } from "zustand";

import type { TickerWS } from "@/types";

interface MarketState {
  tickers: Record<string, TickerWS>;
  previousLastPrice: Record<string, number>;
  lastUpdate: number | null;
  applyTicker: (ticker: TickerWS) => void;
  applyTickers: (tickers: TickerWS[]) => void;
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
  applyTickers: (tickers) =>
    set((state) => {
      const nextTickers = { ...state.tickers };
      const nextPreviousLastPrice = { ...state.previousLastPrice };
      for (const ticker of tickers) {
        const prev = nextTickers[ticker.symbol]?.lastPrice;
        if (prev !== undefined) nextPreviousLastPrice[ticker.symbol] = prev;
        nextTickers[ticker.symbol] = ticker;
      }
      return {
        tickers: nextTickers,
        previousLastPrice: nextPreviousLastPrice,
        lastUpdate: Date.now(),
      };
    }),
}));