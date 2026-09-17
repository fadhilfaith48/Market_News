import { NextResponse } from "next/server";

import { BINANCE_MARKET_DATA_BASE, DEFAULT_SYMBOLS } from "@/lib/constants";
import { parseTickersRest } from "@/lib/binance/ws";
import type { RawTickerRest } from "@/lib/binance/ws";

const FETCH_TIMEOUT_MS = 6_000;

export async function GET() {
  const params = new URLSearchParams({
    symbols: JSON.stringify([...DEFAULT_SYMBOLS]),
  });
  const url = `${BINANCE_MARKET_DATA_BASE}/api/v3/ticker/24hr?${params}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      next: { revalidate: 5 },
      signal: controller.signal,
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Binance ticker API error" },
        { status: 502 },
      );
    }

    const data = (await res.json()) as unknown;

    if (!Array.isArray(data)) {
      return NextResponse.json(
        { error: "Unexpected response from Binance" },
        { status: 502 },
      );
    }

    return NextResponse.json({ tickers: parseTickersRest(data as RawTickerRest[]) });
  } catch {
    return NextResponse.json(
      { error: "Gagal mengambil data ticker" },
      { status: 500 },
    );
  } finally {
    clearTimeout(timeout);
  }
}