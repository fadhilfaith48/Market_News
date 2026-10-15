"use client";

import type { ReactNode } from "react";

import { useGlobalMarket } from "@/hooks/useGlobalMarket";
import { formatCompact, formatPercent } from "@/lib/format";

function StatIcon({ children }: { children: ReactNode }) {
  return (
    <svg
      className="size-3.5 flex-none text-muted"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const ICONS = {
  cap: (
    <StatIcon>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
    </StatIcon>
  ),
  volume: (
    <StatIcon>
      <path d="M5 20V11M12 20V4M19 20v-6" />
    </StatIcon>
  ),
  pie: (
    <StatIcon>
      <path d="M12 3a9 9 0 1 0 9 9h-9V3Z" />
    </StatIcon>
  ),
  trend: (
    <StatIcon>
      <path d="M3 17l6-6 4 4 8-8" />
      <path d="M21 7v5h-5" />
    </StatIcon>
  ),
};

function Stat({
  icon,
  label,
  value,
  tone,
  className = "",
}: {
  icon: ReactNode;
  label: string;
  value: string;
  tone?: "up" | "down";
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col gap-1 bg-panel px-4 py-2.5 transition-colors hover:bg-hover ${className}`}
    >
      <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-muted">
        {icon}
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
    change === null || change === undefined
      ? undefined
      : change >= 0
        ? "up"
        : "down";

  return (
    <section
      aria-label="Statistik pasar global"
      className="mx-auto w-full max-w-7xl px-4 pt-4"
    >
      <div className="card overflow-hidden">
        <div className="grid grid-cols-2 gap-px bg-border sm:grid-cols-3 lg:grid-cols-5">
          <Stat
            icon={ICONS.cap}
            label="Total Market Cap"
            value={
              market?.totalMarketCapUsd != null
                ? `$${formatCompact(market.totalMarketCapUsd)}`
                : dash
            }
          />
          <Stat
            icon={ICONS.volume}
            label="Volume 24j"
            value={
              market?.totalVolumeUsd != null
                ? `$${formatCompact(market.totalVolumeUsd)}`
                : dash
            }
          />
          <Stat
            icon={ICONS.pie}
            label="Dominasi BTC"
            value={
              market?.btcDominance != null
                ? `${market.btcDominance.toFixed(2)}%`
                : dash
            }
          />
          <Stat
            icon={ICONS.pie}
            label="Dominasi ETH"
            value={
              market?.ethDominance != null
                ? `${market.ethDominance.toFixed(2)}%`
                : dash
            }
          />
          <Stat
            icon={ICONS.trend}
            label="Δ Market Cap 24j"
            value={
              market?.marketCapChange24h != null
                ? formatPercent(market.marketCapChange24h)
                : dash
            }
            tone={tone}
            className="last:col-span-2 sm:last:col-span-2 lg:last:col-span-1"
          />
        </div>
      </div>
    </section>
  );
}