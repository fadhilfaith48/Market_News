import { beforeEach, describe, expect, it } from "vitest";

import { sanitizeHoldings, usePortfolioStore } from "@/store/portfolioStore";

describe("portfolioStore", () => {
  beforeEach(() => {
    usePortfolioStore.setState({ holdings: {} });
  });

  it("upsert menyimpan posisi baru", () => {
    usePortfolioStore.getState().upsert("BTC", 2, 60000);

    expect(usePortfolioStore.getState().holdings.BTC).toEqual({
      qty: 2,
      avgCost: 60000,
    });
  });

  it("upsert memperbarui posisi yang sama", () => {
    usePortfolioStore.getState().upsert("BTC", 1, 60000);
    usePortfolioStore.getState().upsert("BTC", 3, 62000);

    expect(usePortfolioStore.getState().holdings.BTC).toEqual({
      qty: 3,
      avgCost: 62000,
    });
  });

  it("upsert menolak kode asing dan nilai negatif/non-finite", () => {
    usePortfolioStore.getState().upsert("MATIC", 1, 1);
    expect(usePortfolioStore.getState().holdings.MATIC).toBeUndefined();

    usePortfolioStore.getState().upsert("BTC", -1, 1);
    expect(usePortfolioStore.getState().holdings.BTC).toBeUndefined();

    usePortfolioStore.getState().upsert("BTC", 1, Number.NaN);
    expect(usePortfolioStore.getState().holdings.BTC).toBeUndefined();
  });

  it("remove menghapus posisi dan aman bila belum ada", () => {
    usePortfolioStore.getState().upsert("ETH", 1, 3000);
    usePortfolioStore.getState().remove("ETH");
    expect(usePortfolioStore.getState().holdings.ETH).toBeUndefined();

    usePortfolioStore.getState().remove("ETH");
  });

  it("sanitizeHoldings membuang kode lama, nilai non-angka dan negatif", () => {
    expect(
      sanitizeHoldings({
        BTC: { qty: 2, avgCost: 60000 },
        MATIC: { qty: 1, avgCost: 1 },
        ETH: { qty: -1, avgCost: 1000 },
        DOGE: { qty: "x", avgCost: 0.1 },
        BNB: null,
      }),
    ).toEqual({ BTC: { qty: 2, avgCost: 60000 } });
  });

  it("sanitizeHoldings menangani nilai tidak valid", () => {
    expect(sanitizeHoldings(null)).toEqual({});
    expect(sanitizeHoldings([])).toEqual({});
    expect(sanitizeHoldings("abc")).toEqual({});
  });
});