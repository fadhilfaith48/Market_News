"use client";

import { useEffect, useRef } from "react";
import {
  AreaSeries,
  CandlestickSeries,
  ColorType,
  HistogramSeries,
  LineSeries,
  createChart,
  type AreaData,
  type CandlestickData,
  type HistogramData,
  type ISeriesApi,
  type LineData,
  type UTCTimestamp,
} from "lightweight-charts";

import { MA_KIND, type ChartType } from "@/lib/constants";
import { movingAveragePoints } from "@/lib/indicators";
import { useUIStore } from "@/store/uiStore";
import type { Kline, LiveKline } from "@/types";

interface PriceChartProps {
  historical: Kline[];
  live: LiveKline | null;
  chartType: ChartType;
  maPeriods: number[];
}

interface ChartHandles {
  setHistorical: () => void;
  setLive: () => void;
  syncMa: () => void;
}

function getCSSVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/** Menambahkan alfa (0–1) pada warna heksadesimal 6 digit. */
function withAlpha(color: string, alpha: number): string {
  const hex = color.replace("#", "");
  if (hex.length !== 6) return color;
  const value = Math.round(Math.max(0, Math.min(1, alpha)) * 255)
    .toString(16)
    .padStart(2, "0");
  return `#${hex}${value}`;
}

function toTime(openTime: number): UTCTimestamp {
  return Math.trunc(openTime / 1000) as UTCTimestamp;
}

function toCandleData(k: Kline | LiveKline): CandlestickData {
  return {
    time: toTime(k.openTime),
    open: k.open,
    high: k.high,
    low: k.low,
    close: k.close,
  };
}

function toLineData(k: Kline | LiveKline): LineData {
  return { time: toTime(k.openTime), value: k.close };
}

function toVolumeData(
  k: Kline | LiveKline,
  upColor: string,
  downColor: string,
): HistogramData {
  return {
    time: toTime(k.openTime),
    value: k.volume,
    color: k.close >= k.open ? upColor : downColor,
  };
}

/**
 * Menggabungkan candle historis dengan candle live terbaru.
 * Bila live candle berada pada candle terakhir yang sama, OHLC & volume
 * digabung (high/low=max/min); bila sudah lewat, live candle ditambahkan.
 */
function mergeCandles(historical: Kline[], live: LiveKline | null): Kline[] {
  if (!live) return historical;
  const list = historical.slice();
  const last = list[list.length - 1];

  if (last && last.openTime === live.openTime) {
    list[list.length - 1] = {
      ...last,
      high: Math.max(last.high, live.high),
      low: Math.min(last.low, live.low),
      close: live.close,
      volume: live.volume,
    };
    return list;
  }

  list.push({
    openTime: live.openTime,
    closeTime: live.closeTime,
    open: live.open,
    high: live.high,
    low: live.low,
    close: live.close,
    volume: live.volume,
  });
  return list;
}

/** Warna overlay moving average — dibedakan per periode. */
function maColor(period: number, warning: string, interactive: string): string {
  if (period <= 10) return warning;
  return interactive;
}

