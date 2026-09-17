import { NextResponse } from "next/server";

import { COINGECKO_IDS } from "@/lib/coinMeta";

const COINGECKO_API = "https://api.coingecko.com/api/v3/coins/markets";

export async function GET() {
  const ids = Object.values(COINGECKO_IDS).join(",");
  const url = `${COINGECKO_API}?vs_currency=usd&ids=${ids}&price_change_percentage=24h&per_page=250`;

  try {
    const res = await fetch(url, { next: { revalidate: 300 } });

    if (res.status === 429) {
      return NextResponse.json(
        { error: "CoinGecko rate limited" },
        { status: 429 },
      );
    }

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch coin market data" },
        { status: 502 },
      );
    }

    const data = await res.json();

    if (!Array.isArray(data)) {
      return NextResponse.json(
        { error: "Unexpected response from CoinGecko" },
        { status: 502 },
      );
    }

    return NextResponse.json({ coins: data });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch coin market data" },
      { status: 500 },
    );
  }
}