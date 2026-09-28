import type { TickerWS } from "@/types";

export type AlertDirection = "above" | "below";

export interface PriceAlert {
  id: string;
  code: string;
  symbol: string;
  targetPrice: number;
  direction: AlertDirection;
  createdAt: number;
  triggeredAt: number | null;
}

export function getAlertSymbol(code: string): string {
  return `${code}USDT`;
}

export function evaluateAlerts(
  alerts: PriceAlert[],
  tickers: Record<string, Pick<TickerWS, "lastPrice">>,
  previousLastPrice: Record<string, number>,
): PriceAlert[] {
  const triggered: PriceAlert[] = [];
  for (const alert of alerts) {
    if (alert.triggeredAt !== null) continue;
    const last = Number(tickers[alert.symbol]?.lastPrice);
    const prev = previousLastPrice[alert.symbol];
    if (!Number.isFinite(last) || prev === undefined) continue;
    const crossed =
      alert.direction === "above"
        ? prev < alert.targetPrice && last >= alert.targetPrice
        : prev > alert.targetPrice && last <= alert.targetPrice;
    if (crossed) triggered.push(alert);
  }
  return triggered;
}

export function isNotificationGranted(): boolean {
  return (
    typeof window !== "undefined" &&
    "Notification" in window &&
    Notification.permission === "granted"
  );
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "denied";
  }
  const permission = Notification.permission;
  if (permission === "granted" || permission === "denied") return permission;
  return Notification.requestPermission();
}