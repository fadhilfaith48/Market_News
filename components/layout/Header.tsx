"use client";

import { ConnectionBadge } from "@/components/ui/ConnectionBadge";
import { Logo } from "@/components/layout/Logo";
import { useHydrated } from "@/hooks/useHydrated";
import { useUIStore } from "@/store/uiStore";

export function Header() {
  const theme = useUIStore((state) => state.theme);
  const toggleTheme = useUIStore((state) => state.toggleTheme);
  const watchlistOpen = useUIStore((state) => state.watchlistOpen);
  const setWatchlistOpen = useUIStore((state) => state.setWatchlistOpen);
  const hydrated = useHydrated();

  return (
    <header className="flex items-center justify-between border-b border-border px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Logo className="h-6 w-6 text-up" />
          <span className="text-lg font-bold tracking-tight">Market News</span>
        </div>
        <ConnectionBadge />
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setWatchlistOpen(!watchlistOpen)}
          aria-pressed={watchlistOpen}
          className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
            watchlistOpen
              ? "border-text bg-text text-page"
              : "border-border hover:bg-hover"
          }`}
        >
          {hydrated ? (watchlistOpen ? "Tutup Watchlist" : "Watchlist") : "Watchlist"}
        </button>
        <button
          type="button"
          onClick={toggleTheme}
          className="rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-hover"
        >
          {hydrated ? (theme === "dark" ? "Terang" : "Gelap") : "Tema"}
        </button>
      </div>
    </header>
  );
}
