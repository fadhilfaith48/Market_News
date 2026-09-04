"use client";

import Link from "next/link";
import { useCallback, useState } from "react";

import { CoinQuoteBar } from "@/components/coin/CoinQuoteBar";
import { ChartToolbar } from "@/components/coin/ChartToolbar";
import { CoinInfoPanel } from "@/components/coin/CoinInfoPanel";
import { PriceChart } from "@/components/coin/PriceChart";
import { KLINE_DEFAULT_INTERVAL } from "@/lib/constants";
import { useKlines } from "@/hooks/useKlines";
import { useKlineStream } from "@/hooks/useKlineStream";
import { useMarketStore } from "@/store/marketStore";
import type { LiveKline } from "@/types";

export function CoinDetail({ code }: { code: string }) {
  const symbol = `${code}USDT`;
  const [interval, setInterval] = useState<string>(KLINE_DEFAULT_INTERVAL);
  const [live, setLive] = useState<LiveKline | null>(null);

  const ticker = useMarketStore((state) => state.tickers[symbol]);
  const { data: historical, isLoading, isError, refetch } = useKlines(
    symbol,
    interval,
  );
  const { open: streamOpen } = useKlineStream(symbol, interval, setLive);

  const handleIntervalChange = useCallback(
    (tf: string) => {
      setLive(null);
      setInterval(tf);
    },
    [],
  );

  const latestKline = live ?? (historical && historical.length > 0 ? historical[historical.length - 1] : null);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6">
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-text"
      >
        &larr; Kembali ke Dashboard
      </Link>

      <div className="flex flex-col gap-0 lg:grid lg:grid-cols-[minmax(0,1fr)_300px]">
        {/* Left column — Chart */}
        <div className="min-w-0">
          <CoinQuoteBar
            symbol={symbol}
            ticker={ticker ?? null}
            latestKline={latestKline}
          />

          <div className="overflow-hidden border border-border border-t-0">
            {isLoading && !historical ? (
              <div className="shimmer h-[500px] w-full" />
            ) : isError || !historical || historical.length === 0 ? (
              <div className="flex h-[500px] flex-col items-center justify-center gap-3">
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
              <PriceChart
                key={interval}
                historical={historical}
                live={live}
              />
            )}
          </div>

          <ChartToolbar
            interval={interval}
            setInterval={handleIntervalChange}
          />
        </div>

        {/* Right column — Info Panel */}
        <div className="mt-4 border-t border-border pt-4 lg:mt-0 lg:border-t-0 lg:border-l lg:border-border lg:pl-4 lg:pt-0">
          <div className="lg:sticky lg:top-4">
            <CoinInfoPanel ticker={ticker ?? null} streamOpen={streamOpen} />
          </div>
        </div>
      </div>
    </div>
  );
}
