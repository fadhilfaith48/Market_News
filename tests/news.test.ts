import { describe, expect, it } from "vitest";

import {
  decodeEntities,
  filterArticlesByCoin,
  mergeNews,
  NEWS_LIMIT,
  parseRss,
  stripHtml,
  type Article,
  type NewsSource,
} from "@/lib/news";

const SAMPLE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Sample Feed</title>
    <item>
      <title><![CDATA[Bitcoin Naik 5% Hari Ini <b>Lagi</b> & Baru]]></title>
      <link>https://example.com/1</link>
      <pubDate>Wed, 17 Sep 2026 10:00:00 +0000</pubDate>
      <description><![CDATA[<p>Harga bitcoin menembus level baru.</p> <img src="https://example.com/img1.png" />]]></description>
      <enclosure url="https://example.com/img1.png" type="image/png" length="1234"/>
    </item>
    <item>
      <title>Ethereum Update Jaringan</title>
      <link>https://example.com/2</link>
      <pubDate>Wed, 17 Sep 2026 09:00:00 +0000</pubDate>
      <description>Ringkasan jaringan Ethereum.</description>
    </item>
    <item>
      <title>Tanpa Tanggal</title>
      <link>https://example.com/3</link>
      <description>Baris ini harus dilewati.</description>
    </item>
    <item>
      <title>Tanpa Link</title>
      <pubDate>Wed, 17 Sep 2026 08:00:00 +0000</pubDate>
      <description>Baris ini harus dilewati.</description>
    </item>
  </channel>
</rss>`;

const SOURCE: NewsSource = {
  id: "sample",
  name: "Sample",
  url: "https://example.com/rss",
};

function article(url: string, publishedAt: number): Article {
  return {
    id: url,
    title: url,
    url,
    source: "Sample",
    publishedAt,
  };
}

describe("decodeEntities & stripHtml", () => {
  it("mengurai entitas named & numerik", () => {
    expect(decodeEntities("a &amp; b &quot;c&quot; &#65; &#x42;")).toBe(
      'a & b "c" A B',
    );
  });

  it("menghapus marker CDATA", () => {
    expect(decodeEntities("<![CDATA[isi]]>")).toBe("isi");
  });

  it("stripHtml membuang tag dan merapikan spasi", () => {
    expect(stripHtml("<p>Harga <b>bitcoin</b> naik.</p>")).toBe(
      "Harga bitcoin naik.",
    );
  });
});

describe("parseRss", () => {
  it("mengembalikan artikel valid dan melewati baris rusak", () => {
    const articles = parseRss(SAMPLE_XML, SOURCE);
    expect(articles).toHaveLength(2);
  });

  it("membersihkan judul dari CDATA & tag", () => {
    const articles = parseRss(SAMPLE_XML, SOURCE);
    expect(articles[0].title).toBe("Bitcoin Naik 5% Hari Ini Lagi & Baru");
  });

  it("mengambil waktu terbit & sumber", () => {
    const articles = parseRss(SAMPLE_XML, SOURCE);
    expect(articles[0].publishedAt).toBe(Date.parse("2026-09-17T10:00:00Z"));
    expect(articles[0].source).toBe("Sample");
  });

  it("mengambil gambar dari enclosure", () => {
    const articles = parseRss(SAMPLE_XML, SOURCE);
    expect(articles[0].image).toBe("https://example.com/img1.png");
  });

  it("menghapus HTML dari ringkasan", () => {
    const articles = parseRss(SAMPLE_XML, SOURCE);
    expect(articles[0].summary).toContain("Harga bitcoin menembus level baru.");
  });
});

describe("mergeNews", () => {
  it("mengurutkan dari yang terbaru", () => {
    const merged = mergeNews([
      article("https://example.com/a", 1000),
      article("https://example.com/b", 3000),
      article("https://example.com/c", 2000),
    ]);
    expect(merged.map((a) => a.publishedAt)).toEqual([3000, 2000, 1000]);
  });

  it("menghapus duplikasi berdasarkan URL (kejadian terbaru menang)", () => {
    const merged = mergeNews([
      article("https://example.com/dup", 2000),
      article("https://example.com/satu", 3000),
      article("https://example.com/dup", 1000),
    ]);
    expect(merged).toHaveLength(2);
    expect(merged[0].url).toBe("https://example.com/satu");
    expect(merged[1].url).toBe("https://example.com/dup");
  });

  it("membatasi jumlah artikel ke NEWS_LIMIT", () => {
    const many = Array.from({ length: NEWS_LIMIT + 10 }, (_, i) =>
      article(`https://example.com/${i}`, 9000 - i),
    );
    expect(mergeNews(many)).toHaveLength(NEWS_LIMIT);
  });
});

describe("filterArticlesByCoin", () => {
  const feed: Article[] = [
    { ...article("https://example.com/btc", 1000), title: "Bitcoin tembus harga rekornya" },
    { ...article("https://example.com/btc2", 900), title: "Analisis BTC minggu ini" },
    { ...article("https://example.com/eth", 800), title: "Ethereum upgrade sukses" },
    { ...article("https://example.com/sol", 700), title: "Solana ramai digunakan" },
    { ...article("https://example.com/mix", 600), title: "Update pasar: bitcoin dan ethereum", summary: "bitcoin dan ethereum naik." },
  ];

  it("cocokkan berdasarkan nama lengkap", () => {
    const result = filterArticlesByCoin(feed, "BTC", "Bitcoin", "bitcoin");
    expect(result.map((item) => item.url)).toContain("https://example.com/btc");
  });

  it("cocokkan berdasarkan kode (case-insensitive)", () => {
    const result = filterArticlesByCoin(feed, "BTC", "Bitcoin", "bitcoin");
    expect(result.map((item) => item.url)).toContain("https://example.com/btc2");
  });

  it("tidak ikut menyertakan artikel yang tak terkait", () => {
    const result = filterArticlesByCoin(feed, "ETH", "Ethereum", "ethereum");
    expect(result.map((item) => item.url)).not.toContain(
      "https://example.com/sol",
    );
  });

  it("mencocokkan kata dengan batas kata utuh", () => {
    const result = filterArticlesByCoin(
      [
        { ...article("https://example.com/ton", 1), title: "harga ton melonjak" },
        { ...article("https://example.com/winton", 1), title: "berita tentang winton" },
      ],
      "TON",
      "Toncoin",
      "the-open-network",
    );
    expect(result.map((item) => item.url)).toEqual(["https://example.com/ton"]);
  });

  it("plain bagi feed kosong", () => {
    expect(filterArticlesByCoin([], "BTC", "Bitcoin", "bitcoin")).toEqual([]);
  });
});