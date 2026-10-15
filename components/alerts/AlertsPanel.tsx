"use client";

import { useState } from "react";

import { CoinIcon } from "@/components/ui/CoinIcon";
import { DrawerShell } from "@/components/ui/DrawerShell";
import { DEFAULT_SYMBOLS } from "@/lib/constants";
import { getCoinMeta } from "@/lib/coinMeta";
import { formatPrice } from "@/lib/format";
import { requestNotificationPermission } from "@/lib/alerts";
import type { AlertDirection, PriceAlert } from "@/lib/alerts";
import { useAlertStore } from "@/store/alertStore";
import { useUIStore } from "@/store/uiStore";

function AlertRow({ alert }: { alert: PriceAlert }) {
  const remove = useAlertStore((state) => state.remove);
  const { name } = getCoinMeta(alert.symbol);
  const active = alert.triggeredAt === null;

  return (
    <div className="flex w-full items-center gap-2 px-3 py-2">
      <CoinIcon symbol={alert.symbol} size={18} />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="text-sm font-medium">{alert.code}</span>
          <span
            className={`text-[10px] ${
              alert.direction === "above" ? "text-up" : "text-down"
            }`}
          >
            {alert.direction === "above" ? "▲ melewati" : "▼ menembus"}
            <span className="text-muted"> {formatPrice(alert.targetPrice)}</span>
          </span>
        </span>
        <span className="block truncate text-[11px] text-muted">{name}</span>
      </span>
      <span
        className={`pill flex-none ${
          active ? "bg-interactive text-white" : "text-muted"
        }`}
      >
        {active ? "Aktif" : "Trigger"}
      </span>
      <button
        type="button"
        aria-label={`Hapus alert ${alert.code}`}
        onClick={() => remove(alert.id)}
        className="btn-ghost size-7 justify-center p-0 focus-ring"
      >
        ✕
      </button>
    </div>
  );
}

export function AlertsPanel() {
  const open = useUIStore((state) => state.alertsOpen);
  const close = useUIStore((state) => state.setAlertsOpen);
  const alerts = useAlertStore((state) => state.alerts);
  const add = useAlertStore((state) => state.add);

  const [code, setCode] = useState("BTC");
  const [direction, setDirection] = useState<AlertDirection>("above");
  const [target, setTarget] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const codes = [...DEFAULT_SYMBOLS].map((symbol) => getCoinMeta(symbol).code);

  const submit = () => {
    const value = parseFloat(target);
    if (target.trim() === "" || !Number.isFinite(value) || value <= 0) {
      setMessage("Masukkan target harga yang valid.");
      return;
    }
    const created = add({ code, targetPrice: value, direction });
    if (created) {
      setTarget("");
      setMessage(null);
    } else {
      setMessage("Tidak bisa menambah: duplikat atau sudah 20 alert.");
    }
  };

  const notificationAvailable =
    typeof window !== "undefined" &&
    "Notification" in window &&
    Notification.permission === "default";

  return (
    <DrawerShell
      open={open}
      title="Harga Alert"
      ariaLabel="Harga Alert"
      onClose={() => close(false)}
    >
      <div className="space-y-2 border-b border-border px-3 py-3">
        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="mb-1 block text-[10px] uppercase tracking-wide text-muted">
              Koin
            </span>
            <select
              value={code}
              onChange={(event) => setCode(event.target.value)}
              className="w-full rounded-lg border border-border bg-page px-2.5 py-1.5 text-sm outline-none transition-colors focus-ring"
            >
              {codes.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-[10px] uppercase tracking-wide text-muted">
              Arah
            </span>
            <select
              value={direction}
              onChange={(event) =>
                setDirection(event.target.value as AlertDirection)
              }
              className="w-full rounded-lg border border-border bg-page px-2.5 py-1.5 text-sm outline-none transition-colors focus-ring"
            >
              <option value="above">Naik melewati ▲</option>
              <option value="below">Turun menembus ▼</option>
            </select>
          </label>
        </div>
        <label className="block">
          <span className="mb-1 block text-[10px] uppercase tracking-wide text-muted">
            Target Harga (USD)
          </span>
          <input
            type="number"
            min="0"
            step="any"
            value={target}
            onChange={(event) => setTarget(event.target.value)}
            placeholder="0"
            className="w-full rounded-lg border border-border bg-page px-2.5 py-1.5 text-sm tabular-nums outline-none transition-colors focus-ring"
          />
        </label>
        <button
          type="button"
          onClick={submit}
          className="btn-ghost focus-ring w-full justify-center"
        >
          Tambah Alert
        </button>
        {message && <p className="text-[11px] text-warning">{message}</p>}
        {notificationAvailable && (
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] text-muted">
              Izinkan notifikasi browser agar alert muncul sebagai pemberitahuan.
            </p>
            <button
              type="button"
              onClick={() => void requestNotificationPermission()}
              className="btn-ghost focus-ring flex-none px-2.5 py-1.5 text-[11px]"
            >
              Izinkan
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {alerts.length === 0 ? (
          <p className="rounded-xl border border-border/60 bg-page px-3 py-4 text-xs text-muted">
            Belum ada alert. Tambahkan target harga di atas atau dari tombol
            &quot;Beri Alert&quot; di halaman koin.
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border/60">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="border-b border-border/50 last:border-b-0"
              >
                <AlertRow alert={alert} />
              </div>
            ))}
          </div>
        )}
      </div>
    </DrawerShell>
  );
}