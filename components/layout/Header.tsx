"use client";

import { ConnectionBadge } from "@/components/ui/ConnectionBadge";
import { Logo } from "@/components/layout/Logo";
import { SearchBox } from "@/components/layout/SearchBox";
import { CurrencySelect } from "@/components/layout/CurrencySelect";
import { useHydrated } from "@/hooks/useHydrated";
import { useUIStore } from "@/store/uiStore";

export function Header() {
  const theme = useUIStore((state) => state.theme);
  const toggleTheme = useUIStore((state) => state.toggleTheme);
  const watchlistOpen = useUIStore((state) => state.watchlistOpen);
  const setWatchlistOpen = useUIStore((state) => state.setWatchlistOpen);
  const hydrated = useHydrated();

  return (
    <header className="border-b border-border px-4 py-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <Logo className="h-6 w-6 flex-none text-up" />
          <span className="flex-none text-base font-bold leading-tight tracking-tight sm:text-lg">
            Market News
          </span>
          <ConnectionBadge className="flex-none" />
        </div>
        <div className="flex flex-none items-center gap-2">
          <div className="hidden sm:block">
            <SearchBox />
          </div>
          <div className="hidden sm:block">
            <CurrencySelect />
          </div>
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
      </div>
      <div className="mt-2 flex items-center gap-2 sm:hidden">
        <SearchBox fluid />
        <CurrencySelect />
      </div>
    </header>
  );
}
