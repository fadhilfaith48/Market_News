"use client";

import { useRouter } from "next/navigation";

import { CoinIcon } from "@/components/ui/CoinIcon";
import { getCoinMeta } from "@/lib/coinMeta";
import {
  formatCompact,
  formatCurrency,
  formatPercent,
} from "@/lib/format";
import type { SupportedCurrency } from "@/lib/format";
import { toneText } from "@/lib/market";
import { computePosition, computeSummary, getSymbol } from "@/lib/portfolio";
import { useFiatRates } from "@/hooks/useFiatRates";
import { useMarketStore } from "@/store/marketStore";
import { usePortfolioStore } from "@/store/portfolioStore";
import { useUIStore } from "@/store/uiStore";

function PortfolioRow({ code }: { code: string }) {
  const router = useRouter();
  const close = useUIStore((state) => state.setPortfolioOpen);
  const holding = usePortfolioStore((state) => state.holdings[code]);
  const remove = usePortfolioStore((state) => state.remove);
  const ticker = useMarketStore((state) => state.tickers[getSymbol(code)]);
  const currency = useUIStore((state) => state.currency) as SupportedCurrency;
  const { data: rateData } = useFiatRates();

  if (!holding) return null;

  const { name } = getCoinMeta(getSymbol(code));
  const position = computePosition(code, holding, ticker?.lastPrice);

  return (
    <div className="flex w-full items-center gap-2 border-b border-border/50 px-3 py-2">
      <button
        type="button"
        onClick={() => {
          close(false);
          router.push(`/coin/${code}`);
        }}
        className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 text-left transition-colors hover:bg-hover"
      >
        <CoinIcon symbol={getSymbol(code)} size={18} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{code}</span>
          <span className="block text-[10px] text-muted">{name}</span>
        </span>
        <span className="flex-none text-right">
          <span className="block text-xs tabular-nums">
            {position
              ? formatCurrency(position.currentValue, currency, rateData?.rates)
              : "-"}
          </span>
          <span
            className={`block text-[10px] tabular-nums ${toneText(position ? position.pnl : undefined)}`}
          >
            {position ? formatPercent(position.pnlPercent) : "-"}
          </span>
        </span>
      </button>
      <span className="flex-none text-right text-[10px] text-muted tabular-nums">
        {formatCompact(holding.qty)} @{" "}
        {formatCurrency(holding.avgCost, currency, rateData?.rates)}
      </span>
      <button
        type="button"
        aria-label={`Hapus ${code} dari portofolio`}
        onClick={() => remove(code)}
        className="cursor-pointer rounded px-1.5 text-sm text-muted transition-colors hover:bg-hover hover:text-text"
      >
        ✕
      </button>
    </div>
  );
}

export function PortfolioPanel() {
  const open = useUIStore((state) => state.portfolioOpen);
  const close = useUIStore((state) => state.setPortfolioOpen);
  const holdings = usePortfolioStore((state) => state.holdings);
  const tickers = useMarketStore((state) => state.tickers);
  const currency = useUIStore((state) => state.currency) as SupportedCurrency;
  const { data: rateData } = useFiatRates();

  if (!open) return null;

  const codes = Object.keys(holdings);

  const priceByCode: Record<string, number | undefined> = {};
  for (const code of codes) {
    priceByCode[code] = tickers[getSymbol(code)]?.lastPrice;
  }
  const summary = computeSummary(holdings, priceByCode);
  const summaryTone = toneText(summary.pnl);

  return (
    <aside
      aria-label="Portofolio"
      className="fixed inset-y-0 right-0 z-50 flex w-[300px] max-w-[85vw] flex-col border-l border-border bg-panel"
    >
      <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
        <h2 className="text-sm font-semibold">Portofolio</h2>
        <button
          type="button"
          aria-label="Tutup portofolio"
          onClick={() => close(false)}
          className="cursor-pointer rounded px-2 py-0.5 text-sm text-muted transition-colors hover:bg-hover hover:text-text"
        >
          ✕
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {codes.length === 0 ? (
          <p className="px-3 py-4 text-xs text-muted">
            Belum ada posisi. Catat kepemilikan dari halaman detail koin melalui
            form Kepemilikan Saya.
          </p>
        ) : (
          codes.map((code) => <PortfolioRow key={code} code={code} />)
        )}
      </div>
      {codes.length > 0 && (
        <div className="space-y-1 border-t border-border px-3 py-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted">Total Nilai</span>
            <span className="tabular-nums">
              {formatCurrency(summary.totalValue, currency, rateData?.rates)}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted">Total Biaya</span>
            <span className="tabular-nums">
              {formatCurrency(summary.totalCost, currency, rateData?.rates)}
            </span>
          </div>
          <div className={`flex items-center justify-between text-xs ${summaryTone}`}>
            <span className="font-medium">Total P/L</span>
            <span className="font-medium tabular-nums">
              {formatCurrency(summary.pnl, currency, rateData?.rates)} (
              {formatPercent(summary.pnlPercent)})
            </span>
          </div>
        </div>
      )}
    </aside>
  );
}