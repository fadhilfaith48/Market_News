import { COINGECKO_IDS } from "@/lib/coinMeta";

import type { CoinMarketAsset } from "./types";

const COINGECKO_API = "https://api.coingecko.com/api/v3/coins/markets";
const FETCH_TIMEOUT_MS = 6_000;
const REVALIDATE_SECONDS = 300;

function toNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function normalizeCoinGecko(raw: unknown): CoinMarketAsset[] {
  if (!Array.isArray(raw)) return [];
  const codeById = new Map(
    Object.entries(COINGECKO_IDS).map(([code, id]) => [id, code]),
  );
  const assets: CoinMarketAsset[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const code = typeof row.id === "string" ? codeById.get(row.id) : undefined;
    if (!code) continue;
    assets.push({
      code,
      marketCap: toNumber(row.market_cap),
      circulatingSupply: toNumber(row.circulating_supply),
      maxSupply: toNumber(row.max_supply),
    });
  }
  return assets;
}

export async function fetchCoinGeckoAssets(
  codes: string[],
): Promise<CoinMarketAsset[]> {
  const codeSet = new Set(codes);
  const ids = Object.entries(COINGECKO_IDS)
    .filter(([code]) => codeSet.has(code))
    .map(([, id]) => id);
  if (ids.length === 0) return [];

  const url = `${COINGECKO_API}?vs_currency=usd&ids=${ids.join(",")}&per_page=250`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      next: { revalidate: REVALIDATE_SECONDS },
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`CoinGecko error ${res.status}`);
    return normalizeCoinGecko(await res.json());
  } finally {
    clearTimeout(timeout);
  }
}