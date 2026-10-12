"use client";

import { useFearGreed } from "@/hooks/useFearGreed";

function rangeOf(value: number): { label: string; fill: string } {
  if (value <= 25) return { label: "Sangat Takut", fill: "bg-down" };
  if (value <= 45) return { label: "Takut", fill: "bg-warning" };
  if (value <= 55) return { label: "Netral", fill: "bg-flat" };
  if (value <= 75) return { label: "Serakah", fill: "bg-up" };
  return { label: "Sangat Serakah", fill: "bg-up" };
}

export function FearGreedGauge() {
  const { data } = useFearGreed();
  const range = data?.value != null ? rangeOf(data.value) : null;

  return (
    <section
      aria-label="Fear & Greed Index"
      className="rounded border border-border"
    >
      <div className="border-b border-border px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted">
        Fear &amp; Greed
      </div>
      {data?.value == null ? (
        <p className="p-3 text-xs text-muted">
          Indeks sedang dimuat / belum tersedia.
        </p>
      ) : (
        <div className="p-3">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-2xl font-bold tabular-nums">{data.value}</span>
            <span className="text-sm font-medium text-muted">
              {data.classification}
            </span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-border">
            <div
              className={`h-full rounded-full ${range?.fill}`}
              style={{
                width: `${Math.min(100, Math.max(0, data.value))}%`,
              }}
            />
          </div>
          <p className="mt-2 text-[10px] text-muted">
            {range?.label} · 0 = sangat takut · 100 = sangat serakah
          </p>
        </div>
      )}
    </section>
  );
}