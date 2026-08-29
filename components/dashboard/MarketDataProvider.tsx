"use client";

import { useCallback } from "react";

import { useBinanceWS } from "@/hooks/useBinanceWS";
import { DEFAULT_SYMBOLS } from "@/lib/constants";
import { useMarketStore } from "@/store/marketStore";
import { useUIStore } from "@/store/uiStore";
import type { TickerWS } from "@/types";

export function MarketDataProvider({ children }: { children: React.ReactNode }) {
  const applyTicker = useMarketStore((state) => state.applyTicker);
  const setConnectionStatus = useUIStore((state) => state.setConnectionStatus);

  const handleTicker = useCallback(
    (ticker: TickerWS) => applyTicker(ticker),
    [applyTicker],
  );

  useBinanceWS({
    symbols: [...DEFAULT_SYMBOLS],
    onTicker: handleTicker,
    onStatusChange: setConnectionStatus,
  });

  return children;
}