export interface GlobalMarket {
  totalMarketCapUsd: number | null;
  totalVolumeUsd: number | null;
  marketCapChange24h: number | null;
  btcDominance: number | null;
  ethDominance: number | null;
  updatedAt: number | null;
}

const COINGECKO_GLOBAL_API = "https://api.coingecko.com/api/v3/global";
const FETCH_TIMEOUT_MS = 6_000;
const REVALIDATE_SECONDS = 300;

function toNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function normalizeCoinGeckoGlobal(raw: unknown): GlobalMarket | null {
  if (!raw || typeof raw !== "object") return null;
  const data = (raw as Record<string, unknown>).data;
  if (!data || typeof data !== "object") return null;

  const outer = data as Record<string, unknown>;
  const totalMarketCapUsd = toNumber(
    (
      outer.total_market_cap as
        | Record<string, unknown>
        | undefined
    )?.usd,
  );
  if (totalMarketCapUsd === null) return null;

  return {
    totalMarketCapUsd,
    totalVolumeUsd: toNumber(
      (outer.total_volume as Record<string, unknown> | undefined)?.usd,
    ),
    marketCapChange24h: toNumber(outer.market_cap_change_percentage_24h_usd),
    btcDominance: toNumber(
      (outer.market_cap_percentage as Record<string, unknown> | undefined)?.btc,
    ),
    ethDominance: toNumber(
      (outer.market_cap_percentage as Record<string, unknown> | undefined)?.eth,
    ),
    updatedAt: toNumber(outer.updated_at),
  };
}

export async function fetchGlobalMarket(): Promise<GlobalMarket | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(COINGECKO_GLOBAL_API, {
      next: { revalidate: REVALIDATE_SECONDS },
      signal: controller.signal,
    });
    if (!res.ok) return null;
    return normalizeCoinGeckoGlobal(await res.json());
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}