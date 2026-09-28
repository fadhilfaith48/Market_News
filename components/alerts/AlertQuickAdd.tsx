"use client";

import { useState } from "react";

import { formatPrice } from "@/lib/format";
import { getSymbol } from "@/lib/portfolio";
import { useMarketStore } from "@/store/marketStore";
import { useAlertStore } from "@/store/alertStore";
import type { AlertDirection } from "@/lib/alerts";

export function AlertQuickAdd({ code }: { code: string }) {
  const add = useAlertStore((state) => state.add);
  const ticker = useMarketStore((state) => state.tickers[getSymbol(code)]);
  const [message, setMessage] = useState<string | null>(null);

  if (!ticker) return null;

  const quickAdd = (direction: AlertDirection) => {
    const target =
      direction === "above"
        ? ticker.lastPrice * 1.01
        : ticker.lastPrice * 0.99;
    const created = add({ code, targetPrice: target, direction });
    setMessage(
      created
        ? `Alert aktif: ${formatPrice(target)} (${direction === "above" ? "▲" : "▼"})`
        : "Gagal: duplikat atau sudah 20 alert.",
    );
  };

  return (
    <div className="space-y-2 border-t border-border pt-3">
      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted">
        Beri Alert Harga
      </h3>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => quickAdd("above")}
          className="flex-1 cursor-pointer rounded-md border border-border px-3 py-1.5 text-xs font-medium text-up transition-colors hover:bg-hover"
        >
          ▲ +1%
        </button>
        <button
          type="button"
          onClick={() => quickAdd("below")}
          className="flex-1 cursor-pointer rounded-md border border-border px-3 py-1.5 text-xs font-medium text-down transition-colors hover:bg-hover"
        >
          ▼ −1%
        </button>
      </div>
      {message && <p className="text-[11px] tabular-nums">{message}</p>}
    </div>
  );
}