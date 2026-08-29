"use client";

import { useRouter } from "next/navigation";

import { CoinIcon } from "@/components/ui/CoinIcon";
import { DEFAULT_SYMBOLS } from "@/lib/constants";
import { getCoinMeta } from "@/lib/coinMeta";
import { formatPercent, formatPrice } from "@/lib/format";
import { useMarketStore } from "@/store/marketStore";

export function TickerTable() {
  const router = useRouter();
  const tickers = useMarketStore((state) => state.tickers);
  const symbols = [...DEFAULT_SYMBOLS];
  const rows = symbols.map((symbol) => ({ symbol, ticker: tickers[symbol] }));
  const hasData = rows.some((row) => row.ticker);

  if (!hasData) {
    return (
      <div className="px-4 py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
        Menunggu data real-time dari Binance…
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-200 text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
            <th className="px-4 py-3">Koin</th>
            <th className="px-4 py-3 text-right">Harga</th>
            <th className="px-4 py-3 text-right">24 Jam</th>
            <th className="px-4 py-3 text-right">Volume (24 Jam)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ symbol, ticker }) => {
            const change = ticker?.priceChangePercent;
            const isUp = (change ?? 0) >= 0;
            const { code } = getCoinMeta(symbol);
            return (
              <tr
                key={symbol}
                onClick={() => router.push(`/coin/${code}`)}
                className="cursor-pointer border-b border-zinc-100 transition-colors hover:bg-zinc-50 dark:border-zinc-800/60 dark:hover:bg-zinc-900/40"
              >
                <td className="px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <CoinIcon symbol={symbol} size={22} />
                  <span className="font-medium">{getCoinMeta(symbol).code}</span>
                </div>
              </td>
                <td className="px-4 py-2.5 text-right tabular-nums">
                  {ticker ? formatPrice(ticker.lastPrice) : "-"}
                </td>
                <td
                  className={`px-4 py-2.5 text-right tabular-nums ${
                    isUp
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {ticker ? formatPercent(change ?? 0) : "-"}
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums text-zinc-600 dark:text-zinc-400">
                  {ticker ? formatPrice(ticker.quoteVolume) : "-"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}