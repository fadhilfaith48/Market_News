import type { TickerWS } from "@/types";

export interface RawTickerMessage {
  e: string;
  E: number;
  s: string;
  p: string;
  P: string;
  w: string;
  c: string;
  Q: string;
  b: string;
  B: string;
  a: string;
  A: string;
  o: string;
  h: string;
  l: string;
  V: string;
  q: string;
  O: number;
  C: number;
  F: number;
  L: number;
  n: number;
}

export interface CombinedStreamMessage {
  stream: string;
  data: RawTickerMessage;
}

export function buildStreamUrl(endpoint: string, symbols: string[]): string {
  const streams = symbols
    .map((symbol) => symbol.toLowerCase())
    .map((symbol) => `${symbol}@ticker`)
    .join("/");
  return `${endpoint}?streams=${streams}`;
}

export function parseTickerMessage(raw: RawTickerMessage): TickerWS | null {
  if (!raw || raw.e !== "24hrTicker" || !raw.s) return null;
  return {
    symbol: raw.s,
    lastPrice: Number.parseFloat(raw.c),
    priceChange: Number.parseFloat(raw.p),
    priceChangePercent: Number.parseFloat(raw.P),
    weightedAvgPrice: Number.parseFloat(raw.w),
    openPrice: Number.parseFloat(raw.o),
    highPrice: Number.parseFloat(raw.h),
    lowPrice: Number.parseFloat(raw.l),
    quoteVolume: Number.parseFloat(raw.q),
    volume: Number.parseFloat(raw.V),
    eventTime: raw.E,
  };
}