"use client";

import { useFearGreed } from "@/hooks/useFearGreed";

function rangeOf(value: number): { label: string; fill: string; text: string } {
  if (value <= 25)
    return { label: "Sangat Takut", fill: "bg-down", text: "text-down" };
  if (value <= 45)
    return { label: "Takut", fill: "bg-warning", text: "text-warning" };
  if (value <= 55)
    return { label: "Netral", fill: "bg-flat", text: "text-muted" };
  if (value <= 75)
    return { label: "Serakah", fill: "bg-up", text: "text-up" };
  return { label: "Sangat Serakah", fill: "bg-up", text: "text-up" };
}

export function FearGreedGauge() {
  const { data } = useFearGreed();
  const range = data?.value != null ? rangeOf(data.value) : null;
  const pct = data?.value != null ? Math.min(100, Math.max(0, data.value)) : 0;

  return (
    <section aria-label="Fear & Greed Index" className="card p-3">
      <h3 className="section-title">Fear &amp; Greed</h3>
      {data?.value == null ? (
        <p className="text-xs text-muted">
          Indeks sedang dimuat / belum tersedia.
        </p>
      ) : (
        <div>
          <div className="flex items-baseline justify-between gap-2">
            <span
              className={`text-3xl font-bold tabular-nums ${range?.text}`}
            >
              {data.value}
            </span>
            <span className="pill bg-hover text-muted">{range?.label}</span>
          </div>
          <div className="relative mt-3 h-2 w-full rounded-full">
            <div
              className="absolute inset-0 rounded-full opacity-40"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, var(--tv-down), var(--tv-warning), var(--tv-flat), var(--tv-up))",
              }}
            />
            <span
              className={`absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-panel ${range?.fill}`}
              style={{ left: `${pct}%` }}
            />
          </div>
          <p className="mt-3 text-[10px] text-muted">
            0 = sangat takut · 100 = sangat serakah
          </p>
        </div>
      )}
    </section>
  );
}