export function PriceChart({
  historical,
  live,
  chartType,
  maPeriods,
}: PriceChartProps) {
  const theme = useUIStore((state) => state.theme);

  const historicalRef = useRef<Kline[]>([]);
  const liveRef = useRef<LiveKline | null>(null);
  const maPeriodsRef = useRef<number[]>(maPeriods);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const maSeriesRef = useRef<Map<number, ISeriesApi<"Line">>>(new Map());
  const handlesRef = useRef<ChartHandles | null>(null);

  useEffect(() => {
    liveRef.current = live;
  }, [live]);

  const isDark = theme === "dark";

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const muted = getCSSVar("--tv-muted") || "#787b86";
    const grid = isDark ? `rgba(120,123,134,0.09)` : `rgba(120,123,134,0.12)`;
    const text = muted || (isDark ? "#d1d4dc" : "#131722");
    const up = getCSSVar("--tv-up") || (isDark ? "#26a69a" : "#089981");
    const down = getCSSVar("--tv-down") || (isDark ? "#ef5350" : "#f23645");
    const interactive =
      getCSSVar("--tv-interactive") || "#2962ff";
    const warning = getCSSVar("--tv-warning") || (isDark ? "#ff9800" : "#f7931a");
    const volumeUp = withAlpha(up, 0.5);
    const volumeDown = withAlpha(down, 0.5);

    const chart = createChart(container, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: text,
        fontFamily:
          "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
      },
      grid: {
        vertLines: { color: grid },
        horzLines: { color: grid },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderVisible: false,
      },
      rightPriceScale: {
        borderVisible: false,
        scaleMargins: { top: 0.08, bottom: 0.24 },
      },
      crosshair: {
        mode: 0,
      },
    });

    // ── Series harga utama (hanya satu aktif sesuai chartType) ──
    const priceData = (klines: Kline[]): CandlestickData[] =>
      klines.map(toCandleData);
    const priceLineData = (klines: Kline[]): LineData[] =>
      klines.map(toLineData);

    let setPriceHistorical: (klines: Kline[]) => void;
    let updatePriceLive: (klines: Kline[]) => void;

    if (chartType === "candle") {
      const series = chart.addSeries(CandlestickSeries, {
        upColor: up,
        downColor: down,
        borderUpColor: up,
        borderDownColor: down,
        wickUpColor: up,
        wickDownColor: down,
      });
      setPriceHistorical = (klines) => series.setData(priceData(klines));
      updatePriceLive = (klines) => {
        const last = klines[klines.length - 1];
        if (last) series.update(toCandleData(last));
      };
    } else if (chartType === "line") {
      const series = chart.addSeries(LineSeries, {
        color: interactive,
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: true,
      });
      setPriceHistorical = (klines) => series.setData(priceLineData(klines));
      updatePriceLive = (klines) => {
        const last = klines[klines.length - 1];
        if (last) series.update(toLineData(last));
      };
    } else {
      const series = chart.addSeries(AreaSeries, {
        lineColor: interactive,
        topColor: withAlpha(interactive, 0.28),
        bottomColor: withAlpha(interactive, 0.02),
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: true,
      });
      setPriceHistorical = (klines) =>
        series.setData(priceLineData(klines) as AreaData[]);
      updatePriceLive = (klines) => {
        const last = klines[klines.length - 1];
        if (last) series.update(toLineData(last));
      };
    }

    // ── Series volume (price scale terpisah, di bawah chart) ──
    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceScaleId: "volume",
      priceFormat: { type: "volume" },
      priceLineVisible: false,
      lastValueVisible: false,
    });
    chart.priceScale("volume").applyOptions({
      visible: false,
      scaleMargins: { top: 0.82, bottom: 0 },
    });

    const setVolumeHistorical = (klines: Kline[]) => {
      volumeSeries.setData(
        klines.map((k) => toVolumeData(k, volumeUp, volumeDown)),
      );
    };
    const updateVolumeLive = (klines: Kline[]) => {
      const last = klines[klines.length - 1];
      if (last) volumeSeries.update(toVolumeData(last, volumeUp, volumeDown));
    };

    // ── Overlay moving average ──
    const refreshMa = (mode: "set" | "update") => {
      const merged = mergeCandles(historicalRef.current, liveRef.current);
      const closes = merged.map((k) => ({ time: k.openTime, close: k.close }));
      for (const period of maPeriodsRef.current) {
        const series = maSeriesRef.current.get(period);
        if (!series) continue;
        const points = movingAveragePoints(closes, period, MA_KIND);
        if (mode === "set") {
          series.setData(
            points.map((point) => ({
              time: point.time as UTCTimestamp,
              value: point.value,
            })),
          );
        } else {
          const last = points[points.length - 1];
          if (last) {
            series.update({
              time: last.time as UTCTimestamp,
              value: last.value,
            });
          }
        }
      }
    };

    const syncMa = () => {
      for (const period of maPeriodsRef.current) {
        if (maSeriesRef.current.has(period)) continue;
        const series = chart.addSeries(LineSeries, {
          color: maColor(period, warning, interactive),
          lineWidth: 2,
          priceLineVisible: false,
          lastValueVisible: false,
          crosshairMarkerVisible: false,
        });
        maSeriesRef.current.set(period, series);
      }
      for (const [period, series] of maSeriesRef.current) {
        if (maPeriodsRef.current.includes(period)) continue;
        chart.removeSeries(series);
        maSeriesRef.current.delete(period);
      }
      refreshMa("set");
    };

    const handles: ChartHandles = {
      setHistorical: () => {
        const klines = historicalRef.current;
        setPriceHistorical(klines);
        setVolumeHistorical(klines);
        refreshMa("set");
        if (klines.length > 0) chart.timeScale().fitContent();
      },
      setLive: () => {
        const merged = mergeCandles(historicalRef.current, liveRef.current);
        updatePriceLive(merged);
        updateVolumeLive(merged);
        refreshMa("update");
      },
      syncMa,
    };

    handlesRef.current = handles;

    // Terapkan data awal + overlay MA sesuai periode yang aktif.
    const initial = historicalRef.current;
    setPriceHistorical(initial);
    setVolumeHistorical(initial);
    syncMa();
    if (initial.length > 0) chart.timeScale().fitContent();

    const maSeries = maSeriesRef.current;

    return () => {
      handlesRef.current = null;
      maSeries.clear();
      chart.remove();
    };
  }, [isDark, chartType]);

  useEffect(() => {
    historicalRef.current = historical;
    handlesRef.current?.setHistorical();
  }, [historical]);

  useEffect(() => {
    liveRef.current = live;
    handlesRef.current?.setLive();
  }, [live]);

  useEffect(() => {
    maPeriodsRef.current = maPeriods;
    handlesRef.current?.syncMa();
  }, [maPeriods]);

  return <div ref={containerRef} className="h-[420px] w-full sm:h-[500px]" />;
}
