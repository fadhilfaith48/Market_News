"use client";

import { formatTime } from "@/lib/format";
import { useMarketStore } from "@/store/marketStore";

export function Footer() {
  const lastUpdate = useMarketStore((state) => state.lastUpdate);

  return (
    <footer className="border-t border-border">
      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-3 px-4 py-5 text-xs text-muted sm:grid-cols-2 md:grid-cols-3">
        <div>
          <div className="mb-1 text-sm font-semibold text-text">
            Market News — Crypto
          </div>
          <div>
            Kehadiran pasar cryptocurrency populer dengan harga real-time.
          </div>
        </div>
        <div>
          <div className="mb-1 font-semibold text-text">Sumber Data</div>
          <div>Harga & grafik real-time dari Binance WebSocket.</div>
        </div>
        <div>
          <div className="mb-1 font-semibold text-text">Disclaimer</div>
          <div>
            Informasi bersifat informatif, bukan saran keuangan atau ajakan
            investasi.
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-4xl flex items-center justify-between gap-3 border-t border-border px-4 py-2.5 text-[11px] text-muted">
        <span>© 2026 Market News</span>
        <span className="tabular-nums">
          Terakhir diperbarui: {lastUpdate ? formatTime(lastUpdate) : "—"}
        </span>
      </div>
    </footer>
  );
}