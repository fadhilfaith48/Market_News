"use client";

import { useQuery } from "@tanstack/react-query";

import type { GlobalMarket } from "@/lib/adapters/global";

interface GlobalResponse {
  market: GlobalMarket | null;
}

async function fetchGlobalMarketFeed(): Promise<GlobalMarket | null> {
  const res = await fetch("/api/global");
  if (!res.ok) throw new Error("Gagal memuat statistik pasar");
  const data = (await res.json()) as GlobalResponse;
  return data.market;
}

export function useGlobalMarket() {
  return useQuery({
    queryKey: ["global-market"],
    queryFn: fetchGlobalMarketFeed,
    staleTime: 300_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}