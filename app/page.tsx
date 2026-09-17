import { LiveTicker } from "@/components/dashboard/LiveTicker";
import { NewsSection } from "@/components/dashboard/NewsSection";
import { TickerTable } from "@/components/dashboard/TickerTable";
import { TopMovers } from "@/components/dashboard/TopMovers";

export default function Home() {
  return (
    <>
      <LiveTicker />
      <div className="mx-auto max-w-7xl px-4 py-6">
        <h1 className="mb-1 text-xl font-bold">Ringkasan Pasar</h1>
        <p className="mb-4 text-sm text-muted">
          Harga real-time dari Binance WebSocket.
        </p>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[300px_minmax(0,1fr)_320px]">
          <aside className="order-2 xl:order-none">
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
