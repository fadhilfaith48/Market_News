export const BINANCE_WS_ENDPOINTS = [
  "wss://stream.binance.com:9443/stream",
  "wss://data-stream.binance.vision:9443/stream",
] as const;

export const WS_ENDPOINT_STORAGE_KEY = "binance-ws-endpoint";
export const WS_CONNECT_TIMEOUT_MS = 5_000;
export const WS_RECONNECT_MIN_DELAY_MS = 1_000;
export const WS_RECONNECT_MAX_DELAY_MS = 15_000;

export const TICKER_POLL_INTERVAL_MS = 5_000;

export const TICKER_BATCH_FLUSH_MS = 250;

export const DEFAULT_SYMBOLS = [
  "BTCUSDT",
  "ETHUSDT",
  "BNBUSDT",
  "SOLUSDT",
  "XRPUSDT",
  "ADAUSDT",
  "DOGEUSDT",
  "AVAXUSDT",
  "LINKUSDT",
  "TONUSDT",
  "POLUSDT",
  "DOTUSDT",
  "LTCUSDT",
  "UNIUSDT",
  "SHIBUSDT",
  "TRXUSDT",
  "ATOMUSDT",
  "NEARUSDT",
  "FILUSDT",
  "ALGOUSDT",
  "VETUSDT",
  "APTUSDT",
  "ARBUSDT",
  "OPUSDT",
  "ICPUSDT",
  "SUIUSDT",
  "INJUSDT",
  "RENDERUSDT",
  "PEPEUSDT",
  "WIFUSDT",
  "BONKUSDT",
  "XLMUSDT",
  "HBARUSDT",
  "ETCUSDT",
  "IMXUSDT",
  "SEIUSDT",
  "TAOUSDT",
  "AAVEUSDT",
  "MKRUSDT",
  "LDOUSDT",
  "GRTUSDT",
  "FLOWUSDT",
  "STXUSDT",
  "SANDUSDT",
  "MANAUSDT",
  "AXSUSDT",
  "THETAUSDT",
  "ONDOUSDT",
  "FETUSDT",
  "DYDXUSDT",
] as const;

export const WATCHLIST_STORAGE_KEY = "crypto-watchlist";
export const UI_STORAGE_KEY = "crypto-ui";

export const TIMEFRAMES = ["1m", "5m", "15m", "1h", "4h", "1d", "1w"] as const;

export type Timeframe = (typeof TIMEFRAMES)[number];

export const KLINE_DEFAULT_INTERVAL: Timeframe = "5m";
export const KLINE_LIMIT = 500;
export const BINANCE_MARKET_DATA_BASE = "https://data-api.binance.vision";