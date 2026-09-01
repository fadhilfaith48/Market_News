"use client";

import { usePathname, useRouter } from "next/navigation";

import { CoinIcon } from "@/components/ui/CoinIcon";
import { DEFAULT_SYMBOLS } from "@/lib/constants";
import { getCoinMeta } from "@/lib/coinMeta";
import { formatPercent, formatPrice } from "@/lib/format";
import { toneText } from "@/lib/market";
import { useMarketStore } from "@/store/marketStore";
import { useUIStore } from "@/store/uiStore";
import { useWatchStore } from "@/store/watchStore";

function PanelRow({ symbol, active }: { symbol: string; active: boolean }) {
  const router = useRouter();
  const close = useUIStore((state) => state.setWatchlistOpen);
  const ticker = useMarketStore((state) => state.tickers[symbol]);
  const { code } = getCoinMeta(symbol);
  const change = ticker?.priceChangePercent;

  return (
    <button
      type="button"
      onClick={() => {
        close(false);
        router.push(`/coin/${code}`);
      }}
      className={`flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800/60 ${
        active ? "bg-zinc-100 dark:bg-zinc-800/70" : ""
      }`}
    >
      <CoinIcon symbol={symbol} size={18} />
      <span className="min-w-0 flex-1 truncate text-sm font-medium">
        {code}
      </span>
      <span className="flex-none text-right text-xs tabular-nums text-foreground">
        {ticker ? formatPrice(ticker.lastPrice) : "-"}
      </span>
      <span
        className={`w-14 flex-none text-right text-[11px] tabular-nums ${toneText(change)}`}
      >
        {ticker ? formatPercent(change ?? 0) : "-"}
      </span>
    </button>
  );
}

function PanelSection({
  title,
  symbols,
  activeCode,
}: {
  title: string;
  symbols: string[];
  activeCode: string | null;
}) {
  return (
    <details className="group border-b border-zinc-200 last:border-b-0 dark:border-zinc-800">
      <summary className="flex cursor-pointer select-none list-none items-center gap-1.5 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
        <span className="inline-block text-[9px] leading-none transition-transform group-open:rotate-90">
          ▶
        </span>
        {title}
        <span className="ml-auto text-[10px] font-normal lowercase tracking-normal">
          {symbols.length}
        </span>
      </summary>
      {symbols.length === 0 ? (
        <p className="px-3 pb-3 text-xs text-zinc-500 dark:text-zinc-400">
          Belum ada koin. Klik ikon ☆ di tabel untuk menambahkan.
        </p>
      ) : (
        <div>
          {symbols.map((symbol) => (
            <PanelRow
              key={symbol}
              symbol={symbol}
              active={activeCode !== null && activeCode === getCoinMeta(symbol).code}
            />
          ))}
        </div>
      )}
    </details>
  );
}

export function WatchlistPanel() {
  const open = useUIStore((state) => state.watchlistOpen);
  const close = useUIStore((state) => state.setWatchlistOpen);
  const watched = useWatchStore((state) => state.codes);
  const tickers = useMarketStore((state) => state.tickers);
  const pathname = usePathname();

  if (!open) return null;

  const activeCode =
    pathname.startsWith("/coin/") ? pathname.split("/")[2] ?? null : null;

  const watchSymbols = [...DEFAULT_SYMBOLS].filter((symbol) =>
    watched.includes(getCoinMeta(symbol).code),
  );

  const gainers = [...DEFAULT_SYMBOLS]
    .map((symbol) => ({
      symbol,
      change: tickers[symbol]?.priceChangePercent ?? -Infinity,
    }))
    .sort((a, b) => b.change - a.change)
    .slice(0, 5)
    .map((item) => item.symbol);

  return (
    <aside
      aria-label="Watchlist"
      className="fixed inset-y-0 right-0 z-50 flex w-[300px] max-w-[85vw] flex-col border-l border-zinc-200 bg-background dark:border-zinc-800"
    >
      <div className="flex items-center justify-between border-b border-zinc-200 px-3 py-2.5 dark:border-zinc-800">
        <h2 className="text-sm font-semibold">Watchlist</h2>
        <button
          type="button"
          aria-label="Tutup watchlist"
          onClick={() => close(false)}
          className="cursor-pointer rounded px-2 py-0.5 text-sm text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-foreground dark:hover:bg-zinc-800"
        >
          ✕
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <PanelSection
          title="Watchlist Saya"
          symbols={watchSymbols}
          activeCode={activeCode}
        />
        <PanelSection title="Top Gainers" symbols={gainers} activeCode={activeCode} />
        <PanelSection
          title="Semua Koin"
          symbols={[...DEFAULT_SYMBOLS]}
          activeCode={activeCode}
        />
      </div>
    </aside>
  );
}