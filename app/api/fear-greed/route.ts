import { NextResponse } from "next/server";

import { fetchFearGreed } from "@/lib/fearGreed";

export async function GET() {
  const index = await fetchFearGreed();
  return NextResponse.json({ index, updatedAt: Date.now() });
}