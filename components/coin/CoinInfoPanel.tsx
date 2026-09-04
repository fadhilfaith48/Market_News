"use client";

import { formatCompact, formatCurrency, formatPercent } from "@/lib/format";
import { toneText } from "@/lib/market";
import { useUIStore } from "@/store/uiStore";
import { useFiatRates } from "@/hooks/useFiatRates";
import type { SupportedCurrency } from "@/lib/format";
import type { TickerWS } from "@/types";

interface CoinInfoPanelProps {
  ticker: TickerWS | null;
  streamOpen: boolean;
}

function StatRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-xs text-muted">{label}</span>
      <span className={`text-xs tabular-nums ${tone ?? ""}`}>{value}</span>
    </div>
  );
}

function FactsRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-[11px] text-muted">{label}</span>
      <span className="text-[11px] tabular-nums text-text">{value}</span>
    </div>
  );
}

function getKeyFacts(
  change: number | undefined,
  volume: number | undefined,
): { label: string; value: string }[] {
  const facts: { label: string; value: string }[] = [];

  if (change !== undefined) {
    if (change > 5) facts.push({ label: "Tren", value: "Bullish kuat" });
    else if (change > 0) facts.push({ label: "Tren", value: "Bullish" });
    else if (change === 0) facts.push({ label: "Tren", value: "Sideways" });
    else if (change > -5) facts.push({ label: "Tren", value: "Bearish" });
    else facts.push({ label: "Tren", value: "Bearish kuat" });
  }

  if (volume !== undefined) {
    if (volume > 1_000_000_000)
      facts.push({ label: "Likuiditas", value: "Sangat tinggi" });
    else if (volume > 100_000_000)
      facts.push({ label: "Likuiditas", value: "Tinggi" });
    else if (volume > 10_000_000)
      facts.push({ label: "Likuiditas", value: "Sedang" });
    else facts.push({ label: "Likuiditas", value: "Rendah" });
  }

  return facts;
}

export function CoinInfoPanel({ ticker, streamOpen }: CoinInfoPanelProps) {
  const change = ticker?.priceChangePercent;
  const changeText = toneText(change);
  const currency = useUIStore((state) => state.currency) as SupportedCurrency;
  const { data: rateData } = useFiatRates();

  const lastUpdate = ticker?.eventTime
    ? new Date(ticker.eventTime).toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZone: "UTC",
      }) + " UTC"
    : "-";

  const keyFacts = getKeyFacts(change, ticker?.quoteVolume);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="text-3xl font-bold tabular-nums">
          {ticker ? formatCurrency(ticker.lastPrice, currency, rateData?.rates) : "-"}
        </div>
        <div className={`text-sm font-medium tabular-nums ${changeText}`}>
          {change !== undefined
            ? `${change >= 0 ? "+" : ""}${change.toFixed(2)}%`
            : "…"}
          <span className="ml-1 text-muted">(24j)</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-xs">
        <span
          className={`size-1.5 rounded-full ${
            streamOpen ? "bg-up animate-pulse" : "bg-warning"
          }`}
        />
        <span className={streamOpen ? "text-up" : "text-warning"}>
          {streamOpen ? "Live" : "Menyambung…"}
        </span>
        <span className="text-muted">· {lastUpdate}</span>
      </div>

      <div className="space-y-0 border-t border-border pt-3">
        <h3 className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted">
          Key Stats
        </h3>
        <StatRow
          label="Volume 24j"
          value={ticker ? formatCompact(ticker.quoteVolume) : "-"}
        />
        <StatRow
          label="Tertinggi 24j"
          value={ticker ? formatCurrency(ticker.highPrice, currency, rateData?.rates) : "-"}
        />
        <StatRow
          label="Terendah 24j"
          value={ticker ? formatCurrency(ticker.lowPrice, currency, rateData?.rates) : "-"}
        />
        <StatRow
          label="Perubahan 24j"
          value={ticker ? formatPercent(change ?? 0) : "-"}
          tone={changeText}
        />
        <StatRow label="Market Cap" value="n/a" />
        <StatRow label="Supply" value="n/a" />
      </div>

      {keyFacts.length > 0 && (
        <div className="space-y-0 border-t border-border pt-3">
          <h3 className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted">
            Key Facts
          </h3>
          {keyFacts.map((f) => (
            <FactsRow key={f.label} label={f.label} value={f.value} />
          ))}
        </div>
      )}
    </div>
  );
}
