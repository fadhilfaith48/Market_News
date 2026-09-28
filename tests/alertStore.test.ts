import { beforeEach, describe, expect, it } from "vitest";

import { sanitizeAlerts, useAlertStore, MAX_ALERTS } from "@/store/alertStore";

describe("alertStore", () => {
  beforeEach(() => {
    useAlertStore.setState({ alerts: [] });
  });

  it("add menyimpan alert dengan simbol yang benar", () => {
    const alert = useAlertStore.getState().add({
      code: "BTC",
      targetPrice: 70000,
      direction: "above",
    });

    expect(alert).not.toBeNull();
    expect(alert!.symbol).toBe("BTCUSDT");
    expect(alert!.triggeredAt).toBeNull();
    expect(useAlertStore.getState().alerts).toHaveLength(1);
  });

  it("add menolak kode asing dan target tidak valid", () => {
    expect(
      useAlertStore.getState().add({ code: "MATIC", targetPrice: 1, direction: "above" }),
    ).toBeNull();
    expect(useAlertStore.getState().alerts).toHaveLength(0);

    expect(
      useAlertStore.getState().add({ code: "BTC", targetPrice: 0, direction: "above" }),
    ).toBeNull();
    expect(
      useAlertStore.getState().add({ code: "BTC", targetPrice: -5, direction: "above" }),
    ).toBeNull();
    expect(
      useAlertStore.getState().add({ code: "BTC", targetPrice: Number.NaN, direction: "above" }),
    ).toBeNull();
    expect(useAlertStore.getState().alerts).toHaveLength(0);
  });

  it("add menolak duplikat kode+arah+target yang masih aktif", () => {
    useAlertStore.getState().add({ code: "BTC", targetPrice: 70000, direction: "above" });
    const second = useAlertStore.getState().add({
      code: "BTC",
      targetPrice: 70000,
      direction: "above",
    });

    expect(useAlertStore.getState().alerts).toHaveLength(1);
    expect(second).not.toBeNull();
    expect(second!.id).toBe(useAlertStore.getState().alerts[0].id);
  });

  it("add tidak membatasi alert dengan arah/target berbeda", () => {
    useAlertStore.getState().add({ code: "BTC", targetPrice: 70000, direction: "above" });
    useAlertStore.getState().add({ code: "BTC", targetPrice: 60000, direction: "below" });

    expect(useAlertStore.getState().alerts).toHaveLength(2);
  });

  it("markTriggered mengunci alert one-shot dan hanya sekali", () => {
    const alert = useAlertStore.getState().add({
      code: "BTC",
      targetPrice: 70000,
      direction: "above",
    })!;
    useAlertStore.getState().markTriggered(alert.id);
    const first = useAlertStore.getState().alerts[0].triggeredAt;
    useAlertStore.getState().markTriggered(alert.id);

    expect(first).not.toBeNull();
    expect(useAlertStore.getState().alerts[0].triggeredAt).toBe(first);
  });

  it("remove menghapus alert", () => {
    const alert = useAlertStore.getState().add({
      code: "ETH",
      targetPrice: 3000,
      direction: "above",
    })!;
    useAlertStore.getState().remove(alert.id);
    expect(useAlertStore.getState().alerts).toHaveLength(0);
  });

  it(`add menolak setelah mencapai ${MAX_ALERTS} alert`, () => {
    for (let i = 1; i <= MAX_ALERTS; i++) {
      const created = useAlertStore.getState().add({
        code: "BTC",
        targetPrice: 1000 + i,
        direction: "above",
      });
      expect(created).not.toBeNull();
    }
    const overflow = useAlertStore.getState().add({
      code: "ETH",
      targetPrice: 9000,
      direction: "below",
    });

    expect(useAlertStore.getState().alerts).toHaveLength(MAX_ALERTS);
    expect(overflow).toBeNull();
  });

  it("sanitizeAlerts membuang kode lama, simbol salah dan target tidak valid", () => {
    const now = Date.now();
    expect(
      sanitizeAlerts([
        { id: "a", code: "BTC", symbol: "BTCUSDT", targetPrice: 70000, direction: "above", createdAt: now, triggeredAt: null },
        { id: "b", code: "MATIC", symbol: "MATICUSDT", targetPrice: 1, direction: "above", createdAt: now, triggeredAt: null },
        { id: "c", code: "ETH", symbol: "SALAH", targetPrice: 3000, direction: "above", createdAt: now, triggeredAt: null },
        { id: "d", code: "SOL", symbol: "SOLUSDT", targetPrice: -1, direction: "above", createdAt: now, triggeredAt: null },
      ]),
    ).toEqual([
      { id: "a", code: "BTC", symbol: "BTCUSDT", targetPrice: 70000, direction: "above", createdAt: now, triggeredAt: null },
    ]);
  });

  it("sanitizeAlerts menormalkan triggeredAt non-angka menjadi null", () => {
    const now = Date.now();
    const result = sanitizeAlerts([
      { id: "a", code: "BTC", symbol: "BTCUSDT", targetPrice: 70000, direction: "above", createdAt: now, triggeredAt: "x" },
    ]);
    expect(result[0].triggeredAt).toBeNull();
  });

  it("sanitizeAlerts menangani input tidak valid dan memotong ke MAX_ALERTS", () => {
    expect(sanitizeAlerts(null)).toEqual([]);
    expect(sanitizeAlerts("x")).toEqual([]);

    const now = Date.now();
    const many = Array.from({ length: 30 }, (_, i) => ({
      id: `a${i}`,
      code: "BTC",
      symbol: "BTCUSDT",
      targetPrice: 70000 + i,
      direction: "above" as const,
      createdAt: now + i,
      triggeredAt: null,
    }));
    expect(sanitizeAlerts(many)).toHaveLength(MAX_ALERTS);
  });
});