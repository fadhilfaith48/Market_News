import { LiveTicker } from "@/components/dashboard/LiveTicker";
import { MarketOverview } from "@/components/dashboard/MarketOverview";
import { FearGreedGauge } from "@/components/dashboard/FearGreedGauge";
import { NewsSection } from "@/components/dashboard/NewsSection";
import { TickerTable } from "@/components/dashboard/TickerTable";
import { TopMovers } from "@/components/dashboard/TopMovers";

export default function Home() {
  return (
    <>
      <LiveTicker />
      <MarketOverview />
      <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
        <div className="mb-5">
          <span className="pill bg-interactive-soft text-interactive">
            <span className="size-1.5 animate-pulse rounded-full bg-interactive" />
            Live · Binance WebSocket
          </span>
          <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
            Ringkasan Pasar
          </h1>
          <p className="mt-1 text-sm text-muted">
            Harga &amp; grafik real-time, portofolio, alert, dan berita crypto.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[300px_minmax(0,1fr)_320px]">
          <aside className="order-2 xl:order-none">
            <div className="mb-4">
              <FearGreedGauge />
            </div>
            <TopMovers layout="stack" />
          </aside>
          <div className="order-1 min-w-0 xl:order-none">
            <TickerTable />
          </div>
          <aside className="order-3 min-w-0 xl:order-none">
            <NewsSection />
          </aside>
        </div>
      </div>
    </>
  );
}
