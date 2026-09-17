import type { LiveKline, TickerWS } from "@/types";

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

export interface RawTickerRest {
  symbol: string;
  priceChange: string;
  priceChangePercent: string;
  weightedAvgPrice: string;
  lastPrice: string;
  openPrice: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
  quoteVolume: string;
}

export function parseTickersRest(rows: RawTickerRest[]): TickerWS[] {
  const now = Date.now();
  const tickers: TickerWS[] = [];
  for (const raw of rows) {
    if (!raw || !raw.symbol) continue;
    tickers.push({
      symbol: raw.symbol,
      lastPrice: Number.parseFloat(raw.lastPrice),
      priceChange: Number.parseFloat(raw.priceChange),
      priceChangePercent: Number.parseFloat(raw.priceChangePercent),
      weightedAvgPrice: Number.parseFloat(raw.weightedAvgPrice),
      openPrice: Number.parseFloat(raw.openPrice),
      highPrice: Number.parseFloat(raw.highPrice),
      lowPrice: Number.parseFloat(raw.lowPrice),
      quoteVolume: Number.parseFloat(raw.quoteVolume),
      volume: Number.parseFloat(raw.volume),
      eventTime: now,
    });
  }
  return tickers;
}

export interface RawKlineMessage {
  e: "kline";
  E: number;
  s: string;
  k: {
    t: number;
    T: number;
    s: string;
    i: string;
    o: string;
    h: string;
    l: string;
    c: string;
    v: string;
    x: boolean;
  };
}

export function buildKlineStreamUrl(
  endpoint: string,
  symbol: string,
  interval: string,
): string {
  const stream = `${symbol.toLowerCase()}@kline_${interval}`;
  return `${endpoint}?streams=${stream}`;
}

export function parseKlineMessage(raw: RawKlineMessage): LiveKline | null {
  if (!raw || raw.e !== "kline" || !raw.s || !raw.k) return null;
  const k = raw.k;
  return {
    symbol: raw.s,
    interval: k.i,
    openTime: k.t,
    closeTime: k.T,
    open: Number.parseFloat(k.o),
    high: Number.parseFloat(k.h),
    low: Number.parseFloat(k.l),
    close: Number.parseFloat(k.c),
    volume: Number.parseFloat(k.v),
    closed: k.x,
  };
}