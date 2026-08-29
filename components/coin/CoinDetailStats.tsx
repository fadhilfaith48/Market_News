"use client";

import { formatCompact, formatPercent, formatPrice } from "@/lib/format";
import type { TickerWS } from "@/types";

function StatCard({
  label,
  value,
  variant = "default",
}: {
  label: string;
  value: string;
  variant?: "default" | "up" | "down";
}) {
  const color =
    variant === "up"
      ? "text-green-600 dark:text-green-400"
      : variant === "down"
        ? "text-red-600 dark:text-red-400"
        : "text-foreground";
  return (
    <div className="rounded-xl border border-zinc-200 px-4 py-3 dark:border-zinc-800">
      <div className="text-xs text-zinc-500 dark:text-zinc-400">{label}</div>
      <div className={`mt-0.5 text-lg font-semibold tabular-nums ${color}`}>
        {value}
      </div>
    </div>
  );
}

export function CoinDetailStats({ ticker }: { ticker: TickerWS | null }) {
  const change = ticker?.priceChangePercent;
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatCard label="Tertinggi 24j" value={ticker ? formatPrice(ticker.highPrice) : "-"} />
      <StatCard label="Terendah 24j" value={ticker ? formatPrice(ticker.lowPrice) : "-"} />
      <StatCard
        label="Volume 24j"
        value={ticker ? formatCompact(ticker.quoteVolume) : "-"}
      />
      <StatCard
        label="Perubahan 24j"
        value={ticker ? formatPercent(change ?? 0) : "-"}
        variant={
          change !== undefined
            ? change >= 0
              ? "up"
              : "down"
            : "default"
        }
      />
    </div>
  );
}