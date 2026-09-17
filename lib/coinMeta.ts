const ICON_BASE =
  "https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@master/svg/color";

const LOGO_OVERRIDES: Record<string, string> = {
  SHIB: "https://assets.coingecko.com/coins/images/11939/small/shiba.png",
  NEAR: "https://assets.coingecko.com/coins/images/10365/small/near.png",
  POL: `${ICON_BASE}/poly.svg`,
};

export const COINGECKO_IDS: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  BNB: "binancecoin",
  SOL: "solana",
  XRP: "ripple",
  ADA: "cardano",
  DOGE: "dogecoin",
  AVAX: "avalanche-2",
  LINK: "chainlink",
  POL: "polygon-ecosystem-token",
  DOT: "polkadot",
  LTC: "litecoin",
  UNI: "uniswap",
  SHIB: "shiba-inu",
  TRX: "tron",
  ATOM: "cosmos",
  NEAR: "near",
  FIL: "filecoin",
  ALGO: "algorand",
  VET: "vechain",
};

export function getCoinGeckoId(code: string): string | undefined {
  return COINGECKO_IDS[code];
}

export const COIN_NAMES: Record<string, string> = {
  BTC: "Bitcoin",
  ETH: "Ethereum",
  BNB: "BNB",
  SOL: "Solana",
  XRP: "XRP",
  ADA: "Cardano",
  DOGE: "Dogecoin",
  AVAX: "Avalanche",
  LINK: "Chainlink",
  POL: "Polygon (POL)",
  DOT: "Polkadot",
  LTC: "Litecoin",
  UNI: "Uniswap",
  SHIB: "Shiba Inu",
  TRX: "Tron",
  ATOM: "Cosmos",
  NEAR: "NEAR Protocol",
  FIL: "Filecoin",
  ALGO: "Algorand",
  VET: "VeChain",
};

export interface CoinMeta {
  code: string;
  name: string;
  logo: string;
}

export function getCoinMeta(symbol: string): CoinMeta {
  const code = symbol.replace(/USDT$/, "");
  const base = COIN_NAMES[code] ? code : symbol;
  const logo =
    LOGO_OVERRIDES[base] ?? `${ICON_BASE}/${base.toLowerCase()}.svg`;
  return { code: base, name: COIN_NAMES[base] ?? symbol, logo };
}