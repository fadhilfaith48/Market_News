import { describe, expect, it } from "vitest";

import { getCoinMeta, COIN_NAMES } from "@/lib/coinMeta";

describe("getCoinMeta", () => {
  it("mengambil kode dengan menghapus akhiran USDT", () => {
    expect(getCoinMeta("BTCUSDT").code).toBe("BTC");
    expect(getCoinMeta("ETHUSDT").code).toBe("ETH");
  });

  it("menggunakan nama resmi dari COIN_NAMES", () => {
    expect(getCoinMeta("BTCUSDT").name).toBe(COIN_NAMES.BTC);
    expect(getCoinMeta("SOLUSDT").name).toBe(COIN_NAMES.SOL);
  });

  it("POL memakai override logo poly.svg", () => {
    expect(getCoinMeta("POLUSDT").logo).toMatch(/\/poly\.svg$/);
  });

  it("SHIB & NEAR memakai logo CoinGecko (override)", () => {
    expect(getCoinMeta("SHIBUSDT").logo).toContain("assets.coingecko.com");
    expect(getCoinMeta("NEARUSDT").logo).toContain("assets.coingecko.com");
  });

  it("logo default berasal dari atomiclabs (lowercase kode)", () => {
    const logo = getCoinMeta("BTCUSDT").logo;
    expect(logo).toMatch(/atomiclabs\/cryptocurrency-icons/);
    expect(logo).toMatch(/\/btc\.svg$/);
  });

  it("kode asing tanpa nama tetap bisa dipetakan (fallback)", () => {
    const meta = getCoinMeta("FOOUSDT");
    expect(meta.code).toBe("FOOUSDT");
    expect(meta.name).toBe("FOOUSDT");
  });
});