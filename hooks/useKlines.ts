"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { KLINE_LIMIT } from "@/lib/constants";
import type { Kline } from "@/types";

export function useKlines(symbol: string, interval: string) {
  return useQuery({
    queryKey: ["klines", symbol, interval],
    queryFn: async () => {
      const res = await fetch(
        `/api/klines?symbol=${encodeURIComponent(symbol)}&interval=${encodeURIComponent(interval)}&limit=${KLINE_LIMIT}`,
      );
      if (!res.ok) throw new Error("Gagal memuat data candlestick");
      return (await res.json()) as Kline[];
    },
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });
}