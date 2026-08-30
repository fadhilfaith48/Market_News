const compactFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 2,
});

const twoDecimalFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const fourDecimalFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 4,
  maximumFractionDigits: 4,
});

function formatMicroPrice(value: number): string {
  const decimals = Math.max(
    2,
    -Math.floor(Math.log10(Math.abs(value))) + 4,
  );
  return value
    .toFixed(decimals)
    .replace(/(\.\d*?[1-9])0+$|\.0+$/, "$1");
}

export function formatPrice(value: number): string {
  if (!Number.isFinite(value)) return "-";
  if (value === 0) return "0";
  const abs = Math.abs(value);
  if (abs >= 1000) return compactFormatter.format(value);
  if (abs >= 1) return twoDecimalFormatter.format(value);
  if (abs >= 0.01) return fourDecimalFormatter.format(value);
  return formatMicroPrice(value);
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