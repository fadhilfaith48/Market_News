import { ImageResponse } from "next/og";

/**
 * Gambar OG 1200×630 untuk preview saat link dibagikan.
 * Dipakai bersama oleh `app/opengraph-image.tsx` dan `app/twitter-image.tsx`.
 */
export const OG_ALT = "Market News — dashboard harga, grafik, dan berita crypto real-time";
export const OG_SIZE: { width: number; height: number } = {
  width: 1200,
  height: 630,
};

export function renderOgImage(): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #131722 0%, #1b2130 100%)",
          padding: "72px 80px",
          color: "#e8eaf0",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 72,
              height: 72,
              borderRadius: 20,
              background: "linear-gradient(135deg, #2f6fed, #16c784)",
              color: "#ffffff",
              fontSize: 40,
              fontWeight: 700,
              marginRight: 24,
            }}
          >
            M
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: -0.5 }}>
              Market News
            </div>
            <div style={{ fontSize: 20, color: "#8b93a7" }}>
              Crypto Market Real-time
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              alignSelf: "flex-start",
              padding: "8px 18px",
              borderRadius: 999,
              background: "rgba(22, 199, 132, 0.14)",
              color: "#16c784",
              fontSize: 22,
              fontWeight: 600,
              marginBottom: 28,
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 999,
                background: "#16c784",
                marginRight: 10,
              }}
            />
            Live · Binance WebSocket
          </div>
          <div
            style={{
              fontSize: 62,
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: -1.5,
            }}
          >
            Harga, grafik &amp; berita crypto
          </div>
          <div
            style={{
              fontSize: 62,
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: -1.5,
              color: "#8b93a7",
            }}
          >
            dalam satu dashboard
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(255, 255, 255, 0.12)",
            paddingTop: 24,
            fontSize: 22,
            color: "#8b93a7",
          }}
        >
          <div>50 koin · Chart Pro · Watchlist · Portofolio · Alert</div>
          <div>market-news-roan.vercel.app</div>
        </div>
      </div>
    ),
    { ...OG_SIZE },
  );
}
