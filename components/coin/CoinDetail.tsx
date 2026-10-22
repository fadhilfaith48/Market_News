"use client";

import Link from "next/link";
import { useCallback, useState } from "react";

import { CoinQuoteBar } from "@/components/coin/CoinQuoteBar";
import { ChartToolbar } from "@/components/coin/ChartToolbar";
import { CoinAbout } from "@/components/coin/CoinAbout";
import { CoinInfoPanel } from "@/components/coin/CoinInfoPanel";
import { CoinNewsSection } from "@/components/coin/CoinNewsSection";
import { PriceChart } from "@/components/coin/PriceChart";
import { HoldingEditor } from "@/components/portfolio/HoldingEditor";
import { AlertQuickAdd } from "@/components/alerts/AlertQuickAdd";
import { KLINE_DEFAULT_INTERVAL, MA_PERIODS, type ChartType } from "@/lib/constants";
import { useKlines } from "@/hooks/useKlines";
import { useKlineStream } from "@/hooks/useKlineStream";
import { useMarketStore } from "@/store/marketStore";
import type { LiveKline } from "@/types";

export function CoinDetail({ code }: { code: string }) {
  const symbol = `${code}USDT`;
  const [interval, setInterval] = useState<string>(KLINE_DEFAULT_INTERVAL);
  const [live, setLive] = useState<LiveKline | null>(null);
  const [chartType, setChartType] = useState<ChartType>("candle");
  const [maPeriods, setMaPeriods] = useState<number[]>([...MA_PERIODS]);

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

  const toggleMa = useCallback((period: number) => {
    setMaPeriods((prev) =>
      prev.includes(period)
        ? prev.filter((item) => item !== period)
        : [...prev, period].sort((a, b) => a - b),
    );
  }, []);

  const latestKline = live ?? (historical && historical.length > 0 ? historical[historical.length - 1] : null);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6">
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-1 rounded-lg px-1 -ml-1 text-sm text-muted transition-colors hover:text-text focus-ring"
      >
        &larr; Kembali ke Dashboard
      </Link>

      {/* 2 kolom baru mulai di `lg` (1024px). Di iPad portrait (768px)
          kolom chart hanya ~420px → terlalu sempit untuk candle + volume + MA. */}
      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
        {/* Left column — Chart */}
        <div className="card min-w-0 overflow-hidden">
          <CoinQuoteBar
            symbol={symbol}
            ticker={ticker ?? null}
            latestKline={latestKline}
          />

          <div className="border-t border-border/60">
            {isLoading && !historical ? (
              <div className="shimmer h-[420px] w-full sm:h-[500px]" />
            ) : isError || !historical || historical.length === 0 ? (
              <div className="flex h-[420px] flex-col items-center justify-center gap-3 sm:h-[500px]">
                <div className="text-sm text-down">
                  Gagal memuat data candlestick
                </div>
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="btn-ghost focus-ring"
                >
                  Coba Lagi
                </button>
              </div>
            ) : (
              <PriceChart
                key={interval}
                historical={historical}
                live={live}
                chartType={chartType}
                maPeriods={maPeriods}
              />
            )}
          </div>

          <ChartToolbar
            interval={interval}
            setInterval={handleIntervalChange}
            chartType={chartType}
            setChartType={setChartType}
            maPeriods={maPeriods}
            toggleMa={toggleMa}
          />
        </div>

        {/* Right column — Info Panel */}
        <div className="mt-4 flex flex-col gap-4 lg:mt-0">
          {/* `top-[var(--header-h)]` = tinggi header REAL (diukur runtime).
              Nilai tetap `top-20` salah saat header jadi 2 baris (<1024px)
              → panel info tertutup header saat scroll. */}
          <div className="flex flex-col gap-4 lg:sticky top-[var(--header-h,5rem)]">
            <div className="card p-4">
              <CoinInfoPanel code={code} ticker={ticker ?? null} streamOpen={streamOpen} />
            </div>
            <div className="card p-4">
              <HoldingEditor code={code} />
            </div>
            <div className="card p-4">
              <AlertQuickAdd code={code} />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <CoinAbout code={code} />
      </div>

      <div className="mt-6">
        <CoinNewsSection code={code} />
      </div>
    </div>
  );
}
