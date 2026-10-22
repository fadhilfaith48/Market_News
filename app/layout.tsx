import type { Metadata, Viewport } from "next";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WatchlistPanel } from "@/components/watchlist/WatchlistPanel";
import { PortfolioPanel } from "@/components/portfolio/PortfolioPanel";
import { AlertsPanel } from "@/components/alerts/AlertsPanel";
import { DiagnosticsPanel } from "@/components/monitoring/DiagnosticsPanel";
import { MarketDataProvider } from "@/components/dashboard/MarketDataProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { ThemeSync } from "@/components/ThemeSync";
import { Toaster } from "@/components/ui/Toaster";
import "./globals.css";

export const metadata: Metadata = {
  title: "Market News — Crypto",
  description: "Dashboard data pasar cryptocurrency real-time.",
};

/**
 * Konfigurasi viewport untuk perangkat mobile.
 *
 * - `viewportFit: "cover"` → konten boleh memakai area notch (iPhone) dan
 *   `env(safe-area-inset-*)` menjadi aktif (padding bawah handled di
 *   `globals.css`, `Toaster`, dan `DrawerShell`).
 * - `themeColor` → address bar browser ikut tema (tidak ada lagi flash putih
 *   saat membuka aplikasi dalam mode gelap).
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#131722" },
  ],
};

const initialThemeScript = `
  try {
    var s = JSON.parse(localStorage.getItem("crypto-ui") || "{}");
    var dark = !s.state || s.state.theme !== "light";
    document.documentElement.classList.toggle("dark", dark);
  } catch (e) {}
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: initialThemeScript }} />
      </head>
      <body className="flex min-h-full flex-col bg-page text-text">
        <ThemeSync />
        <QueryProvider>
          <MarketDataProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <WatchlistPanel />
            <PortfolioPanel />
            <AlertsPanel />
            <DiagnosticsPanel />
            <Toaster />
          </MarketDataProvider>
        </QueryProvider>
      </body>
    </html>
  );
}