export const BINANCE_WS_ENDPOINTS = [
  "wss://stream.binance.com:9443/stream",
  "wss://data-stream.binance.vision:9443/stream",
] as const;

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
  "MATICUSDT",
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
] as const;

export const WATCHLIST_STORAGE_KEY = "crypto-watchlist";
export const UI_STORAGE_KEY = "crypto-ui";

export const TIMEFRAMES = ["1m", "5m", "15m", "1h", "4h", "1d", "1w"] as const;

export type Timeframe = (typeof TIMEFRAMES)[number];

export const KLINE_DEFAULT_INTERVAL: Timeframe = "5m";
export const KLINE_LIMIT = 500;
export const BINANCE_MARKET_DATA_BASE = "https://data-api.binance.vision";