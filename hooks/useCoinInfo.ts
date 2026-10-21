"use client";

import { useQuery } from "@tanstack/react-query";

import type { CoinInfo } from "@/lib/adapters/coinInfo";

async function fetchCoinInfo(code: string): Promise<CoinInfo> {
  const res = await fetch(`/api/coin-info?code=${encodeURIComponent(code)}`);
  if (!res.ok) throw new Error("Gagal memuat info koin");
  const data = (await res.json()) as { info: CoinInfo };
  return data.info;
}

export function useCoinInfo(code: string) {
  return useQuery({
    queryKey: ["coin-info", code],
    queryFn: () => fetchCoinInfo(code),
    enabled: code.length > 0,
    staleTime: 60 * 60 * 1000,
    gcTime: 6 * 60 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
