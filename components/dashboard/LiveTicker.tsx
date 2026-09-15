"use client";

import type { CSSProperties } from "react";

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

  if (!hasData) {
    return (
      <div className="flex items-center gap-2 border-b border-border bg-panel px-4 py-2 text-xs text-muted">
        Memuat data pasar…
      </div>
    );
  }

  const items = [...DEFAULT_SYMBOLS];
  const duration = Math.max(15, items.length * 2.8);

  return (
    <div className="overflow-hidden border-b border-border bg-panel">
      <div
        className="animate-marquee flex w-max hover:[animation-play-state:paused]"
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