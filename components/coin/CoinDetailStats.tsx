"use client";

import { formatCompact, formatPercent, formatPrice } from "@/lib/format";
import type { TickerWS } from "@/types";

type Tone = "up" | "down" | "flat";

function changeVariant(change: number | undefined): Tone {
  if (change === undefined || change === 0) return "flat";
  return change > 0 ? "up" : "down";
}

const TONE_TEXT: Record<Tone, string> = {
  up: "text-up",
  down: "text-down",
  flat: "text-flat",
};

function StatCard({
  label,
  value,
  tone = "flat",
}: {
  label: string;
  value: string;
  tone?: Tone;
}) {
  return (
    <div className="rounded-xl border border-border px-4 py-3">
      <div className="text-xs text-muted">{label}</div>
      <div className={`mt-0.5 text-lg font-semibold tabular-nums ${TONE_TEXT[tone]}`}>
        {value}
      </div>
    </div>
  );
}

export function CoinDetailStats({ ticker }: { ticker: TickerWS | null }) {
  const change = ticker?.priceChangePercent;
  const tone = changeVariant(change);
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatCard
        label="Tertinggi 24j"
        value={ticker ? formatPrice(ticker.highPrice) : "-"}
      />
      <StatCard
        label="Terendah 24j"
        value={ticker ? formatPrice(ticker.lowPrice) : "-"}
      />
      <StatCard
        label="Volume 24j"
        value={ticker ? formatCompact(ticker.quoteVolume) : "-"}
      />
      <StatCard
        label="Perubahan 24j"
        value={ticker ? formatPercent(change ?? 0) : "-"}
        tone={tone}
      />
    </div>
  );
}
