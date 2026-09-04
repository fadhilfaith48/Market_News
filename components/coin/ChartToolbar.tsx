"use client";

import { TIMEFRAMES, type Timeframe } from "@/lib/constants";

interface ChartToolbarProps {
  interval: string;
  setInterval: (tf: string) => void;
}

function formatUTCNow(): string {
  const now = new Date();
  return now.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "UTC",
  }) + " UTC";
}

export function ChartToolbar({ interval, setInterval }: ChartToolbarProps) {
  return (
    <div className="flex items-center justify-between border-t border-border px-4 py-2">
      <div className="flex gap-0.5">
        {TIMEFRAMES.map((tf: Timeframe) => (
          <button
            key={tf}
            type="button"
            onClick={() => setInterval(tf)}
            className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
              interval === tf
                ? "bg-interactive text-white"
                : "text-muted hover:bg-hover hover:text-text"
            }`}
          >
            {tf.toUpperCase()}
          </button>
        ))}
      </div>
      <span className="text-xs tabular-nums text-muted">
        {formatUTCNow()}
      </span>
    </div>
  );
}
