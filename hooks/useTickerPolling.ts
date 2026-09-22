"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { TICKER_POLL_INTERVAL_MS } from "@/lib/constants";
import { useMarketStore } from "@/store/marketStore";
import { useUIStore } from "@/store/uiStore";
import type { TickerWS } from "@/types";

interface TickersResponse {
  tickers: TickerWS[];
}

async function fetchTickers(): Promise<TickersResponse> {
  const res = await fetch("/api/tickers");
  if (!res.ok) throw new Error("Failed to fetch tickers");
  return res.json();
}

export function useTickerPolling() {
  const connectionStatus = useUIStore((state) => state.connectionStatus);
  const applyTickers = useMarketStore((state) => state.applyTickers);
  const setDataSource = useUIStore((state) => state.setDataSource);

  const shouldPoll = connectionStatus !== "online";

  const { data } = useQuery({
    queryKey: ["rest-tickers"],
    queryFn: fetchTickers,
    enabled: shouldPoll,
    refetchInterval: shouldPoll ? TICKER_POLL_INTERVAL_MS : false,
    staleTime: TICKER_POLL_INTERVAL_MS,
    retry: 3,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (!shouldPoll) {
      setDataSource("ws");
      return;
    }
    if (data && data.tickers.length > 0) {
      applyTickers(data.tickers);
      setDataSource("rest");
    }
  }, [shouldPoll, data, applyTickers, setDataSource]);
}