import { describe, expect, it } from "vitest";

import {
  buildKlineStreamUrl,
  buildStreamUrl,
  parseKlineMessage,
  parseTickerMessage,
} from "@/lib/binance/ws";
import type {
  RawKlineMessage,
  RawTickerMessage,
} from "@/lib/binance/ws";

const TICKER_ENDPOINT = "wss://stream.binance.com:9443/stream";

function makeTickerMessage(overrides: Partial<RawTickerMessage> = {}): RawTickerMessage {
  return {
    e: "24hrTicker",
    E: 1_732_000_000_000,
    s: "BTCUSDT",
    p: "100.00",
    P: "0.56",
    w: "65000.12",
    c: "65050.50",
    Q: "0.001",
    b: "65050.00",
    B: "0.5",
    a: "65051.00",
    A: "0.4",
    o: "64950.00",
    h: "65100.00",
    l: "64800.00",
    V: "12000.5",
    q: "780000000",
    O: 1_731_913_630_000,
    C: 1_732_000_000_000,
    F: 1,
    L: 1000,
    n: 999,
    ...overrides,
  };
}

describe("buildStreamUrl", () => {
  it("mengonversi symbol ke lowercase dan menambah stream @ticker", () => {
    expect(buildStreamUrl(TICKER_ENDPOINT, ["BTCUSDT", "ETHUSDT"])).toBe(
      "wss://stream.binance.com:9443/stream?streams=btcusdt@ticker/ethusdt@ticker",
    );
  });

  it("symbol kosong menghasilkan streams kosong", () => {
    expect(buildStreamUrl(TICKER_ENDPOINT, [])).toBe(
      "wss://stream.binance.com:9443/stream?streams=",
    );
  });
});

describe("parseTickerMessage", () => {
  it("memetakan message valid ke TickerWS (angka ter-parse)", () => {
    const ticker = parseTickerMessage(makeTickerMessage());
    expect(ticker).toEqual({
      symbol: "BTCUSDT",
      lastPrice: 65_050.5,
      priceChange: 100,
      priceChangePercent: 0.56,
      weightedAvgPrice: 65_000.12,
      openPrice: 64_950,
      highPrice: 65_100,
      lowPrice: 64_800,
      quoteVolume: 780_000_000,
      volume: 12_000.5,
      eventTime: 1_732_000_000_000,
    });
  });

  it("event selain 24hrTicker → null", () => {
    expect(parseTickerMessage(makeTickerMessage({ e: "kline" }))).toBeNull();
  });

  it("object kosong / tanpa simbol → null", () => {
    expect(parseTickerMessage({} as RawTickerMessage)).toBeNull();
    expect(parseTickerMessage(makeTickerMessage({ s: "" }))).toBeNull();
  });

  it("string harga non-numerik → NaN tidak di-parse", () => {
    const ticker = parseTickerMessage(makeTickerMessage({ c: "abc" }));
    expect(ticker?.lastPrice).toBeNaN();
  });
});

function makeKlineMessage(overrides: Partial<RawKlineMessage> = {}): RawKlineMessage {
  return {
    e: "kline",
    E: 1_732_000_000_000,
    s: "BTCUSDT",
    k: {
      t: 1_731_999_000_000,
      T: 1_731_999_300_000,
      s: "BTCUSDT",
      i: "5m",
      o: "65000",
      h: "65100",
      l: "64950",
      c: "65050.5",
      v: "10.25",
      x: false,
    },
    ...overrides,
  };
}

describe("buildKlineStreamUrl", () => {
  it("membentuk stream kline sesuai simbol & interval", () => {
    expect(buildKlineStreamUrl(TICKER_ENDPOINT, "BTCUSDT", "5m")).toBe(
      "wss://stream.binance.com:9443/stream?streams=btcusdt@kline_5m",
    );
  });
});

describe("parseKlineMessage", () => {
  it("memetakan message valid ke LiveKline", () => {
    const kline = parseKlineMessage(makeKlineMessage({ k: { ...makeKlineMessage().k, x: true } }));
    expect(kline?.symbol).toBe("BTCUSDT");
    expect(kline?.interval).toBe("5m");
    expect(kline?.openTime).toBe(1_731_999_000_000);
    expect(kline?.closeTime).toBe(1_731_999_300_000);
    expect(kline?.open).toBe(65_000);
    expect(kline?.high).toBe(65_100);
    expect(kline?.low).toBe(64_950);
    expect(kline?.close).toBe(65_050.5);
    expect(kline?.volume).toBe(10.25);
    expect(kline?.closed).toBe(true);
  });

  it("event bukan kline → null", () => {
    const message = {
      ...makeKlineMessage(),
      e: "24hrTicker",
    } as unknown as RawKlineMessage;
    expect(parseKlineMessage(message)).toBeNull();
  });

  it("kline tanpa data k → null", () => {
    expect(parseKlineMessage({ ...makeKlineMessage(), k: undefined as never })).toBeNull();
  });
});