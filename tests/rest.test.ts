import { describe, expect, it } from "vitest";

import { parseTickersRest } from "@/lib/binance/ws";
import type { RawTickerRest } from "@/lib/binance/ws";

describe("parseTickersRest", () => {
  it("memetakan payload 24hr ticker (field verbose Binance REST) ke TickerWS", () => {
    const rows: RawTickerRest[] = [
      {
        symbol: "BTCUSDT",
        priceChange: "100.5",
        priceChangePercent: "0.15",
        weightedAvgPrice: "64999.1",
        lastPrice: "65000.5",
        openPrice: "64900",
        highPrice: "65500",
        lowPrice: "64800",
        volume: "19000.1",
        quoteVolume: "1234567890.12",
      },
    ];
    const tickers = parseTickersRest(rows);
    expect(tickers).toHaveLength(1);
    expect(tickers[0]).toMatchObject({
      symbol: "BTCUSDT",
      lastPrice: 65000.5,
      priceChange: 100.5,
      priceChangePercent: 0.15,
      weightedAvgPrice: 64999.1,
      openPrice: 64900,
      highPrice: 65500,
      lowPrice: 64800,
      quoteVolume: 1234567890.12,
      volume: 19000.1,
    });
  });

  it("eventTime mengikuti waktu parsing (respons REST tidak punya E)", () => {
    const before = Date.now();
    const [t] = parseTickersRest([
      {
        symbol: "ETHUSDT",
        priceChange: "1",
        priceChangePercent: "0.03",
        weightedAvgPrice: "2999",
        lastPrice: "3000",
        openPrice: "2999",
        highPrice: "3010",
        lowPrice: "2990",
        volume: "1",
        quoteVolume: "10",
      },
    ]);
    expect(t.eventTime).toBeGreaterThanOrEqual(before);
    expect(t.eventTime).toBeLessThanOrEqual(Date.now());
  });

  it("mengabaikan baris tanpa simbol", () => {
    const rows: RawTickerRest[] = [];
    rows.push({
      symbol: "SOLUSDT",
      priceChange: "0",
      priceChangePercent: "0",
      weightedAvgPrice: "150",
      lastPrice: "150",
      openPrice: "150",
      highPrice: "151",
      lowPrice: "149",
      volume: "1",
      quoteVolume: "1",
    });
    expect(parseTickersRest(rows)).toHaveLength(1);
  });
});