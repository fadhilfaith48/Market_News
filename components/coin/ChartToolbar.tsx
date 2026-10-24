"use client";

import { CHART_TYPES, MA_PERIODS, TIMEFRAMES, type ChartType, type Timeframe } from "@/lib/constants";

interface ChartToolbarProps {
  interval: string;
  setInterval: (tf: string) => void;
  chartType: ChartType;
  setChartType: (type: ChartType) => void;
  maPeriods: number[];
  toggleMa: (period: number) => void;
}

const CHART_TYPE_LABEL: Record<ChartType, string> = {
  candle: "Candle",
  line: "Line",
  area: "Area",
};

function formatUTCNow(): string {
  const now = new Date();
  return (
    now.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "UTC",
    }) + " UTC"
  );
}

export function ChartToolbar({
  interval,
  setInterval,
  chartType,
  setChartType,
  maPeriods,
  toggleMa,
}: ChartToolbarProps) {
  return (
    <div className="flex flex-col gap-2 border-t border-border/60 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
      {/* Tipe grafik + indikator moving average */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-0.5 rounded-full bg-hover p-0.5">
          {CHART_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setChartType(type)}
              aria-pressed={chartType === type}
              className={`inline-flex min-h-8 items-center justify-center rounded-full px-2.5 py-1 text-xs font-medium transition-colors focus-ring ${
                chartType === type
                  ? "bg-interactive text-white shadow-card"
                  : "text-muted hover:text-text"
              }`}
            >
              {CHART_TYPE_LABEL[type]}
            </button>
          ))}
        </div>
        <div className="flex gap-0.5 rounded-full bg-hover p-0.5">
          {MA_PERIODS.map((period) => {
            const active = maPeriods.includes(period);
            return (
              <button
                key={period}
                type="button"
                onClick={() => toggleMa(period)}
                aria-pressed={active}
                className={`inline-flex min-h-8 items-center justify-center rounded-full px-2.5 py-1 text-xs font-medium transition-colors focus-ring ${
                  active
                    ? "bg-interactive text-white shadow-card"
                    : "text-muted hover:text-text"
                }`}
              >
                MA{period}
              </button>
            );
          })}
        </div>
      </div>

      {/* Timeframe + jam UTC */}
      <div className="flex items-center justify-between gap-2 sm:justify-end">
        <div className="flex gap-0.5 overflow-x-auto rounded-full bg-hover p-0.5">
          {TIMEFRAMES.map((tf: Timeframe) => (
            <button
              key={tf}
              type="button"
              onClick={() => setInterval(tf)}
              className={`inline-flex min-h-8 items-center justify-center rounded-full px-2.5 py-1 text-xs font-medium transition-colors focus-ring ${
                interval === tf
                  ? "bg-interactive text-white shadow-card"
                  : "text-muted hover:text-text"
              }`}
            >
              {tf.toUpperCase()}
            </button>
          ))}
        </div>
        <span className="flex-none text-xs tabular-nums text-muted">
          {formatUTCNow()}
        </span>
      </div>
    </div>
  );
}
