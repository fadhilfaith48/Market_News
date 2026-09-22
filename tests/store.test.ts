import { beforeEach, describe, expect, it } from "vitest";

import { useMarketStore } from "@/store/marketStore";
import { sanitizeCodes, useWatchStore } from "@/store/watchStore";
import type { TickerWS } from "@/types";

function makeTicker(
  symbol: string,
  lastPrice: number,
  priceChangePercent = 0,
): TickerWS {
  return {
    symbol,
    lastPrice,
    priceChange: 0,
    priceChangePercent,
    weightedAvgPrice: lastPrice,
    openPrice: lastPrice,
    highPrice: lastPrice,
    lowPrice: lastPrice,
    quoteVolume: 1000,
    volume: 10,
    eventTime: Date.now(),
  };
}

describe("marketStore", () => {
  beforeEach(() => {
    useMarketStore.setState({
      tickers: {},
      previousLastPrice: {},
      lastUpdate: null,
    });
  });

  it("applyTicker menambah ticker dan mengatur lastUpdate", () => {
    useMarketStore.getState().applyTicker(makeTicker("BTCUSDT", 64000));

    const { tickers, lastUpdate } = useMarketStore.getState();
    expect(tickers.BTCUSDT.lastPrice).toBe(64000);
    expect(lastUpdate).toBeTypeOf("number");
  });

  it("lastPrice sebelumnya tersimpan sebelum diperbarui", () => {
    useMarketStore.getState().applyTicker(makeTicker("BTCUSDT", 64000));
    useMarketStore.getState().applyTicker(makeTicker("BTCUSDT", 64500));

    const { previousLastPrice } = useMarketStore.getState();
    expect(previousLastPrice.BTCUSDT).toBe(64000);
  });

  it("previousLastPrice tidak dibuat jika belum ada data", () => {
    useMarketStore.getState().applyTicker(makeTicker("ETHUSDT", 3000));
    expect(useMarketStore.getState().previousLastPrice.ETHUSDT).toBeUndefined();
  });

  it("ticker berbeda tidak saling menimpa previousLastPrice", () => {
    useMarketStore.getState().applyTicker(makeTicker("BTCUSDT", 64000));
    useMarketStore.getState().applyTicker(makeTicker("BTCUSDT", 64500));
    useMarketStore.getState().applyTicker(makeTicker("ETHUSDT", 3000));

    const { previousLastPrice } = useMarketStore.getState();
    expect(previousLastPrice.BTCUSDT).toBe(64000);
    expect(previousLastPrice.ETHUSDT).toBeUndefined();
  });
});

describe("watchStore", () => {
  beforeEach(() => {
    useWatchStore.setState({ codes: [] });
  });

  it("toggle menambah koin baru", () => {
    useWatchStore.getState().toggle("BTC");
    expect(useWatchStore.getState().codes).toEqual(["BTC"]);
  });

  it("toggle kedua menghapus koin (tidak duplikat)", () => {
    useWatchStore.getState().toggle("BTC");
    useWatchStore.getState().toggle("BTC");
    expect(useWatchStore.getState().codes).toEqual([]);
  });

  it("menambah koin lain tanpa mengganggu daftar", () => {
    const store = useWatchStore.getState();
    store.toggle("BTC");
    store.toggle("ETH");
    expect(useWatchStore.getState().codes).toEqual(["BTC", "ETH"]);
  });

  it("toggle mengabaikan kode yang tidak dikenal (stale/delisted)", () => {
    useWatchStore.getState().toggle("MATIC");
    expect(useWatchStore.getState().codes).toEqual([]);
  });

  it("sanitizeCodes membuang kode lama dan nilai non-string saat rehydrate", () => {
    expect(sanitizeCodes(["BTC", "MATIC", 123, null, "ETH"])).toEqual([
      "BTC",
      "ETH",
    ]);
    expect(sanitizeCodes(null)).toEqual([]);
    expect(sanitizeCodes(undefined)).toEqual([]);
  });
});