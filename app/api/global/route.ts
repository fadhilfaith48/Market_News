import { NextResponse } from "next/server";

import { fetchGlobalMarket } from "@/lib/adapters/global";

export async function GET() {
  const market = await fetchGlobalMarket();
  return NextResponse.json({ market, updatedAt: Date.now() });
}