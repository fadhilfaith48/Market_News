"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { getAlertSymbol } from "@/lib/alerts";
import type { AlertDirection, PriceAlert } from "@/lib/alerts";
import { ALERT_STORAGE_KEY, VALID_CODES } from "@/lib/constants";

export const MAX_ALERTS = 20;

export interface NewAlert {
  code: string;
  targetPrice: number;
  direction: AlertDirection;
}

function makeId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function isValidTarget(targetPrice: number): boolean {
  return Number.isFinite(targetPrice) && targetPrice > 0;
}

export function sanitizeAlerts(alerts: unknown): PriceAlert[] {
  if (!Array.isArray(alerts)) return [];
  const result: PriceAlert[] = [];
  for (const item of alerts) {
    if (!item || typeof item !== "object") continue;
    const alert = item as Record<string, unknown>;
    const { id, code, symbol, targetPrice, direction, createdAt, triggeredAt } =
      alert;
    if (typeof id !== "string") continue;
    if (typeof code !== "string" || !VALID_CODES.has(code)) continue;
    if (typeof symbol !== "string" || symbol !== getAlertSymbol(code)) continue;
    if (typeof targetPrice !== "number" || !isValidTarget(targetPrice)) continue;
    if (direction !== "above" && direction !== "below") continue;
    if (typeof createdAt !== "number" || !Number.isFinite(createdAt)) continue;
    const alertTriggeredAt =
      typeof triggeredAt === "number" && Number.isFinite(triggeredAt)
        ? triggeredAt
        : null;
    result.push({
      id,
      code,
      symbol,
      targetPrice,
      direction,
      createdAt,
      triggeredAt: alertTriggeredAt,
    });
    if (result.length >= MAX_ALERTS) break;
  }
  return result;
}

interface AlertState {
  alerts: PriceAlert[];
  add: (input: NewAlert) => PriceAlert | null;
  remove: (id: string) => void;
  markTriggered: (id: string) => void;
}

export const useAlertStore = create<AlertState>()(
  persist(
    (set, get) => ({
      alerts: [],
      add: ({ code, targetPrice, direction }) => {
        if (!VALID_CODES.has(code)) return null;
        if (!isValidTarget(targetPrice)) return null;
        const { alerts } = get();
        const duplicate = alerts.find(
          (alert) =>
            alert.triggeredAt === null &&
            alert.code === code &&
            alert.direction === direction &&
            alert.targetPrice === targetPrice,
        );
        if (duplicate) return duplicate;
        if (alerts.length >= MAX_ALERTS) return null;
        const alert: PriceAlert = {
          id: makeId(),
          code,
          symbol: getAlertSymbol(code),
          targetPrice,
          direction,
          createdAt: Date.now(),
          triggeredAt: null,
        };
        set({ alerts: [...alerts, alert] });
        return alert;
      },
      remove: (id) =>
        set((state) => ({
          alerts: state.alerts.filter((alert) => alert.id !== id),
        })),
      markTriggered: (id) =>
        set((state) => ({
          alerts: state.alerts.map((alert) =>
            alert.id === id && alert.triggeredAt === null
              ? { ...alert, triggeredAt: Date.now() }
              : alert,
          ),
        })),
    }),
    {
      name: ALERT_STORAGE_KEY,
      merge: (persisted, current) => {
        const persistedState = persisted as Partial<AlertState> | undefined;
        return {
          ...current,
          ...persistedState,
          alerts: sanitizeAlerts(persistedState?.alerts),
        };
      },
    },
  ),
);