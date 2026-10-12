import { describe, expect, it } from "vitest";

import { normalizeCoinGeckoGlobal } from "@/lib/adapters/global";

describe("normalizeCoinGeckoGlobal", () => {
  it("mengekstrak nilai yang valid", () => {
    const result = normalizeCoinGeckoGlobal({
      data: {
        total_market_cap: { usd: 1_000_000 },
        total_volume: { usd: 500_000 },
        market_cap_percentage: { btc: 59.5, eth: 11.03 },
        market_cap_change_percentage_24h_usd: -2.36,
        updated_at: 1791783629,
      },
    });

    expect(result).toEqual({
      totalMarketCapUsd: 1_000_000,
      totalVolumeUsd: 500_000,
      marketCapChange24h: -2.36,
      btcDominance: 59.5,
      ethDominance: 11.03,
      updatedAt: 1791783629,
    });
  });

  it("mengembalikan null untuk struktur rusak", () => {
    expect(normalizeCoinGeckoGlobal(null)).toBeNull();
    expect(normalizeCoinGeckoGlobal("x")).toBeNull();
    expect(normalizeCoinGeckoGlobal({})).toBeNull();
    expect(normalizeCoinGeckoGlobal({ data: {} })).toBeNull();
  });

  it("batal bila total market cap usd bukan angka", () => {
    expect(
      normalizeCoinGeckoGlobal({ data: { total_market_cap: { usd: "x" } } }),
    ).toBeNull();
    expect(
      normalizeCoinGeckoGlobal({ data: { total_market_cap: {} } }),
    ).toBeNull();
  });

  it("mengizinkan field pelengkap kosong menjadi null", () => {
    const result = normalizeCoinGeckoGlobal({
      data: { total_market_cap: { usd: 100 } },
    });
    expect(result).toEqual({
      totalMarketCapUsd: 100,
      totalVolumeUsd: null,
      marketCapChange24h: null,
      btcDominance: null,
      ethDominance: null,
      updatedAt: null,
    });
  });
});