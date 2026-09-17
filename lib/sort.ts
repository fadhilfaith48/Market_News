import type { TickerWS } from "@/types";

export type SortKey = "price" | "change" | "volume" | "marketCap";
export type SortDir = "asc" | "desc";
export type RangeFilter = "all" | "gainers" | "losers";

export interface SortableRow {
  symbol: string;
  ticker?: Partial<TickerWS>;
  marketCap?: number | null;
}

function valueFor(row: SortableRow, key: SortKey): number {
  switch (key) {
    case "price":
      return row.ticker?.lastPrice ?? Number.NEGATIVE_INFINITY;
    case "change":
      return row.ticker?.priceChangePercent ?? Number.NEGATIVE_INFINITY;
    case "volume":
      return row.ticker?.quoteVolume ?? Number.NEGATIVE_INFINITY;
    case "marketCap":
      return row.marketCap ?? Number.NEGATIVE_INFINITY;
  }
}

export function sortRows<T extends SortableRow>(
  rows: T[],
  key: SortKey,
  dir: SortDir,
): T[] {
  const sign = dir === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    const va = valueFor(a, key);
    const vb = valueFor(b, key);
    if (va === vb) return 0;
    return (va < vb ? -1 : 1) * sign;
  });
}

function byChangeDesc<T extends SortableRow>(rows: T[]): T[] {
  return [...rows].sort(
    (a, b) =>
      (b.ticker?.priceChangePercent ?? Number.NEGATIVE_INFINITY) -
      (a.ticker?.priceChangePercent ?? Number.NEGATIVE_INFINITY),
  );
}

export function applyRangeFilter<T extends SortableRow>(
  rows: T[],
  filter: RangeFilter,
): T[] {
  if (filter === "all") return rows;
  const sorted = byChangeDesc(rows);
  if (filter === "gainers") return sorted.slice(0, 5);
  return sorted.slice(-5).reverse();
}