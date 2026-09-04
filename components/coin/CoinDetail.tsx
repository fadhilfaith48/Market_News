"use client";

import Link from "next/link";
import { useState } from "react";

import { CoinDetailStats } from "@/components/coin/CoinDetailStats";
import { CoinIcon } from "@/components/ui/CoinIcon";
import { WatchStar } from "@/components/ui/WatchStar";
import { PriceChart } from "@/components/coin/PriceChart";
import { getCoinMeta } from "@/lib/coinMeta";
import { KLINE_DEFAULT_INTERVAL, TIMEFRAMES } from "@/lib/constants";
import { formatPrice } from "@/lib/format";
import { useKlines } from "@/hooks/useKlines";
import { useKlineStream } from "@/hooks/useKlineStream";
import { useMarketStore } from "@/store/marketStore";
import type { LiveKline } from "@/types";

export function CoinDetail({ code }: { code: string }) {
  const symbol = `${code}USDT`;
  const { name } = getCoinMeta(symbol);

  const [interval, setInterval] = useState<string>(KLINE_DEFAULT_INTERVAL);
  const [live, setLive] = useState<LiveKline | null>(null);

  const ticker = useMarketStore((state) => state.tickers[symbol]);
  const { data: historical, isLoading, isError, refetch } = useKlines(
    symbol,
    interval,
  );
  const streamOpen = useKlineStream(symbol, interval, setLive);

  const change = ticker?.priceChangePercent;
  const changeClass =
    change === undefined || change === 0
      ? "text-flat"
      : change > 0
        ? "text-up"
        : "text-down";

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6">
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-text"
      >
        &larr; Kembali ke Dashboard
      </Link>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <CoinIcon symbol={symbol} size={40} />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{code}</h1>
              <WatchStar code={code} size={18} />
              <span className="text-sm text-muted">
                {name} / USDT
              </span>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 text-xs ${
                streamOpen
                  ? "text-up"
                  : "text-warning"
              }`}
            >
              <span
                className={`size-1.5 rounded-full ${
                  streamOpen
                    ? "bg-up"
                    : "animate-pulse bg-warning"
                }`}
              />
              {streamOpen ? "Grafik live" : "Menyambung ulang…"}
            </span>
          </div>
        </div>

        <div className="text-right">
          <div className="text-3xl font-bold tabular-nums">
            {ticker ? formatPrice(ticker.lastPrice) : "-"}
          </div>
          <div className={`text-sm font-medium tabular-nums ${changeClass}`}>
            {change !== undefined
              ? `${change >= 0 ? "+" : ""}${change.toFixed(2)}% (24j)`
              : "…"}
          </div>
        </div>
      </div>

      <CoinDetailStats ticker={ticker ?? null} />

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-4">
        <div className="flex gap-1">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => setInterval(tf)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                interval === tf
                  ? "bg-text text-page"
                  : "text-muted hover:bg-hover hover:text-text"
              }`}
            >
              {tf.toUpperCase()}
            </button>
          ))}
        </div>
        <span className="text-xs text-muted">
          Sumber: Binance
        </span>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-border p-2">
        {isLoading && !historical ? (
          <div className="shimmer h-96 w-full rounded-lg" />
        ) : isError || !historical || historical.length === 0 ? (
          <div className="flex h-96 flex-col items-center justify-center gap-3">
            <div className="text-sm text-down">
              Gagal memuat data candlestick
            </div>
            <button
              type="button"
              onClick={() => refetch()}
              className="rounded-md border border-border px-4 py-1.5 text-sm font-medium hover:bg-hover"
            >
              Coba Lagi
            </button>
          </div>
        ) : (
          <PriceChart historical={historical} live={live} />
        )}
      </div>
    </div>
  );
}
