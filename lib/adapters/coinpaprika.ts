import type { CoinMarketAsset } from "./types";

const COINPAPRIKA_API = "https://api.coinpaprika.com/v1/tickers";
const FETCH_TIMEOUT_MS = 6_000;
const REVALIDATE_SECONDS = 300;

export const COINPAPRIKA_IDS: Record<string, string> = {
  BTC: "btc-bitcoin",
  ETH: "eth-ethereum",
  BNB: "bnb-binance-coin",
  SOL: "sol-solana",
  XRP: "xrp-xrp",
  ADA: "ada-cardano",
  DOGE: "doge-dogecoin",
  AVAX: "avax-avalanche",
  LINK: "link-chainlink",
  POL: "pol-polygon-ecosystem-token",
  LTC: "ltc-litecoin",
  UNI: "uni-uniswap",
  SHIB: "shib-shiba-inu",
  TRX: "trx-tron",
  ATOM: "atom-cosmos",
  NEAR: "near-near-protocol",
  FIL: "fil-filecoin",
  ALGO: "algo-algorand",
  VET: "vet-vechain",
  APT: "apt-aptos",
  ARB: "arb-arbitrum",
  OP: "op-optimism",
  ICP: "icp-internet-computer",
  SUI: "sui-sui",
  INJ: "inj-injective-protocol",
  RENDER: "rndr-render-token",
  PEPE: "pepe-pepe",
  WIF: "wif-dogwifcoin",
  BONK: "bonk-bonk",
  XLM: "xlm-stellar",
  HBAR: "hbar-hedera-hashgraph",
  ETC: "etc-ethereum-classic",
  IMX: "imx-immutable-x",
  SEI: "sei-sei",
  TAO: "tao-bittensor",
  AAVE: "aave-new",
  MKR: "mkr-maker",
  LDO: "ldo-lido-dao",
  GRT: "grt-the-graph",
  FLOW: "flow-flow",
  STX: "stx-stacks",
  SAND: "sand-the-sandbox",
  MANA: "mana-decentraland",
  AXS: "axs-axie-infinity",
  THETA: "theta-theta-token",
  ONDO: "ondo-ondo",
  FET: "fetch-ai",
  DYDX: "dydx-dydx-chain",
};

function toNumber(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export function normalizeCoinPaprika(raw: unknown): CoinMarketAsset[] {
  if (!Array.isArray(raw)) return [];
  const codeById = new Map(
    Object.entries(COINPAPRIKA_IDS).map(([code, id]) => [id, code]),
  );
  const assets: CoinMarketAsset[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const code = typeof row.id === "string" ? codeById.get(row.id) : undefined;
    if (!code) continue;
    const quotes =
      row.quotes && typeof row.quotes === "object"
        ? (row.quotes as Record<string, unknown>)
        : undefined;
    const usd =
      quotes && typeof quotes.USD === "object" && quotes.USD !== null
        ? (quotes.USD as Record<string, unknown>)
        : undefined;
    assets.push({
      code,
      marketCap: toNumber(usd?.market_cap),
      circulatingSupply: toNumber(row.total_supply),
      maxSupply: toNumber(row.max_supply),
    });
  }
  return assets;
}

export async function fetchCoinPaprikaAssets(
  codes: string[],
): Promise<CoinMarketAsset[]> {
  const codeSet = new Set(codes);
  const url = `${COINPAPRIKA_API}?quotes=USD`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      next: { revalidate: REVALIDATE_SECONDS },
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`CoinPaprika error ${res.status}`);
    const rows = await res.json();
    return normalizeCoinPaprika(rows).filter((asset) => codeSet.has(asset.code));
  } finally {
    clearTimeout(timeout);
  }
}