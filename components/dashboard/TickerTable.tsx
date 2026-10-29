"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { CoinIcon } from "@/components/ui/CoinIcon";
import { WatchStar } from "@/components/ui/WatchStar";
import { useMarketDataContext } from "@/components/dashboard/marketDataContext";
import { DEFAULT_SYMBOLS } from "@/lib/constants";
import { getCoinMeta } from "@/lib/coinMeta";
import { formatCompact, formatCurrency, formatPercent } from "@/lib/format";
import { toneText } from "@/lib/market";
import { applyRangeFilter, sortRows } from "@/lib/sort";
import type { RangeFilter, SortDir, SortKey } from "@/lib/sort";
import { useMarketStore } from "@/store/marketStore";
import { useUIStore } from "@/store/uiStore";
import { useFiatRates } from "@/hooks/useFiatRates";
import { useCoinMarket } from "@/hooks/useCoinMarket";
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

const FILTERS: { key: RangeFilter; label: string }[] = [
  { key: "all", label: "Semua" },
  { key: "gainers", label: "Top Gainers" },
  { key: "losers", label: "Top Losers" },
];

const SORT_COLUMNS: { key: SortKey; label: string }[] = [
  { key: "price", label: "Harga" },
  { key: "change", label: "24 Jam" },
  { key: "volume", label: "Volume" },
  { key: "marketCap", label: "Market Cap" },
];

