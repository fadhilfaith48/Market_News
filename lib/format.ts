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

const CURRENCY_LOCALE: Record<string, string> = {
  USD: "en-US",
  IDR: "id-ID",
  EUR: "de-DE",
  JPY: "ja-JP",
  SGD: "en-SG",
};

export const SUPPORTED_CURRENCIES = ["USD", "IDR", "EUR", "JPY", "SGD"] as const;
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

export function convertPrice(usdPrice: number, rate: number): number {
  return usdPrice * rate;
}

export function formatCurrency(
  value: number,
  currency: SupportedCurrency,
  rates: Record<string, number> | undefined,
): string {
  if (currency === "USD") return formatPrice(value);
  if (!rates || !rates[currency]) return formatPrice(value);

  const converted = convertPrice(value, rates[currency]);
  const locale = CURRENCY_LOCALE[currency] ?? "en-US";

  if (Math.abs(converted) >= 1_000_000) {
    return new Intl.NumberFormat(locale, {
      notation: "compact",
      maximumFractionDigits: 2,
    }).format(converted);
  }
  if (Math.abs(converted) >= 1) {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(converted);
  }
  if (Math.abs(converted) >= 0.01) {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    }).format(converted);
  }
  const decimals = Math.max(
    2,
    -Math.floor(Math.log10(Math.abs(converted))) + 4,
  );
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(converted);
}