const compactFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 2,
});

const priceFormatterFull = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 6,
});

export function formatPrice(value: number): string {
  if (!Number.isFinite(value)) return "-";
  if (value === 0) return "0";
  if (value >= 1000 || value < 0.00001) return compactFormatter.format(value);
  return priceFormatterFull.format(value);
}

export function formatCompact(value: number): string {
  if (!Number.isFinite(value)) return "-";
  return compactFormatter.format(value);
}

export function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return "-";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString();
}