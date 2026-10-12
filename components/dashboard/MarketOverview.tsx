"use client";

import { useGlobalMarket } from "@/hooks/useGlobalMarket";
import { formatCompact, formatPercent } from "@/lib/format";

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "up" | "down";
}) {
  return (
    <div className="flex min-w-[120px] flex-col gap-0.5 px-4 py-2">
      <span className="text-[10px] uppercase tracking-wide text-muted">
        {label}
      </span>
      <span
        className={`text-sm font-semibold tabular-nums ${
          tone === "up" ? "text-up" : tone === "down" ? "text-down" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}

export function MarketOverview() {
  const { data } = useGlobalMarket();
  const market = data ?? null;
  const dash = "—";
  const change = market?.marketCapChange24h;
  const tone =
    change === null || change === undefined ? undefined : change >= 0 ? "up" : "down";

  return (
    <section
      aria-label="Statistik pasar global"
      className="border-b border-border bg-panel/50"
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-stretch divide-x divide-border/50">
        <Stat
          label="Total Market Cap"
          value={
            market?.totalMarketCapUsd != null
              ? `$${formatCompact(market.totalMarketCapUsd)}`
              : dash
          }
        />
        <Stat
          label="Volume 24j"
          value={
            market?.totalVolumeUsd != null
              ? `$${formatCompact(market.totalVolumeUsd)}`
              : dash
          }
        />
        <Stat
          label="Dominasi BTC"
          value={
            market?.btcDominance != null
              ? `${market.btcDominance.toFixed(2)}%`
              : dash
          }
        />
        <Stat
          label="Dominasi ETH"
          value={
            market?.ethDominance != null
              ? `${market.ethDominance.toFixed(2)}%`
              : dash
          }
        />
        <Stat
          label="Δ Market Cap 24j"
          value={
            market?.marketCapChange24h != null
              ? formatPercent(market.marketCapChange24h)
              : dash
          }
          tone={tone}
        />
      </div>
    </section>
  );
}