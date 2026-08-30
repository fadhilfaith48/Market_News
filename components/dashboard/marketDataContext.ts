"use client";

import { createContext, useContext } from "react";

interface MarketDataContextValue {
  retryConnection: () => void;
}

export const MarketDataContext = createContext<MarketDataContextValue>({
  retryConnection: () => {},
});

export function useMarketDataContext() {
  return useContext(MarketDataContext);
}