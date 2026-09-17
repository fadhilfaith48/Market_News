const ICON_BASE =
  "https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@master/svg/color";

const LOGO_OVERRIDES: Record<string, string> = {
  SHIB: "https://assets.coingecko.com/coins/images/11939/small/shiba.png",
  NEAR: "https://assets.coingecko.com/coins/images/10365/small/near.png",
  POL: `${ICON_BASE}/poly.svg`,
  RENDER: `${ICON_BASE}/rndr.svg`,
  WIF: `${ICON_BASE}/wif.svg`,
  BONK: `${ICON_BASE}/bonk.svg`,
  TAO: `${ICON_BASE}/bittensor.svg`,
  ONDO: `${ICON_BASE}/ondo.svg`,
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
  TON: "the-open-network",
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
  APT: "aptos",
  ARB: "arbitrum",
  OP: "optimism",
  ICP: "internet-computer",
  SUI: "sui",
  INJ: "injective-protocol",
  RENDER: "render-token",
  PEPE: "pepe",
  WIF: "dogwifcoin",
  BONK: "bonk",
  XLM: "stellar",
  HBAR: "hedera-hashgraph",
  ETC: "ethereum-classic",
  IMX: "immutable-x",
  SEI: "sei-network",
  TAO: "bittensor",
  AAVE: "aave",
  MKR: "maker",
  LDO: "lido-dao",
  GRT: "the-graph",
  FLOW: "flow",
  STX: "blockstack",
  SAND: "the-sandbox",
  MANA: "decentraland",
  AXS: "axie-infinity",
  THETA: "theta-token",
  ONDO: "ondo-finance",
  FET: "fetch-ai",
  DYDX: "dydx",
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
  TON: "Toncoin",
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
  APT: "Aptos",
  ARB: "Arbitrum",
  OP: "Optimism",
  ICP: "Internet Computer",
  SUI: "Sui",
  INJ: "Injective",
  RENDER: "Render",
  PEPE: "Pepe",
  WIF: "dogwifhat",
  BONK: "Bonk",
  XLM: "Stellar",
  HBAR: "Hedera",
  ETC: "Ethereum Classic",
  IMX: "Immutable",
  SEI: "Sei",
  TAO: "Bittensor",
  AAVE: "Aave",
  MKR: "Maker",
  LDO: "Lido DAO",
  GRT: "The Graph",
  FLOW: "Flow",
  STX: "Stacks",
  SAND: "The Sandbox",
  MANA: "Decentraland",
  AXS: "Axie Infinity",
  THETA: "Theta Network",
  ONDO: "Ondo Finance",
  FET: "Fetch.ai",
  DYDX: "dYdX",
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