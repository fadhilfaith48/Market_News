import { NextResponse } from "next/server";

const RATE_API = "https://open.er-api.com/v6/latest/USD";

export async function GET() {
  try {
    const res = await fetch(RATE_API, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch rates" },
        { status: 502 },
      );
    }

    const data = await res.json();

    if (data.result !== "success") {
      return NextResponse.json(
        { error: "Rate API returned error" },
        { status: 502 },
      );
    }

    return NextResponse.json({
      rates: data.rates,
      time_last_update_utc: data.time_last_update_utc,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch rates" },
      { status: 500 },
    );
  }
}
