import { COINGECKO_IDS } from "@/lib/coinMeta";
import { stripHtml } from "@/lib/news";

const COINGECKO_COIN_API = "https://api.coingecko.com/api/v3/coins";
const FETCH_TIMEOUT_MS = 6_000;
const REVALIDATE_SECONDS = 3600;
const MAX_DESCRIPTION_LENGTH = 600;
const MAX_CATEGORIES = 6;

export interface CoinInfo {
  code: string;
  description: string;
  homepage: string | null;
  explorer: string | null;
  whitepaper: string | null;
  categories: string[];
}

/**
 * Mengambil URL pertama yang valid dari sebuah nilai (string atau array).
 * Hanya menerima http/https agar tidak menampilkan link berbahaya.
 */
export function firstUrl(value: unknown): string | null {
  const candidates = Array.isArray(value) ? value : [value];
  for (const item of candidates) {
    if (typeof item !== "string") continue;
    const trimmed = item.trim();
    if (!/^https?:\/\//i.test(trimmed)) continue;
    return trimmed;
  }
  return null;
}

/** Membaca deskripsi koin (HTML) menjadi teks polos & dipotong. */
export function readDescription(value: unknown): string {
  if (!value || typeof value !== "object") return "";
  const english = (value as Record<string, unknown>).en;
  if (typeof english !== "string") return "";

  const text = stripHtml(english).replace(/\s+/g, " ").trim();
  if (text.length === 0) return "";
  if (text.length <= MAX_DESCRIPTION_LENGTH) return text;
  return `${text.slice(0, MAX_DESCRIPTION_LENGTH).trimEnd()}…`;
}

/** Membaca daftar kategori koin, membuang entri kosong/"None". */
export function readCategories(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const result: string[] = [];
  for (const item of value) {
    if (typeof item !== "string") continue;
    const trimmed = item.trim();
    if (!trimmed || trimmed.toLowerCase() === "none") continue;
    if (result.includes(trimmed)) continue;
    result.push(trimmed);
  }
  return result.slice(0, MAX_CATEGORIES);
}

/**
 * Menormalisasi respons CoinGecko `/coins/{id}` menjadi struktur `CoinInfo`.
 * Mengembalikan `null` bila data kosong/tidak bermakna.
 */
export function normalizeCoinInfo(raw: unknown, code: string): CoinInfo | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as Record<string, unknown>;
  const links =
    data.links && typeof data.links === "object"
      ? (data.links as Record<string, unknown>)
      : {};

  const description = readDescription(data.description);
  const categories = readCategories(data.categories);
  const homepage = firstUrl(links.homepage);
  const explorer = firstUrl(links.blockchain_site);
  const whitepaper = firstUrl(links.whitepaper);

  if (
    !description &&
    !homepage &&
    !explorer &&
    !whitepaper &&
    categories.length === 0
  ) {
    return null;
  }

  return { code, description, homepage, explorer, whitepaper, categories };
}

/**
 * Mengambil profil koin (deskripsi, kategori, tautan resmi) dari CoinGecko.
 * Data di-cache 1 jam oleh Next.js (ISR) agar hemat kuota API gratis.
 */
export async function fetchCoinInfo(code: string): Promise<CoinInfo | null> {
  const id = COINGECKO_IDS[code];
  if (!id) return null;

  const url =
    `${COINGECKO_COIN_API}/${id}` +
    "?localization=false&tickers=false&market_data=false" +
    "&community_data=false&developer_data=false&sparkline=false";

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      next: { revalidate: REVALIDATE_SECONDS },
      signal: controller.signal,
    });
    if (!res.ok) return null;
    return normalizeCoinInfo(await res.json(), code);
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
