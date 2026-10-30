import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

/**
 * Header keamanan dasar untuk semua respons.
 * HSTS hanya bermakna di HTTPS (production), tetapi aman dikirim di dev.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

/**
 * CSP hanya diterapkan di production — di dev, HMR Turbopack memakai
 * WebSocket/`eval` yang akan diblokir kebijakan ketat dan membuat
 * pengalaman `next dev` rusak.
 *
 * `'unsafe-inline'` pada script/style diperlukan karena Next menyuntikkan
 * skrip bootstrap & tema secara inline (tanpa nonce). Meski begitu, CSP ini
 * tetap membatasi sumber eksternal, mematikan `object`, dan mengunci
 * `frame-ancestors`.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' wss://stream.binance.com:9443 wss://data-stream.binance.vision:9443",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: isProd
          ? [
              ...securityHeaders,
              { key: "Content-Security-Policy", value: contentSecurityPolicy },
            ]
          : securityHeaders,
      },
    ];
  },
};

export default nextConfig;
