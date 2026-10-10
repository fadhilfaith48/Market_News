import { describe, expect, it } from "vitest";

import { getCoinMarketAssets } from "@/lib/adapters";
import type { CoinFetchers } from "@/lib/adapters";
import { normalizeCoinGecko } from "@/lib/adapters/coingecko";
import { normalizeCoinPaprika } from "@/lib/adapters/coinpaprika";
import type { CoinMarketAsset } from "@/lib/adapters/types";

describe("normalizeCoinGecko", () => {
  it("memetakan id CoinGecko ke kode dan mengekstrak angka", () => {
    const result = normalizeCoinGecko([
      {
        id: "bitcoin",
        market_cap: 1_300_000_000_000,
        circulating_supply: 19_700_000,
        max_supply: 21_000_000,
      },
    ]);

    expect(result).toEqual<CoinMarketAsset[]>([
      {
        code: "BTC",
        marketCap: 1_300_000_000_000,
        circulatingSupply: 19_700_000,
        maxSupply: 21_000_000,
      },
    ]);
  });

  it("membuang id yang tidak dikenal dan field non-angka", () => {
    const result = normalizeCoinGecko([
      { id: "unknown-coin", market_cap: 1 },
      { id: "ethereum", market_cap: "n/a", circulating_supply: null, max_supply: 0 },
    ]);

    expect(result).toEqual<CoinMarketAsset[]>([
      {
        code: "ETH",
        marketCap: null,
        circulatingSupply: null,
        maxSupply: 0,
      },
    ]);
  });

  it("menangani input tidak valid", () => {
    expect(normalizeCoinGecko(null)).toEqual([]);
    expect(normalizeCoinGecko({})).toEqual([]);
    expect(normalizeCoinGecko([null, 1, "x"])).toEqual([]);
  });
});

describe("normalizeCoinPaprika", () => {
  function ticker(
    id: string,
    marketCap: unknown,
    totalSupply: unknown,
    maxSupply: unknown,
  ) {
    return {
      id,
      total_supply: totalSupply,
      max_supply: maxSupply,
      quotes: { USD: { market_cap: marketCap } },
    };
  }

  it("memetakan id CoinPaprika ke kode dan mengekstrak angka", () => {
    const result = normalizeCoinPaprika([
      ticker("btc-bitcoin", 1_300_000_000_000.5, 19_700_000, 21_000_000),
    ]);

    expect(result).toEqual<CoinMarketAsset[]>([
      {
        code: "BTC",
        marketCap: 1_300_000_000_000.5,
        circulatingSupply: 19_700_000,
        maxSupply: 21_000_000,
      },
    ]);
  });

  it("koin tanpa data valid (TON/DOT) tidak dimasukkan", () => {
    const result = normalizeCoinPaprika([
      ticker("ton-tokamak-network", 22_000_000, 92_000_000, null),
      ticker("dot-polkadot-token", 19_000_000, 16_000_000, null),
      { id: "avax-avalanche", quotes: { USD: { market_cap: null } } },
    ]);

    expect(result).toEqual<CoinMarketAsset[]>([
      { code: "AVAX", marketCap: null, circulatingSupply: null, maxSupply: null },
    ]);
  });

  it("menghasilkan null untuk nilai kosong/non-angka dan membuang id asing", () => {
    const result = normalizeCoinPaprika([
      ticker("doge-dogecoin", "", "abc", null),
      ticker("not-a-coin", 1, 1, 1),
    ]);

    expect(result).toEqual<CoinMarketAsset[]>([
      { code: "DOGE", marketCap: null, circulatingSupply: null, maxSupply: null },
    ]);
  });

  it("menangani input tidak valid", () => {
    expect(normalizeCoinPaprika(null)).toEqual([]);
    expect(normalizeCoinPaprika({})).toEqual([]);
    expect(normalizeCoinPaprika([null, 1, "x"])).toEqual([]);
  });
});

function makeAsset(code: string): CoinMarketAsset {
  return { code, marketCap: 1, circulatingSupply: 1, maxSupply: 1 };
}

describe("getCoinMarketAssets", () => {
  it("memakai CoinGecko bila berhasil", async () => {
    const fetchers: CoinFetchers = {
      coingecko: async () => [makeAsset("BTC")],
      coinpaprika: async () => [makeAsset("ETH")],
    };

    const result = await getCoinMarketAssets(["BTC", "ETH"], fetchers);

    expect(result.source).toBe("coingecko");
    expect(result.coins).toEqual([makeAsset("BTC")]);
  });

  it("fallback ke CoinPaprika saat CoinGecko gagal", async () => {
    const fetchers: CoinFetchers = {
      coingecko: async () => {
        throw new Error("CoinGecko rate limited");
      },
      coinpaprika: async () => [makeAsset("ETH")],
    };

    const result = await getCoinMarketAssets(["BTC", "ETH"], fetchers);

    expect(result.source).toBe("coinpaprika");
    expect(result.coins).toEqual([makeAsset("ETH")]);
  });

  it("fallback ke CoinPaprika saat CoinGecko mengembalikan data kosong", async () => {
    const fetchers: CoinFetchers = {
      coingecko: async () => [],
      coinpaprika: async () => [makeAsset("BTC")],
    };

    const result = await getCoinMarketAssets(["BTC"], fetchers);

    expect(result.source).toBe("coinpaprika");
    expect(result.coins).toEqual([makeAsset("BTC")]);
  });

  it("melempar error saat kedua provider gagal", async () => {
    const fetchers: CoinFetchers = {
      coingecko: async () => {
        throw new Error("CoinGecko down");
      },
      coinpaprika: async () => {
        throw new Error("CoinPaprika down");
      },
    };

    await expect(getCoinMarketAssets(["BTC"], fetchers)).rejects.toThrow(
      "CoinPaprika down",
    );
  });
});