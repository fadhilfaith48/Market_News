"use client";

import { useRouter } from "next/navigation";

import { CoinIcon } from "@/components/ui/CoinIcon";
import { WatchStar } from "@/components/ui/WatchStar";
import { useMarketDataContext } from "@/components/dashboard/marketDataContext";
import { DEFAULT_SYMBOLS } from "@/lib/constants";
import { getCoinMeta } from "@/lib/coinMeta";
import { formatCompact, formatCurrency, formatPercent } from "@/lib/format";
import { toneText } from "@/lib/market";
import { useMarketStore } from "@/store/marketStore";
import { useUIStore } from "@/store/uiStore";
import { useFiatRates } from "@/hooks/useFiatRates";
import type { SupportedCurrency } from "@/lib/format";
import type { TickerWS } from "@/types";

function flashTone(
  ticker: TickerWS | undefined,
  previous: number | undefined,
): "up" | "down" | "flat" {
  if (!ticker || previous === undefined) return "flat";
  if (ticker.lastPrice > previous) return "up";
  if (ticker.lastPrice < previous) return "down";
  return "flat";
}

function FlashPrice({
  ticker,
  previous,
  currency,
  rates,
}: {
  ticker: TickerWS | undefined;
  previous: number | undefined;
  currency: SupportedCurrency;
  rates: Record<string, number> | undefined;
}) {
  const tone = flashTone(ticker, previous);
  const flashClass =
    tone === "up"
      ? "animate-flash-up"
      : tone === "down"
        ? "animate-flash-down"
        : "";
  return (
    <span
      key={ticker ? `${ticker.symbol}-${ticker.lastPrice}` : "empty"}
      className={`-mx-1 inline-block rounded-sm px-1 ${flashClass}`}
    >
      {ticker ? formatCurrency(ticker.lastPrice, currency, rates) : "-"}
    </span>
  );
}

export function TickerTable() {
  const router = useRouter();
  const tickers = useMarketStore((state) => state.tickers);
  const previousLastPrice = useMarketStore((state) => state.previousLastPrice);
  const connectionStatus = useUIStore((state) => state.connectionStatus);
  const currency = useUIStore((state) => state.currency) as SupportedCurrency;
  const { data: rateData } = useFiatRates();
  const { retryConnection } = useMarketDataContext();

  const symbols = [...DEFAULT_SYMBOLS];
  const rows = symbols.map((symbol) => ({
    symbol,
    ticker: tickers[symbol],
    previous: previousLastPrice[symbol],
  }));
  const hasData = rows.some((row) => row.ticker);

  if (!hasData) {
    if (connectionStatus === "offline") {
      return (
        <div className="space-y-3 px-4 py-10 text-center sm:py-14">
          <div className="text-sm font-medium text-text">
            Koneksi ke Binance terputus
          </div>
          <p className="mx-auto max-w-sm text-sm text-muted">
            Data real-time tidak bisa dimuat. Periksa koneksi internet Anda,
            lalu coba lagi.
          </p>
          <button
            type="button"
            onClick={retryConnection}
            className="rounded-md border border-border px-4 py-1.5 text-sm font-medium hover:bg-hover"
          >
            Coba Lagi
          </button>
        </div>
      );
    }

    return <TickerTableSkeleton />;
  }

  const openCoin = (symbol: string) => {
    const { code } = getCoinMeta(symbol);
    router.push(`/coin/${code}`);
  };

  return (
    <div>
      <div className="grid grid-cols-1 gap-2 sm:hidden">
        {rows.map(({ symbol, ticker, previous }) => {
          const change = ticker?.priceChangePercent;
          const { code, name } = getCoinMeta(symbol);
          return (
            <div
              key={symbol}
              onClick={() => openCoin(symbol)}
              className="flex cursor-pointer items-center justify-between rounded-xl border border-border p-3 hover:bg-hover"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <WatchStar code={code} />
                <CoinIcon symbol={symbol} size={28} />
                <div className="min-w-0">
                  <div className="font-medium">{code}</div>
                  <div className="truncate text-xs text-muted">
                    {name}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="tabular-nums text-sm font-semibold">
                  <FlashPrice ticker={ticker} previous={previous} currency={currency} rates={rateData?.rates} />
                </div>
                <div className={`text-xs tabular-nums ${toneText(change)}`}>
                  {ticker ? formatPercent(change ?? 0) : "-"}
                </div>
                <div className="text-xs tabular-nums text-muted">
                  {ticker ? formatCompact(ticker.quoteVolume) : "-"}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
              <th className="px-4 py-3">Koin</th>
              <th className="px-4 py-3 text-right">Harga</th>
              <th className="px-4 py-3 text-right">24 Jam</th>
              <th className="px-4 py-3 text-right">Volume (24 Jam)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ symbol, ticker, previous }) => {
              const change = ticker?.priceChangePercent;
              const { code } = getCoinMeta(symbol);
              return (
                <tr
                  key={symbol}
                  onClick={() => openCoin(symbol)}
                  className="cursor-pointer border-b border-border/50 transition-colors hover:bg-hover"
                >
                  <td className="px-4 py-2.5">
                    <div className="flex min-w-0 items-center gap-2">
                      <WatchStar code={code} />
                      <CoinIcon symbol={symbol} size={22} />
                      <span className="font-medium">{code}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums">
                    <FlashPrice ticker={ticker} previous={previous} currency={currency} rates={rateData?.rates} />
                  </td>
                  <td
                    className={`px-4 py-2.5 text-right tabular-nums ${toneText(change)}`}
                  >
                    {ticker ? formatPercent(change ?? 0) : "-"}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-muted">
                    {ticker ? formatCompact(ticker.quoteVolume) : "-"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TickerTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
            <th className="px-4 py-3">Koin</th>
            <th className="px-4 py-3 text-right">Harga</th>
            <th className="px-4 py-3 text-right">24 Jam</th>
            <th className="px-4 py-3 text-right">Volume (24 Jam)</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 10 }, (_, index) => (
            <tr key={index} className="border-b border-border/50">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="shimmer h-6 w-6 rounded-full" />
                  <div className="shimmer h-3.5 w-16 rounded" />
                </div>
              </td>
              <td className="px-4 py-3 text-right">
                <div className="shimmer ml-auto h-3.5 w-20 rounded" />
              </td>
              <td className="px-4 py-3 text-right">
                <div className="shimmer ml-auto h-3.5 w-16 rounded" />
              </td>
              <td className="px-4 py-3 text-right">
                <div className="shimmer ml-auto h-3.5 w-20 rounded" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
