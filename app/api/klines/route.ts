import { BINANCE_MARKET_DATA_BASE, KLINE_LIMIT, TIMEFRAMES } from "@/lib/constants";
import type { Kline } from "@/types";

type RawKlineRow = [
  number,
  string,
  string,
  string,
  string,
  string,
  number,
  string,
  number,
  string,
  string,
  string,
];

const KLINE_REVALIDATE_SECONDS = 60;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = (searchParams.get("symbol") ?? "").toUpperCase();
  const interval = searchParams.get("interval") ?? "";
  const rawLimit = Number(searchParams.get("limit") ?? KLINE_LIMIT);

  if (!/^[A-Z0-9]{3,20}$/.test(symbol) || symbol === "USDT") {
    return Response.json({ error: "Simbol tidak valid" }, { status: 400 });
  }
  if (!(TIMEFRAMES as readonly string[]).includes(interval)) {
    return Response.json({ error: "Interval tidak valid" }, { status: 400 });
  }
  const limit = Math.min(Math.max(Math.trunc(rawLimit) || KLINE_LIMIT, 100), 1000);

  try {
    const url = `${BINANCE_MARKET_DATA_BASE}/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
    const res = await fetch(url, { next: { revalidate: KLINE_REVALIDATE_SECONDS } });
    if (!res.ok) throw new Error(`Binance klines HTTP ${res.status}`);
    const rows = (await res.json()) as RawKlineRow[];
    const klines: Kline[] = rows.map((row) => ({
      openTime: row[0],
      closeTime: row[6],
      open: Number(row[1]),
      high: Number(row[2]),
      low: Number(row[3]),
      close: Number(row[4]),
      volume: Number(row[5]),
    }));
    return Response.json(klines);
  } catch {
    return Response.json(
      { error: "Gagal mengambil data klines" },
      { status: 502 },
    );
  }
}