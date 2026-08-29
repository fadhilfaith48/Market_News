import type { Metadata } from "next";

import { Header } from "@/components/layout/Header";
import { MarketDataProvider } from "@/components/dashboard/MarketDataProvider";
import { ThemeSync } from "@/components/ThemeSync";
import "./globals.css";

export const metadata: Metadata = {
  title: "Market News — Crypto",
  description: "Dashboard data pasar cryptocurrency real-time.",
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
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <ThemeSync />
        <MarketDataProvider>
          <Header />
          <main className="flex-1">{children}</main>
        </MarketDataProvider>
      </body>
    </html>
  );
}