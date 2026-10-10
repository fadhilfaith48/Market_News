import { NextResponse } from "next/server";

import { getCoinMarketAssets } from "@/lib/adapters";
import { DEFAULT_SYMBOLS } from "@/lib/constants";

export async function GET() {
  try {
    const codes = DEFAULT_SYMBOLS.map((symbol) => symbol.replace("USDT", ""));
    const result = await getCoinMarketAssets(codes);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Gagal mengambil data pasar" },
      { status: 502 },
    );
  }
}