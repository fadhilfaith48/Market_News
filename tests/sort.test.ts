import { describe, expect, it } from "vitest";

import { applyRangeFilter, sortRows } from "@/lib/sort";
import type { SortableRow } from "@/lib/sort";
import type { TickerWS } from "@/types";

function row(
  symbol: string,
  ticker?: Partial<TickerWS>,
  marketCap?: number,
): SortableRow {
  return { symbol, ticker, marketCap };
}

describe("sortRows", () => {
  const rows: SortableRow[] = [
    row("BTCUSDT", { lastPrice: 60000, priceChangePercent: 2, quoteVolume: 1000 }, 1_000_000),
    row("ETHUSDT", { lastPrice: 3000, priceChangePercent: -1, quoteVolume: 500 }, 500_000),
    row("SOLUSDT", { lastPrice: 150, priceChangePercent: 6, quoteVolume: 10 }, 50_000),
  ];

  it("marketCap descending → terbesar dulu, tanpa memutasikan input", () => {
    const input = [...rows];
    expect(sortRows(input, "marketCap", "desc").map((r) => r.symbol)).toEqual([
      "BTCUSDT",
      "ETHUSDT",
      "SOLUSDT",
    ]);
    expect(input.map((r) => r.symbol)).toEqual([
      "BTCUSDT",
      "ETHUSDT",
      "SOLUSDT",
    ]);
  });

  it("price ascending", () => {
    expect(sortRows(rows, "price", "asc").map((r) => r.symbol)).toEqual([
      "SOLUSDT",
      "ETHUSDT",
      "BTCUSDT",
    ]);
  });

  it("change descending", () => {
    expect(sortRows(rows, "change", "desc").map((r) => r.symbol)).toEqual([
      "SOLUSDT",
      "BTCUSDT",
      "ETHUSDT",
    ]);
  });

  it("volume ascending", () => {
    expect(sortRows(rows, "volume", "asc").map((r) => r.symbol)).toEqual([
      "SOLUSDT",
      "ETHUSDT",
      "BTCUSDT",
    ]);
  });

  it("marketCap null/undefined tenggelam ke bawah (desc)", () => {
    const withMissing = [
      ...rows,
      row("XRPUSDT", { lastPrice: 1, priceChangePercent: 0, quoteVolume: 1 }),
    ];
    const sorted = sortRows(withMissing, "marketCap", "desc");
    expect(sorted[sorted.length - 1].symbol).toBe("XRPUSDT");
  });
});

describe("applyRangeFilter", () => {
  const rows: SortableRow[] = [
    row("AUSDT", { priceChangePercent: 1 }),
    row("BUSDT", { priceChangePercent: 8 }),
    row("CUSDT", { priceChangePercent: -4 }),
    row("DUSDT", { priceChangePercent: -9 }),
    row("EUSDT", { priceChangePercent: 3 }),
    row("FUSDT", { priceChangePercent: -2 }),
    row("GUSDT", { priceChangePercent: 12 }),
    row("HUSDT", { priceChangePercent: 5 }),
    row("IUSDT", { priceChangePercent: 0 }),
    row("JUSDT", { priceChangePercent: -6 }),
  ];

  it("all → array asli (bukan copy baru)", () => {
    expect(applyRangeFilter(rows, "all")).toBe(rows);
  });

  it("gainers → 5 teratas perubahan 24 jam", () => {
    const codes = applyRangeFilter(rows, "gainers").map((r) => r.symbol);
    expect(codes).toHaveLength(5);
    expect(codes).toEqual(["GUSDT", "BUSDT", "HUSDT", "EUSDT", "AUSDT"]);
  });

  it("losers → 5 terbawah perubahan 24 jam (negatif paling dalam dulu)", () => {
    const codes = applyRangeFilter(rows, "losers").map((r) => r.symbol);
    expect(codes).toHaveLength(5);
    expect(codes).toEqual(["DUSDT", "JUSDT", "CUSDT", "FUSDT", "IUSDT"]);
  });
});