export function TickerTable() {
  const router = useRouter();
  const tickers = useMarketStore((state) => state.tickers);
  const previousLastPrice = useMarketStore((state) => state.previousLastPrice);
  const connectionStatus = useUIStore((state) => state.connectionStatus);
  const currency = useUIStore((state) => state.currency) as SupportedCurrency;
  const { data: rateData } = useFiatRates();
  const { data: marketData } = useCoinMarket();
  const { retryConnection } = useMarketDataContext();

  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({
    key: "marketCap",
    dir: "desc",
  });
  const [filter, setFilter] = useState<RangeFilter>("all");

  const marketCapByCode = useMemo(() => {
    const map: Record<string, number> = {};
    for (const coin of marketData?.coins ?? []) {
      if (typeof coin.marketCap === "number") {
        map[coin.code] = coin.marketCap;
      }
    }
    return map;
  }, [marketData]);

  const symbols = [...DEFAULT_SYMBOLS];

  const rawRows = symbols.map((symbol) => ({
    symbol,
    ticker: tickers[symbol],
    previous: previousLastPrice[symbol],
    marketCap: marketCapByCode[getCoinMeta(symbol).code] ?? null,
  }));

  const orderedRows = sortRows(
    applyRangeFilter(rawRows, filter),
    sort.key,
    sort.dir,
  );

  const hasData = rawRows.some((row) => row.ticker);

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
            className="btn-ghost focus-ring px-4 py-1.5 text-sm"
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

  const handleSort = (key: SortKey) => {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "desc" },
    );
  };

  return (
    <div className="card p-3 sm:p-4">
      <div className="mb-3 inline-flex gap-1 rounded-full bg-hover p-0.5">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`focus-ring rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              filter === f.key
                ? "bg-interactive text-white shadow-card"
                : "text-muted hover:text-text"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Kontrol urut khusus HP (tampilan kartu tidak punya header tabel) */}
      <div className="mb-3 flex flex-wrap items-center gap-1 sm:hidden">
        <span className="mr-0.5 text-xs text-muted">Urut:</span>
        {SORT_COLUMNS.map((col) => {
          const active = sort.key === col.key;
          return (
            <button
              key={col.key}
              type="button"
              onClick={() => handleSort(col.key)}
              aria-pressed={active}
              aria-label={`Urutkan berdasarkan ${col.label}`}
              className={`focus-ring inline-flex min-h-8 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                active
                  ? "bg-interactive text-white shadow-card"
                  : "bg-hover text-muted"
              }`}
            >
              {col.label}
              <span aria-hidden="true" className="text-[9px]">
                {active ? (sort.dir === "asc" ? "▲" : "▼") : "↕"}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-2 sm:hidden">
        {orderedRows.map(({ symbol, ticker, previous }) => {
          const change = ticker?.priceChangePercent;
          const { code, name } = getCoinMeta(symbol);
          return (
            // Tautan (bukan `div onClick`) agar bisa dijangkau keyboard &
            // dibacakan screen reader sebagai link. `WatchStar` tetap di luar
            // tautan sehingga tidak bersarang di kontrol interaktif.
            <div
              key={symbol}
              className="card card-hover flex items-center p-2"
            >
              <WatchStar code={code} />
              <Link
                href={`/coin/${code}`}
                aria-label={`Buka detail ${name} (${code})`}
                className="focus-ring flex min-w-0 flex-1 items-center justify-between gap-2 rounded-lg p-1"
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <CoinIcon symbol={symbol} size={28} />
                  <span className="min-w-0">
                    <span className="block font-medium">{code}</span>
                    <span className="block truncate text-xs text-muted">
                      {name}
                    </span>
                  </span>
                </span>
                <span className="text-right">
                  <span className="block tabular-nums text-sm font-semibold">
                    <FlashPrice
                      ticker={ticker}
                      previous={previous}
                      currency={currency}
                      rates={rateData?.rates}
                    />
                  </span>
                  <span
                    className={`block text-xs tabular-nums ${toneText(change)}`}
                  >
                    {ticker ? formatPercent(change ?? 0) : "-"}
                  </span>
                  <span className="block text-xs tabular-nums text-muted">
                    {ticker ? formatCompact(ticker.quoteVolume) : "-"}
                  </span>
                </span>
              </Link>
            </div>
          );
        })}
      </div>

      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
              <th className="px-4 py-3">Koin</th>
              {SORT_COLUMNS.map((col) => (
                <th
                  key={col.key}
                  aria-sort={
                    sort.key === col.key
                      ? sort.dir === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                  className={`px-4 py-3 text-right ${
                    col.key === "volume" ? "hidden md:table-cell" : ""
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleSort(col.key)}
                    aria-label={`Urutkan berdasarkan ${col.label}`}
                    className="focus-ring inline-flex cursor-pointer items-center gap-1 rounded uppercase tracking-wide transition-colors hover:text-text"
                  >
                    {col.label}
                    <span className="text-[9px]">
                      {sort.key === col.key
                        ? sort.dir === "asc"
                          ? "▲"
                          : "▼"
                        : "↕"}
                    </span>
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orderedRows.map((row) => {
              const { symbol, ticker, previous, marketCap } = row;
              const change = ticker?.priceChangePercent;
              const { code, name } = getCoinMeta(symbol);
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
                      {/* Tautan asli → dapat dijangkau keyboard (klik baris
                          tetap tersedia untuk pengguna mouse). */}
                      <Link
                        href={`/coin/${code}`}
                        aria-label={`Buka detail ${name} (${code})`}
                        className="focus-ring rounded font-medium hover:underline"
                      >
                        {code}
                      </Link>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums">
                    <FlashPrice
                      ticker={ticker}
                      previous={previous}
                      currency={currency}
                      rates={rateData?.rates}
                    />
                  </td>
                  <td
                    className={`px-4 py-2.5 text-right tabular-nums ${toneText(change)}`}
                  >
                    {ticker ? formatPercent(change ?? 0) : "-"}
                  </td>
                  <td className="hidden px-4 py-2.5 text-right tabular-nums text-muted md:table-cell">
                    {ticker ? formatCompact(ticker.quoteVolume) : "-"}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-muted">
                    {marketCap ? `$${formatCompact(marketCap)}` : "-"}
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
    <div className="card overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
            <th className="px-4 py-3">Koin</th>
            <th className="px-4 py-3 text-right">Harga</th>
            <th className="px-4 py-3 text-right">24 Jam</th>
            <th className="hidden px-4 py-3 text-right md:table-cell">Volume (24 Jam)</th>
            <th className="px-4 py-3 text-right">Market Cap</th>
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
              <td className="hidden px-4 py-3 text-right md:table-cell">
                <div className="shimmer ml-auto h-3.5 w-20 rounded" />
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