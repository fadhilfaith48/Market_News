"use client";

import { useState, type CSSProperties } from "react";

import { CoinIcon } from "@/components/ui/CoinIcon";
import { DEFAULT_SYMBOLS } from "@/lib/constants";
import { getCoinMeta } from "@/lib/coinMeta";
import { formatCurrency, formatPercent } from "@/lib/format";
import { toneText } from "@/lib/market";
import { useMarketStore } from "@/store/marketStore";
import { useUIStore } from "@/store/uiStore";
import { useFiatRates } from "@/hooks/useFiatRates";
import type { SupportedCurrency } from "@/lib/format";

function TickerItem({ symbol }: { symbol: string }) {
  const ticker = useMarketStore((state) => state.tickers[symbol]);
  const currency = useUIStore((state) => state.currency) as SupportedCurrency;
  const { data: rateData } = useFiatRates();

  if (!ticker) return null;

  const { code } = getCoinMeta(symbol);
  const change = ticker.priceChangePercent;

  return (
    <span className="flex flex-none items-center gap-2 px-4 py-2 text-xs tabular-nums">
      <CoinIcon symbol={symbol} size={16} />
      <span className="font-medium">{code}</span>
      <span className="text-text">
        {formatCurrency(ticker.lastPrice, currency, rateData?.rates)}
      </span>
      <span className={toneText(change)}>
        {formatPercent(change ?? 0)}
      </span>
    </span>
  );
}

export function LiveTicker() {
  const tickers = useMarketStore((state) => state.tickers);
  const hasData = DEFAULT_SYMBOLS.some((symbol) => tickers[symbol]);
  /** Marquee berhenti selama pengguna menekan/menyentuh (juga di HP). */
  const [paused, setPaused] = useState(false);

  if (!hasData) {
    return (
      <div
        aria-hidden
        className="flex items-center gap-6 overflow-hidden border-b border-border bg-panel/60 px-4 py-2 backdrop-blur"
      >
        {Array.from({ length: 8 }, (_, index) => (
          <span
            key={index}
            className="flex flex-none items-center gap-2 text-xs"
          >
            <span className="shimmer size-4 rounded-full" />
            <span className="shimmer h-3 w-8 rounded" />
            <span className="shimmer h-3 w-14 rounded" />
            <span className="shimmer h-3 w-10 rounded" />
          </span>
        ))}
      </div>
    );
  }

  const items = [...DEFAULT_SYMBOLS];
  const duration = Math.max(15, items.length * 2.8);

  return (
    <div className="overflow-hidden border-b border-border bg-panel/60 backdrop-blur">
      <div
        className={`animate-marquee flex w-max hover:[animation-play-state:paused] ${
          paused ? "[animation-play-state:paused]" : ""
        }`}
        onPointerDown={() => setPaused(true)}
        onPointerUp={() => setPaused(false)}
        onPointerLeave={() => setPaused(false)}
        onPointerCancel={() => setPaused(false)}
        style={{ "--marquee-duration": `${duration}s` } as CSSProperties}
      >
        <div className="flex w-max items-center gap-1">
          {items.map((symbol) => (
            <span key={symbol}>
              <TickerItem symbol={symbol} />
            </span>
          ))}
        </div>
        <div
          aria-hidden
          className="flex w-max items-center gap-1"
        >
          {items.map((symbol) => (
            <span key={symbol}>
              <TickerItem symbol={symbol} />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}