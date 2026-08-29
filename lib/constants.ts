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