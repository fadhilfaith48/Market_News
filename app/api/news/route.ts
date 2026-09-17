import { NextResponse } from "next/server";

import { fetchNews, NEWS_LIMIT } from "@/lib/news";

export async function GET() {
  try {
    const articles = await fetchNews();
    return NextResponse.json({
      articles,
      limit: NEWS_LIMIT,
      updatedAt: Date.now(),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch news", articles: [] },
      { status: 500 },
    );
  }
}