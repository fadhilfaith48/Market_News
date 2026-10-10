import { fetchCoinGeckoAssets } from "./coingecko";
import { fetchCoinPaprikaAssets } from "./coinpaprika";
import type { CoinMarketAsset, CoinsResult } from "./types";

export interface CoinFetchers {
  coingecko: (codes: string[]) => Promise<CoinMarketAsset[]>;
  coinpaprika: (codes: string[]) => Promise<CoinMarketAsset[]>;
}

export const defaultCoinFetchers: CoinFetchers = {
  coingecko: fetchCoinGeckoAssets,
  coinpaprika: fetchCoinPaprikaAssets,
};

export async function getCoinMarketAssets(
  codes: string[],
  fetchers: CoinFetchers = defaultCoinFetchers,
): Promise<CoinsResult> {
  const primary = await Promise.resolve()
    .then(() => fetchers.coingecko(codes))
    .catch(() => [] as CoinMarketAsset[]);

  if (primary.length > 0) return { coins: primary, source: "coingecko" };

  const coins = await fetchers.coinpaprika(codes);
  return { coins, source: "coinpaprika" };
}