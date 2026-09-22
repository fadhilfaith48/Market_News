"use client";

import { useCallback, useMemo, useState } from "react";

import { useBinanceWS } from "@/hooks/useBinanceWS";
import { useTickerPolling } from "@/hooks/useTickerPolling";
import { DEFAULT_SYMBOLS } from "@/lib/constants";
import { useMarketStore } from "@/store/marketStore";
import { useUIStore } from "@/store/uiStore";
import type { TickerWS } from "@/types";
import { MarketDataContext } from "@/components/dashboard/marketDataContext";

export function MarketDataProvider({ children }: { children: React.ReactNode }) {
  const applyTickers = useMarketStore((state) => state.applyTickers);
  const setConnectionStatus = useUIStore((state) => state.setConnectionStatus);

  const [retryCounter, setRetryCounter] = useState(0);
  const retryConnection = useCallback(
    () => setRetryCounter((counter) => counter + 1),
    [],
  );

  const contextValue = useMemo(
    () => ({ retryConnection }),
    [retryConnection],
  );

  const handleTickers = useCallback(
    (tickers: TickerWS[]) => applyTickers(tickers),
    [applyTickers],
  );

  useBinanceWS({
    symbols: [...DEFAULT_SYMBOLS],
    onTickers: handleTickers,
    onStatusChange: setConnectionStatus,
    retryCounter,
  });

  useTickerPolling();

  return (
    <MarketDataContext.Provider value={contextValue}>
      {children}
    </MarketDataContext.Provider>
  );
}