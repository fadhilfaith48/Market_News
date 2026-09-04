"use client";

import { CoinIcon } from "@/components/ui/CoinIcon";
import { WatchStar } from "@/components/ui/WatchStar";
import { getCoinMeta } from "@/lib/coinMeta";
import { formatCompact, formatPrice } from "@/lib/format";
import type { Kline, LiveKline, TickerWS } from "@/types";

interface CoinQuoteBarProps {
  symbol: string;
  ticker: TickerWS | null;
  latestKline: Kline | LiveKline | null;
}

function QuoteItem({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="text-muted">{label}</span>
      <span className="tabular-nums">{value}</span>
    </span>
  );
}

export function CoinQuoteBar({
  symbol,
  ticker,
  latestKline,
}: CoinQuoteBarProps) {
  const { code, name } = getCoinMeta(symbol);

  const k = latestKline;
  const open = k ? formatPrice(k.open) : "-";
  const high = k ? formatPrice(k.high) : "-";
  const low = k ? formatPrice(k.low) : "-";
  const close = k ? formatPrice(k.close) : "-";
  const vol = ticker ? formatCompact(ticker.quoteVolume) : "-";

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-border px-4 py-2 text-xs">
      <div className="flex items-center gap-2">
        <CoinIcon symbol={symbol} size={18} />
        <span className="font-semibold">{code}</span>
        <span className="text-muted">{name}</span>
        <WatchStar code={code} size={14} />
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-text">
        <QuoteItem label="O" value={open} />
        <QuoteItem label="H" value={high} />
        <QuoteItem label="L" value={low} />
        <QuoteItem label="C" value={close} />
        <QuoteItem label="Vol" value={vol} />
      </div>
    </div>
  );
}
