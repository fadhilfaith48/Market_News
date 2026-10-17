"use client";

import { useRouter } from "next/navigation";

import { CoinIcon } from "@/components/ui/CoinIcon";
import { DrawerShell } from "@/components/ui/DrawerShell";
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
import { useToast } from "@/hooks/useToast";
import { useMarketStore } from "@/store/marketStore";
import { usePortfolioStore } from "@/store/portfolioStore";
import { useUIStore } from "@/store/uiStore";

function PortfolioRow({ code }: { code: string }) {
  const router = useRouter();
  const close = useUIStore((state) => state.setPortfolioOpen);
  const holding = usePortfolioStore((state) => state.holdings[code]);
  const remove = usePortfolioStore((state) => state.remove);
  const ticker = useMarketStore((state) => state.tickers[getSymbol(code)]);
  const toast = useToast();
  const currency = useUIStore((state) => state.currency) as SupportedCurrency;
  const { data: rateData } = useFiatRates();

  if (!holding) return null;

  const { name } = getCoinMeta(getSymbol(code));
  const position = computePosition(code, holding, ticker?.lastPrice);

  return (
    <div className="flex w-full items-center gap-2 px-3 py-2">
      <button
        type="button"
        onClick={() => {
          close(false);
          router.push(`/coin/${code}`);
        }}
        className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-lg text-left transition-colors hover:bg-hover focus-ring"
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
        onClick={() => {
          remove(code);
          toast("info", "Posisi dihapus", code);
        }}
        className="btn-ghost size-8 justify-center p-0 focus-ring"
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

  const codes = Object.keys(holdings);

  const priceByCode: Record<string, number | undefined> = {};
  for (const code of codes) {
    priceByCode[code] = tickers[getSymbol(code)]?.lastPrice;
  }
  const summary = computeSummary(holdings, priceByCode);
  const summaryTone = toneText(summary.pnl);

  return (
    <DrawerShell
      open={open}
      title="Portofolio"
      ariaLabel="Portofolio"
      onClose={() => close(false)}
      footer={
        codes.length > 0 ? (
          <div className="space-y-1 rounded-xl border border-border/60 bg-page px-3 py-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted">Total Nilai</span>
              <span className="tabular-nums">
                {formatCurrency(summary.totalValue, currency, rateData?.rates)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">Total Biaya</span>
              <span className="tabular-nums">
                {formatCurrency(summary.totalCost, currency, rateData?.rates)}
              </span>
            </div>
            <div className={`flex items-center justify-between ${summaryTone}`}>
              <span className="font-medium">Total P/L</span>
              <span className="font-medium tabular-nums">
                {formatCurrency(summary.pnl, currency, rateData?.rates)} (
                {formatPercent(summary.pnlPercent)})
              </span>
            </div>
          </div>
        ) : undefined
      }
    >
      <div className="p-3">
        {codes.length === 0 ? (
          <p className="rounded-xl border border-border/60 bg-page px-3 py-4 text-xs text-muted">
            Belum ada posisi. Catat kepemilikan dari halaman detail koin melalui
            form Kepemilikan Saya.
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border/60">
            {codes.map((code) => (
              <div key={code} className="border-b border-border/50 last:border-b-0">
                <PortfolioRow code={code} />
              </div>
            ))}
          </div>
        )}
      </div>
    </DrawerShell>
  );
}