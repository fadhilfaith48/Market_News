"use client";

import { useState } from "react";

import {
  formatCompact,
  formatCurrency,
  formatPercent,
} from "@/lib/format";
import type { SupportedCurrency } from "@/lib/format";
import { toneText } from "@/lib/market";
import { computePosition, getSymbol } from "@/lib/portfolio";
import { useFiatRates } from "@/hooks/useFiatRates";
import { useToast } from "@/hooks/useToast";
import { useMarketStore } from "@/store/marketStore";
import { usePortfolioStore } from "@/store/portfolioStore";
import { useUIStore } from "@/store/uiStore";

export function HoldingEditor({ code }: { code: string }) {
  const holding = usePortfolioStore((state) => state.holdings[code]) ?? null;
  const upsert = usePortfolioStore((state) => state.upsert);
  const remove = usePortfolioStore((state) => state.remove);
  const ticker = useMarketStore((state) => state.tickers[getSymbol(code)]);
  const currency = useUIStore((state) => state.currency) as SupportedCurrency;
  const { data: rateData } = useFiatRates();
  const toast = useToast();

  const [qty, setQty] = useState(holding ? String(holding.qty) : "");
  const [avgCost, setAvgCost] = useState(holding ? String(holding.avgCost) : "");

  const position = holding
    ? computePosition(code, holding, ticker?.lastPrice)
    : null;
  const qtyNumber = parseFloat(qty);
  const costNumber = parseFloat(avgCost);
  const valid =
    qty.trim() !== "" &&
    avgCost.trim() !== "" &&
    Number.isFinite(qtyNumber) &&
    Number.isFinite(costNumber) &&
    qtyNumber >= 0 &&
    costNumber >= 0;

  return (
    <div className="space-y-3">
      <h3 className="section-title">Kepemilikan Saya</h3>

      {position && (
        <div className="space-y-0.5 rounded-xl border border-border/60 bg-page px-3 py-2 text-xs tabular-nums">
          <div className="flex items-center justify-between">
            <span className="text-muted">Jumlah</span>
            <span>{formatCompact(holding.qty)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted">Nilai</span>
            <span>
              {formatCurrency(position.currentValue, currency, rateData?.rates)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted">P/L</span>
            <span className={toneText(position.pnl)}>
              {formatCurrency(position.pnl, currency, rateData?.rates)} (
              {formatPercent(position.pnlPercent)})
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className="mb-1 block text-[10px] uppercase tracking-wide text-muted">
            Jumlah
          </span>
          <input
            type="number"
            min="0"
            step="any"
            value={qty}
            onChange={(event) => setQty(event.target.value)}
            placeholder="0"
            className="w-full rounded-lg border border-border bg-page px-2.5 py-1.5 text-sm tabular-nums outline-none transition-colors focus-ring"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-[10px] uppercase tracking-wide text-muted">
            Harga Beli
          </span>
          <input
            type="number"
            min="0"
            step="any"
            value={avgCost}
            onChange={(event) => setAvgCost(event.target.value)}
            placeholder="0"
            className="w-full rounded-lg border border-border bg-page px-2.5 py-1.5 text-sm tabular-nums outline-none transition-colors focus-ring"
          />
        </label>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            if (!valid) return;
            upsert(code, qtyNumber, costNumber);
            toast("success", "Posisi tersimpan", `${code} · ${formatCompact(qtyNumber)} @ ${formatCurrency(costNumber, currency, rateData?.rates)}`);
          }}
          disabled={!valid}
          className="btn-ghost focus-ring px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Simpan
        </button>
        {holding && (
          <button
            type="button"
            onClick={() => {
              remove(code);
              setQty("");
              setAvgCost("");
              toast("info", "Posisi dihapus", code);
            }}
            className="btn-ghost focus-ring px-3 py-1.5"
          >
            Hapus
          </button>
        )}
      </div>
    </div>
  );
}