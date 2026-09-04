"use client";

import { useQuery } from "@tanstack/react-query";

interface RateResponse {
  rates: Record<string, number>;
  time_last_update_utc: string;
}

async function fetchRates(): Promise<RateResponse> {
  const res = await fetch("/api/rate");
  if (!res.ok) throw new Error("Failed to fetch rates");
  return res.json();
}

export function useFiatRates() {
  return useQuery({
    queryKey: ["rates"],
    queryFn: fetchRates,
    staleTime: 60 * 60 * 1000,
    gcTime: 2 * 60 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
}
