import { describe, expect, it } from "vitest";

import {
  computePosition,
  computeSummary,
  getSymbol,
} from "@/lib/portfolio";

describe("computePosition", () => {
  it("menghitung nilai, biaya, P/L dan % P/L", () => {
    const position = computePosition("BTC", { qty: 2, avgCost: 60000 }, 65000);

    expect(position).not.toBeNull();
    expect(position!.currentValue).toBe(130000);
    expect(position!.costBasis).toBe(120000);
    expect(position!.pnl).toBe(10000);
    expect(position!.pnlPercent).toBeCloseTo((10000 / 120000) * 100, 5);
    expect(position!.symbol).toBe("BTCUSDT");
  });

  it("return null saat harga live belum tersedia", () => {
    expect(computePosition("BTC", { qty: 1, avgCost: 50000 }, undefined)).toBeNull();
  });

  it("avgCost 0 berarti costBasis 0 dan PnL penuh", () => {
    const position = computePosition("ETH", { qty: 3, avgCost: 0 }, 2000);

    expect(position!.costBasis).toBe(0);
    expect(position!.pnl).toBe(6000);
    expect(position!.pnlPercent).toBe(0);
  });

  it("posisi rugi menghasilkan PnL negatif", () => {
    const position = computePosition("SOL", { qty: 10, avgCost: 100 }, 80);

    expect(position!.pnl).toBe(-200);
    expect(position!.pnlPercent).toBe(-20);
  });

  it("getSymbol menambahkan akhiran USDT", () => {
    expect(getSymbol("SOL")).toBe("SOLUSDT");
  });
});

describe("computeSummary", () => {
  it("menghitung total nilai, biaya dan P/L agregat", () => {
    const summary = computeSummary(
      {
        BTC: { qty: 2, avgCost: 60000 },
        ETH: { qty: 3, avgCost: 1500 },
      },
      { BTC: 65000, ETH: 1700 },
    );

    expect(summary.totalValue).toBe(135100);
    expect(summary.totalCost).toBe(124500);
    expect(summary.pnl).toBe(10600);
    expect(summary.pnlPercent).toBeCloseTo((10600 / 124500) * 100, 5);
    expect(summary.pricedCount).toBe(2);
  });

  it("posisi tanpa harga tidak masuk ke total", () => {
    const summary = computeSummary(
      {
        BTC: { qty: 1, avgCost: 50000 },
        DOGE: { qty: 100, avgCost: 0.1 },
      },
      { BTC: 60000 },
    );

    expect(summary.totalValue).toBe(60000);
    expect(summary.totalCost).toBe(50000);
    expect(summary.pnl).toBe(10000);
    expect(summary.pricedCount).toBe(1);
  });

  it("summary kosong saat tidak ada holding", () => {
    expect(computeSummary({}, {})).toEqual({
      totalValue: 0,
      totalCost: 0,
      pnl: 0,
      pnlPercent: 0,
      pricedCount: 0,
    });
  });
});