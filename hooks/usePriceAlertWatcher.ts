"use client";

import { useEffect } from "react";

import { evaluateAlerts, isNotificationGranted } from "@/lib/alerts";
import type { PriceAlert } from "@/lib/alerts";
import { formatPrice } from "@/lib/format";
import { useAlertStore } from "@/store/alertStore";
import { useMarketStore } from "@/store/marketStore";

function showNotification(alert: PriceAlert, price: number | undefined): void {
  if (!isNotificationGranted()) return;
  const priceText = price === undefined ? "-" : formatPrice(price);
  const verb = alert.direction === "above" ? "naik melewati" : "turun menembus";
  try {
    new Notification(`${alert.code} ${verb} ${formatPrice(alert.targetPrice)}`, {
      body: `Harga sekarang: ${priceText}`,
    });
  } catch {
    // Konteks browser yang tidak mengizinkan — abaikan.
  }
}

export function usePriceAlertWatcher() {
  useEffect(() => {
    return useMarketStore.subscribe((state, prevState) => {
      if (state.tickers === prevState.tickers) return;
      const triggered = evaluateAlerts(
        useAlertStore.getState().alerts,
        state.tickers,
        state.previousLastPrice,
      );
      if (triggered.length === 0) return;
      const { markTriggered } = useAlertStore.getState();
      for (const alert of triggered) {
        markTriggered(alert.id);
        showNotification(alert, state.tickers[alert.symbol]?.lastPrice);
      }
    });
  }, []);
}