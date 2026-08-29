export type ConnectionStatus = "connecting" | "online" | "reconnecting" | "offline";

export interface TickerWS {
  symbol: string;
  lastPrice: number;
  priceChange: number;
  priceChangePercent: number;
  weightedAvgPrice: number;
  openPrice: number;
  highPrice: number;
  lowPrice: number;
  quoteVolume: number;
  volume: number;
  eventTime: number;
}

export interface Coin {
  id: string;
  symbol: string;
  name: string;
  currentPrice: number;
  marketCap: number;
  volume24h: number;
  priceChange24h: number;
  imageUrl?: string;
}

export interface Kline {
  openTime: number;
  closeTime: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type Theme = "light" | "dark";