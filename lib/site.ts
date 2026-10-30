/**
 * Identitas situs untuk metadata SEO (dipakai `metadataBase`, sitemap,
 * robots, dan OG image). Satu sumber kebenaran agar URL tidak tersebar.
 *
 * `NEXT_PUBLIC_SITE_URL` bisa di-set di Vercel bila domain berubah.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://market-news-roan.vercel.app"
).replace(/\/+$/, "");

export const SITE_NAME = "Market News";

export const SITE_TITLE = "Market News — Crypto";

export const SITE_DESCRIPTION =
  "Dashboard data pasar cryptocurrency real-time: harga, grafik candlestick, watchlist, portofolio, alert harga, dan berita crypto.";
