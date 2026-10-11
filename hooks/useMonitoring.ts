"use client";

import { useEffect } from "react";

import { captureErrorContext, errorToEntry } from "@/lib/monitoring";
import { useMonitoringStore } from "@/store/monitoringStore";
import { useUIStore } from "@/store/uiStore";

export function useMonitoring() {
  useEffect(() => {
    const store = useMonitoringStore.getState();

    store.add(
      "info",
      "app",
      "Aplikasi dimulai",
      captureErrorContext(`dataSource=${useUIStore.getState().dataSource}`),
    );

    const onError = (event: ErrorEvent) => {
      store.addEntry(
        errorToEntry(
          "window.onerror",
          event.error ?? event.message,
          `source=${event.filename}:${event.lineno}:${event.colno}`,
        ),
      );
    };

    const onRejection = (event: PromiseRejectionEvent) => {
      store.addEntry(
        errorToEntry(
          "unhandledrejection",
          event.reason,
          `dataSource=${useUIStore.getState().dataSource}`,
        ),
      );
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);

    const observers: PerformanceObserver[] = [];
    let largestPaint = 0;
    let cumulativeShift = 0;
    let flushed = false;

    const observe = (
      type: string,
      onEntries: (entries: PerformanceEntryList) => void,
    ) => {
      try {
        const observer = new PerformanceObserver((list) =>
          onEntries(list.getEntries()),
        );
        observer.observe({ type, buffered: true } as PerformanceObserverInit);
        observers.push(observer);
      } catch {
        // tipe entry tidak didukung browser ini — lewati
      }
    };

    const flushPerf = () => {
      if (flushed) return;
      flushed = true;
      if (largestPaint > 0) {
        store.add("info", "perf", "LCP", `${Math.round(largestPaint)} ms`);
      }
      if (cumulativeShift > 0) {
        store.add("info", "perf", "CLS", cumulativeShift.toFixed(4));
      }
    };

    if (typeof PerformanceObserver !== "undefined") {
      observe("paint", (entries) => {
        for (const entry of entries) {
          store.add("info", "perf", entry.name, `${Math.round(entry.startTime)} ms`);
        }
      });
      observe("largest-contentful-paint", (entries) => {
        const last = entries[entries.length - 1];
        if (last && last.startTime > largestPaint) largestPaint = last.startTime;
      });
      observe("layout-shift", (entries) => {
        for (const item of entries) {
          const shift = item as PerformanceEntry & {
            value?: number;
            hadRecentInput?: boolean;
          };
          if (!shift.hadRecentInput && typeof shift.value === "number") {
            cumulativeShift += shift.value;
          }
        }
      });

      window.addEventListener("load", flushPerf, { once: true });
    }

    const timer = window.setTimeout(flushPerf, 3000);

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") flushPerf();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
      window.removeEventListener("load", flushPerf);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.clearTimeout(timer);
      for (const observer of observers) observer.disconnect();
    };
  }, []);
}
