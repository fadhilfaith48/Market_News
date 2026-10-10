export interface CoinMarketAsset {
  code: string;
  marketCap: number | null;
  circulatingSupply: number | null;
  maxSupply: number | null;
}

export type MarketSource = "coingecko" | "coinpaprika";

export interface CoinsResult {
  coins: CoinMarketAsset[];
  source: MarketSource;
}