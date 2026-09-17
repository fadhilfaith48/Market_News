"use client";

import { useQuery } from "@tanstack/react-query";

import type { CoinMarketData } from "@/types";

interface CoinMarketResponse {
  coins: CoinMarketData[];
}

async function fetchCoinMarket(): Promise<CoinMarketResponse> {
  const res = await fetch("/api/coins");
  if (!res.ok) throw new Error("Failed to fetch coin market data");
  return res.json();
}

export function useCoinMarket() {
  return useQuery({
    queryKey: ["coin-market"],
    queryFn: fetchCoinMarket,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
}