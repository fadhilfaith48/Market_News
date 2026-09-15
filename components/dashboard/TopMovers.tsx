"use client";

import { useRouter } from "next/navigation";

import { CoinIcon } from "@/components/ui/CoinIcon";
import { DEFAULT_SYMBOLS } from "@/lib/constants";
import { getCoinMeta } from "@/lib/coinMeta";
import { formatPercent } from "@/lib/format";
import { toneText } from "@/lib/market";
import { useMarketStore } from "@/store/marketStore";

const TOP_N = 5;

function rankSymbols(
  changeOf: (symbol: string) => number,
  direction: "desc" | "asc",
): string[] {
  return [...DEFAULT_SYMBOLS]
    .sort((a, b) =>
      direction === "desc"
        ? changeOf(b) - changeOf(a)
        : changeOf(a) - changeOf(b),
    )
    .slice(0, TOP_N);
}

function MoverRow({ symbol, rank }: { symbol: string; rank: number }) {
  const router = useRouter();
  const ticker = useMarketStore((state) => state.tickers[symbol]);
  const { code, name } = getCoinMeta(symbol);
  const change = ticker?.priceChangePercent ?? 0;

  return (
    <button
      type="button"
      onClick={() => router.push(`/coin/${code}`)}
      className="flex w-full cursor-pointer items-center gap-2 rounded border border-transparent px-2 py-1.5 text-left transition-colors hover:bg-hover hover:border-border/40"
    >
      <span className="w-5 flex-none text-center text-xs tabular-nums text-muted">
        {rank}.
      </span>
      <CoinIcon symbol={symbol} size={18} />
      <span className="min-w-0 flex-1 truncate">
        <span className="block text-sm font-medium leading-tight">{code}</span>
        <span className="block truncate text-xs text-muted">{name}</span>
      </span>
      <span
        className={`flex-none text-sm font-semibold tabular-nums ${toneText(change)}`}
      >
        {ticker ? formatPercent(change) : "-"}
      </span>
    </button>
  );
}

function MoversCard({
  title,
  symbols,
}: {
  title: string;
  symbols: string[];
}) {
  return (
    <div className="rounded border border-border">
      <div className="border-b border-border px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted">
        {title} (24 Jam)
      </div>
      <div className="space-y-0.5 p-2">
        {symbols.length === 0 ? (
          <p className="px-2 py-3 text-xs text-muted">Belum ada data.</p>
        ) : (
          symbols.map((symbol, index) => (
            <MoverRow key={symbol} symbol={symbol} rank={index + 1} />
          ))
        )}
      </div>
    </div>
  );
}

export function TopMovers() {
  const tickers = useMarketStore((state) => state.tickers);
  const hasData = DEFAULT_SYMBOLS.some((symbol) => tickers[symbol]);

  if (!hasData) return null;

  const changeOf = (symbol: string) =>
    tickers[symbol]?.priceChangePercent ?? 0;

  const gainers = rankSymbols(changeOf, "desc");
  const losers = rankSymbols(changeOf, "asc");

  return (
    <section
      aria-label="Pergerakan harga 24 jam"
      className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2"
    >
      <MoversCard title="Top Gainers" symbols={gainers} />
      <MoversCard title="Top Losers" symbols={losers} />
    </section>
  );
}