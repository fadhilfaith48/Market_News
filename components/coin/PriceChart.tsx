"use client";

import { useEffect, useRef } from "react";
import {
  CandlestickSeries,
  ColorType,
  createChart,
  type CandlestickData,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from "lightweight-charts";

import { useUIStore } from "@/store/uiStore";
import type { Kline, LiveKline } from "@/types";

interface PriceChartProps {
  historical: Kline[];
  live: LiveKline | null;
}

function toCandleData(k: Kline | LiveKline): CandlestickData {
  return {
    time: Math.trunc(k.openTime / 1000) as UTCTimestamp,
    open: k.open,
    high: k.high,
    low: k.low,
    close: k.close,
  };
}

function mergeCandle(
  prev: CandlestickData,
  next: CandlestickData,
): CandlestickData {
  return {
    time: next.time,
    open: prev.open,
    high: Math.max(prev.high, next.high),
    low: Math.min(prev.low, next.low),
    close: next.close,
  };
}

export function PriceChart({ historical, live }: PriceChartProps) {
  const theme = useUIStore((state) => state.theme);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const dataRef = useRef<CandlestickData[]>([]);
  const liveRef = useRef<LiveKline | null>(null);

  useEffect(() => {
    liveRef.current = live;
  }, [live]);

  const isDark = theme === "dark";

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const border = isDark ? "#3f3f46" : "#d4d4d8";
    const grid = isDark ? "rgba(113,113,122,0.14)" : "rgba(113,113,122,0.16)";
    const text = isDark ? "#a1a1aa" : "#52525b";

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
        borderColor: border,
      },
      rightPriceScale: {
        borderColor: border,
        scaleMargins: { top: 0.1, bottom: 0.2 },
      },
      crosshair: {
        mode: 0,
      },
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#16a34a",
      downColor: "#dc2626",
      borderUpColor: "#16a34a",
      borderDownColor: "#dc2626",
      wickUpColor: "#16a34a",
      wickDownColor: "#dc2626",
    });

    chartRef.current = chart;
    seriesRef.current = series;

    if (dataRef.current.length > 0) {
      series.setData(dataRef.current);
      chart.timeScale().fitContent();
    }

    const pendingLive = liveRef.current;
    if (pendingLive && dataRef.current.length > 0) {
      const liveData = toCandleData(pendingLive);
      const last = dataRef.current[dataRef.current.length - 1];
      const merged =
        last && last.time === liveData.time
          ? mergeCandle(last, liveData)
          : liveData;
      dataRef.current[dataRef.current.length - 1] = merged;
      series.update(merged);
    }

    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [isDark]);

  useEffect(() => {
    const series = seriesRef.current;
    if (!series) return;

    dataRef.current = historical.map(toCandleData);
    series.setData(dataRef.current);
    if (dataRef.current.length > 0) {
      chartRef.current?.timeScale().fitContent();
    }
  }, [historical]);

  useEffect(() => {
    const series = seriesRef.current;
    if (!series || !live) return;

    const liveData = toCandleData(live);
    const data = dataRef.current;
    const last = data[data.length - 1];
    const merged =
      last && last.time === liveData.time
        ? mergeCandle(last, liveData)
        : liveData;

    if (last && last.time === liveData.time) {
      data[data.length - 1] = merged;
    } else {
      data.push(liveData);
      if (data.length > 1000) data.shift();
    }
    series.update(merged);
  }, [live]);

  return <div ref={containerRef} className="h-96 w-full" />;
}