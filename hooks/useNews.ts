"use client";

import { useQuery } from "@tanstack/react-query";

import type { Article } from "@/lib/news";

interface NewsResponse {
  articles: Article[];
}

async function fetchNewsFeed(): Promise<Article[]> {
  const res = await fetch("/api/news");
  if (!res.ok) throw new Error("Gagal memuat berita");
  const data = (await res.json()) as NewsResponse;
  return data.articles;
}

export function useNews() {
  return useQuery({
    queryKey: ["news"],
    queryFn: fetchNewsFeed,
    staleTime: 300_000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
}