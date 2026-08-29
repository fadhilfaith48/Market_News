const ICON_BASE =
  "https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@master/svg/color";

const LOGO_OVERRIDES: Record<string, string> = {
  SHIB: "https://assets.coingecko.com/coins/images/11939/small/shiba.png",
  NEAR: "https://assets.coingecko.com/coins/images/10365/small/near.png",
};

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
  MATIC: "Polygon",
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