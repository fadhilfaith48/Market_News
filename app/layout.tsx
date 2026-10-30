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
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "crypto",
    "cryptocurrency",
    "harga bitcoin",
    "grafik crypto",
    "market crypto",
    "watchlist crypto",
    "berita crypto",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "/",
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
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
        {/* Skip link: hanya terlihat saat difokus dengan keyboard */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:rounded-lg focus:border focus:border-border focus:bg-panel focus:px-3 focus:py-2 focus:text-sm focus:text-text"
        >
          Lewati ke konten utama
        </a>
        <ThemeSync />
        <QueryProvider>
          <MarketDataProvider>
            <Header />
            <main id="main" tabIndex={-1} className="flex-1 outline-none">
              {children}
            </main>
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