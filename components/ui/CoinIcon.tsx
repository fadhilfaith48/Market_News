"use client";

import { useState } from "react";

import { getCoinMeta } from "@/lib/coinMeta";

const FALLBACK_BG = [
  "bg-zinc-400",
  "bg-sky-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-violet-500",
  "bg-rose-500",
];

const DEFAULT_SIZE = 24;

function fallbackColor(seed: string): string {
  let hash = 0;
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return FALLBACK_BG[Math.abs(hash) % FALLBACK_BG.length];
}

export function CoinIcon({
  symbol,
  size = DEFAULT_SIZE,
}: {
  symbol: string;
  size?: number;
}) {
  const { code, logo } = getCoinMeta(symbol);
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span
        aria-label={code}
        style={{ width: size, height: size }}
        className={`inline-flex shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${fallbackColor(code)}`}
      >
        {code.slice(0, 1)}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logo}
      alt={code}
      width={size}
      height={size}
      loading="lazy"
      onError={() => setFailed(true)}
      className="shrink-0 rounded-full"
    />
  );
}