import { describe, expect, it } from "vitest";

import {
  firstUrl,
  normalizeCoinInfo,
  readCategories,
  readDescription,
} from "@/lib/adapters/coinInfo";

describe("firstUrl", () => {
  it("mengambil URL pertama yang valid dari array", () => {
    expect(firstUrl(["", "https://bitcoin.org", "https://x.org"])).toBe(
      "https://bitcoin.org",
    );
  });

  it("menerima string tunggal", () => {
    expect(firstUrl("https://bitcoin.org")).toBe("https://bitcoin.org");
  });

  it("menolak URL non-http dan nilai non-string", () => {
    expect(firstUrl("javascript:alert(1)")).toBeNull();
    expect(firstUrl([123, null, "https://ok.org"])).toBe("https://ok.org");
    expect(firstUrl(undefined)).toBeNull();
  });
});

describe("readDescription", () => {
  it("mengubah HTML menjadi teks polos", () => {
    const result = readDescription({
      en: "<p>Bitcoin is a <b>decentralized</b> digital currency.</p>",
    });
    expect(result).toBe("Bitcoin is a decentralized digital currency.");
  });

  it("mengembalikan string kosong bila field tidak ada", () => {
    expect(readDescription(undefined)).toBe("");
    expect(readDescription({})).toBe("");
    expect(readDescription({ en: 42 })).toBe("");
  });

  it("memotong deskripsi yang terlalu panjang", () => {
    const long = "a".repeat(1000);
    const result = readDescription({ en: long });
    expect(result.length).toBeLessThan(long.length);
    expect(result.endsWith("…")).toBe(true);
  });
});

describe("readCategories", () => {
  it("membuang entri kosong, 'None', dan duplikat", () => {
    expect(
      readCategories(["Layer 1", "", "None", "Layer 1", "PoW"]),
    ).toEqual(["Layer 1", "PoW"]);
  });

  it("mengembalikan array kosong bila bukan array", () => {
    expect(readCategories("Layer 1")).toEqual([]);
  });
});

describe("normalizeCoinInfo", () => {
  it("menormalisasi respons CoinGecko lengkap", () => {
    const result = normalizeCoinInfo(
      {
        description: { en: "<p>Bitcoin is a peer-to-peer payment system.</p>" },
        links: {
          homepage: ["https://bitcoin.org"],
          blockchain_site: ["https://blockchain.com/explorer"],
          whitepaper: ["https://bitcoin.org/bitcoin.pdf"],
        },
        categories: ["Layer 1", "PoW"],
      },
      "BTC",
    );

    expect(result).toEqual({
      code: "BTC",
      description: "Bitcoin is a peer-to-peer payment system.",
      homepage: "https://bitcoin.org",
      explorer: "https://blockchain.com/explorer",
      whitepaper: "https://bitcoin.org/bitcoin.pdf",
      categories: ["Layer 1", "PoW"],
    });
  });

  it("mengembalikan null bila data kosong sama sekali", () => {
    expect(normalizeCoinInfo({}, "BTC")).toBeNull();
    expect(
      normalizeCoinInfo(
        { description: { en: "" }, links: {}, categories: [] },
        "BTC",
      ),
    ).toBeNull();
  });

  it("mengembalikan null untuk input non objek", () => {
    expect(normalizeCoinInfo(null, "BTC")).toBeNull();
    expect(normalizeCoinInfo("BTC", "BTC")).toBeNull();
  });

  it("tetap menghasilkan data meski sebagian field hilang", () => {
    const result = normalizeCoinInfo(
      { description: { en: "Deskripsi singkat." }, links: {} },
      "BTC",
    );
    expect(result?.description).toBe("Deskripsi singkat.");
    expect(result?.homepage).toBeNull();
    expect(result?.explorer).toBeNull();
    expect(result?.whitepaper).toBeNull();
    expect(result?.categories).toEqual([]);
  });
});
