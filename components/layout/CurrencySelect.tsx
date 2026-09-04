"use client";

import { useUIStore } from "@/store/uiStore";
import { SUPPORTED_CURRENCIES, type SupportedCurrency } from "@/lib/format";

const LABELS: Record<SupportedCurrency, string> = {
  USD: "USD $",
  IDR: "IDR Rp",
  EUR: "EUR €",
  JPY: "JPY ¥",
  SGD: "SGD $",
};

export function CurrencySelect() {
  const currency = useUIStore((state) => state.currency);
  const setCurrency = useUIStore((state) => state.setCurrency);

  return (
    <select
      value={currency}
      onChange={(e) => setCurrency(e.target.value as SupportedCurrency)}
      className="rounded-md border border-border bg-panel px-2 py-1.5 text-xs text-text outline-none transition-colors focus:border-interactive"
    >
      {SUPPORTED_CURRENCIES.map((c) => (
        <option key={c} value={c}>
          {LABELS[c]}
        </option>
      ))}
    </select>
  );
}
