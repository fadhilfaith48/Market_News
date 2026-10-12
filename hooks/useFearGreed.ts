"use client";

import { useQuery } from "@tanstack/react-query";

import type { FearGreedIndex } from "@/lib/fearGreed";

interface FearGreedResponse {
  index: FearGreedIndex | null;
}

async function fetchFearGreedIndex(): Promise<FearGreedIndex | null> {
  const res = await fetch("/api/fear-greed");
  if (!res.ok) throw new Error("Gagal memuat indeks ketakutan");
  const data = (await res.json()) as FearGreedResponse;
  return data.index;
}

export function useFearGreed() {
  return useQuery({
    queryKey: ["fear-greed"],
    queryFn: fetchFearGreedIndex,
    staleTime: 1800_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}