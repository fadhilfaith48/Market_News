import { describe, expect, it } from "vitest";

import {
  evaluateAlerts,
  getAlertSymbol,
  type PriceAlert,
} from "@/lib/alerts";

function makeAlert(overrides: Partial<PriceAlert> = {}): PriceAlert {
  return {
    id: "a1",
    code: "BTC",
    symbol: "BTCUSDT",
    targetPrice: 70000,
    direction: "above",
    createdAt: 1,
    triggeredAt: null,
    ...overrides,
  };
}

describe("getAlertSymbol", () => {
  it("menambahkan akhiran USDT", () => {
    expect(getAlertSymbol("ETH")).toBe("ETHUSDT");
  });
});

describe("evaluateAlerts", () => {
  it("trigger arah above saat harga melintasi naik", () => {
    const alert = makeAlert({ direction: "above", targetPrice: 70000 });
    const triggered = evaluateAlerts(
      [alert],
      { BTCUSDT: { lastPrice: 70100 } },
      { BTCUSDT: 69900 },
    );
    expect(triggered).toHaveLength(1);
    expect(triggered[0].id).toBe("a1");
  });

  it("trigger arah below saat harga melintasi turun", () => {
    const alert = makeAlert({ direction: "below", targetPrice: 60000 });
    const triggered = evaluateAlerts(
      [alert],
      { BTCUSDT: { lastPrice: 59900 } },
      { BTCUSDT: 60100 },
    );
    expect(triggered).toHaveLength(1);
  });

  it("tidak trigger saat harga sudah di atas target sejak sebelumnya", () => {
    const alert = makeAlert({ direction: "above", targetPrice: 70000 });
    const triggered = evaluateAlerts(
      [alert],
      { BTCUSDT: { lastPrice: 71000 } },
      { BTCUSDT: 70500 },
    );
    expect(triggered).toHaveLength(0);
  });

  it("tidak trigger saat harga masih di bawah target (above)", () => {
    const alert = makeAlert({ direction: "above", targetPrice: 70000 });
    const triggered = evaluateAlerts(
      [alert],
      { BTCUSDT: { lastPrice: 65000 } },
      { BTCUSDT: 64000 },
    );
    expect(triggered).toHaveLength(0);
  });

  it("tidak trigger saat previousLastPrice belum tersedia (payload pertama)", () => {
    const alert = makeAlert({ direction: "above", targetPrice: 1000 });
    const triggered = evaluateAlerts([alert], { BTCUSDT: { lastPrice: 65000 } }, {});
    expect(triggered).toHaveLength(0);
  });

  it("tidak trigger untuk alert yang sudah triggered (one-shot)", () => {
    const alert = makeAlert({ triggeredAt: 999 });
    const triggered = evaluateAlerts(
      [alert],
      { BTCUSDT: { lastPrice: 70100 } },
      { BTCUSDT: 69900 },
    );
    expect(triggered).toHaveLength(0);
  });

  it("tidak trigger saat ticker koin belum tersedia", () => {
    const alert = makeAlert();
    const triggered = evaluateAlerts([alert], {}, { BTCUSDT: 69900 });
    expect(triggered).toHaveLength(0);
  });
});