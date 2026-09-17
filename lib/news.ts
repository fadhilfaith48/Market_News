export interface Article {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedAt: number;
  image?: string;
  summary?: string;
}

export interface NewsSource {
  id: string;
  name: string;
  url: string;
}

export const NEWS_LIMIT = 20;

const FETCH_TIMEOUT_MS = 8_000;
const NEWS_REVALIDATE_SECONDS = 300;

const FEED_SOURCES: NewsSource[] = [
  {
    id: "cointelegraph",
    name: "CoinTelegraph",
    url: "https://cointelegraph.com/rss",
  },
  {
    id: "decrypt",
    name: "Decrypt",
    url: "https://decrypt.co/feed",
  },
  {
    id: "coingape",
    name: "CoinGape",
    url: "https://coingape.com/feed/",
  },
  {
    id: "coindesk",
    name: "CoinDesk",
    url: "https://www.coindesk.com/arc/outboundfeeds/rss/",
  },
];

export const NEWS_SOURCES: NewsSource[] = [...FEED_SOURCES];

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  apos: "'",
  gt: ">",
  lt: "<",
  nbsp: " ",
  quot: '"',
};

export function decodeEntities(input: string): string {
  if (!input) return "";
  return input
    .replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) =>
      String.fromCodePoint(Number.parseInt(hex, 16)),
    )
    .replace(/&#(\d+);/g, (_, dec: string) =>
      String.fromCodePoint(Number.parseInt(dec, 10)),
    )
    .replace(/&([a-zA-Z]+);/g, (match, name: string) =>
      NAMED_ENTITIES[name] ?? match,
    );
}

export function stripHtml(input: string): string {
  if (!input) return "";
  return decodeEntities(input)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function readField(item: string, tag: string): string {
  const match = item.match(
    new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`),
  );
  return match?.[1]?.trim() ?? "";
}

function readAttr(item: string, tag: string, attr: string): string {
  const match = item.match(
    new RegExp(`<${tag}\\s[^>]*${attr}\\s*=\\s*["']([^"']+)["']`),
  );
  return match?.[1]?.trim() ?? "";
}

function isAbsoluteUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

function extractImage(item: string, description: string): string | undefined {
  const candidates = [
    readAttr(item, "enclosure", "url"),
    readAttr(item, "media:content", "url"),
    readAttr(item, "media:thumbnail", "url"),
  ];
  const imgInDescription = description.match(
    /<img[^>]*src\s*=\s*["']([^"']+)["']/i,
  );
  if (imgInDescription) candidates.push(imgInDescription[1]);

  const found = candidates.find((candidate) => isAbsoluteUrl(candidate));
  return found;
}

function hashCode(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
  }
  return hash;
}

export function parseRss(xml: string, source: NewsSource): Article[] {
  const articles: Article[] = [];
  const itemPattern = /<item>([\s\S]*?)<\/item>/g;
  let match: RegExpExecArray | null;

  while ((match = itemPattern.exec(xml))) {
    const item = match[1];
    const title = stripHtml(readField(item, "title"));
    const link = stripHtml(readField(item, "link"));

    if (!title || !link || !isAbsoluteUrl(link)) continue;

    const pubRaw =
      readField(item, "pubDate") || readField(item, "dc:date");
    const publishedAt = Date.parse(pubRaw);
    if (!Number.isFinite(publishedAt)) continue;

    const description =
      readField(item, "content:encoded") || readField(item, "description");
    const summary = stripHtml(description).slice(0, 180);

    articles.push({
      id: `${source.id}-${hashCode(link).toString(36)}`,
      title,
      url: link,
      source: source.name,
      publishedAt,
      image: extractImage(item, description),
      summary: summary || undefined,
    });
  }

  return articles;
}

async function fetchFeed(source: NewsSource): Promise<Article[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(source.url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; MarketNews/1.0)" },
      next: { revalidate: NEWS_REVALIDATE_SECONDS },
      signal: controller.signal,
    });
    if (!res.ok) return [];
    const xml = await res.text();
    return parseRss(xml, source);
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

export function mergeNews(articles: Article[]): Article[] {
  const seen = new Set<string>();
  const merged: Article[] = [];

  for (const article of [...articles].sort((a, b) => b.publishedAt - a.publishedAt)) {
    if (seen.has(article.url)) continue;
    seen.add(article.url);
    merged.push(article);
  }

  return merged.slice(0, NEWS_LIMIT);
}

export async function fetchNews(): Promise<Article[]> {
  const settled = await Promise.allSettled(
    NEWS_SOURCES.map((source) => fetchFeed(source)),
  );

  const collected: Article[] = [];
  for (const result of settled) {
    if (result.status === "fulfilled") collected.push(...result.value);
  }

  return mergeNews(collected);
}