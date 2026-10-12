export interface FearGreedIndex {
  value: number | null;
  classification: string;
  updatedAt: number | null;
}

const FEAR_GREED_API = "https://api.alternative.me/fng/?limit=1";
const FETCH_TIMEOUT_MS = 6_000;
const REVALIDATE_SECONDS = 1800;

export function normalizeFearGreed(raw: unknown): FearGreedIndex | null {
  if (!raw || typeof raw !== "object") return null;
  const data = (raw as Record<string, unknown>).data;
  if (!Array.isArray(data) || data.length === 0) return null;

  const item = data[0] as Record<string, unknown>;
  const parsed =
    typeof item.value === "string"
      ? Number(item.value)
      : typeof item.value === "number"
        ? item.value
        : Number.NaN;
  const value = Number.isFinite(parsed) ? parsed : null;

  const ts =
    typeof item.timestamp === "string"
      ? Number(item.timestamp) * 1000
      : Number.NaN;

  return {
    value,
    classification:
      typeof item.value_classification === "string"
        ? item.value_classification
        : "Unknown",
    updatedAt: Number.isFinite(ts) ? ts : null,
  };
}

export async function fetchFearGreed(): Promise<FearGreedIndex | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(FEAR_GREED_API, {
      next: { revalidate: REVALIDATE_SECONDS },
      signal: controller.signal,
    });
    if (!res.ok) return null;
    return normalizeFearGreed(await res.json());
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}