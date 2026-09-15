import { LiveTicker } from "@/components/dashboard/LiveTicker";
import { TickerTable } from "@/components/dashboard/TickerTable";
import { TopMovers } from "@/components/dashboard/TopMovers";

export default function Home() {
  return (
    <>
      <LiveTicker />
      <div className="mx-auto max-w-4xl px-4 py-6">
        <h1 className="mb-1 text-xl font-bold">Ringkasan Pasar</h1>
        <p className="mb-4 text-sm text-muted">
          Harga real-time dari Binance WebSocket.
        </p>
        <TickerTable />
        <TopMovers />
      </div>
    </>
  );
}
