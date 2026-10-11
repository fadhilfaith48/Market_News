"use client";

import { ConnectionBadge } from "@/components/ui/ConnectionBadge";
import { Logo } from "@/components/layout/Logo";
import { SearchBox } from "@/components/layout/SearchBox";
import { CurrencySelect } from "@/components/layout/CurrencySelect";
import { useHydrated } from "@/hooks/useHydrated";
import { countUnseenErrors } from "@/lib/monitoring";
import { useAlertStore } from "@/store/alertStore";
import { useMonitoringStore } from "@/store/monitoringStore";
import { usePortfolioStore } from "@/store/portfolioStore";
import { useUIStore } from "@/store/uiStore";

export function Header() {
  const theme = useUIStore((state) => state.theme);
  const toggleTheme = useUIStore((state) => state.toggleTheme);
  const watchlistOpen = useUIStore((state) => state.watchlistOpen);
  const setWatchlistOpen = useUIStore((state) => state.setWatchlistOpen);
  const portfolioOpen = useUIStore((state) => state.portfolioOpen);
  const setPortfolioOpen = useUIStore((state) => state.setPortfolioOpen);
  const alertsOpen = useUIStore((state) => state.alertsOpen);
  const setAlertsOpen = useUIStore((state) => state.setAlertsOpen);
  const diagnosticsOpen = useUIStore((state) => state.diagnosticsOpen);
  const setDiagnosticsOpen = useUIStore((state) => state.setDiagnosticsOpen);
  const holdingsCount = Object.keys(
    usePortfolioStore((state) => state.holdings),
  ).length;
  const activeAlertCount = useAlertStore(
    (state) =>
      state.alerts.filter((alert) => alert.triggeredAt === null).length,
  );
  const unseenErrors = useMonitoringStore((state) =>
    countUnseenErrors(state.entries, state.viewedAt),
  );
  const hydrated = useHydrated();

  const toggleWatchlist = () => {
    setPortfolioOpen(false);
    setAlertsOpen(false);
    setDiagnosticsOpen(false);
    setWatchlistOpen(!watchlistOpen);
  };

  const togglePortfolio = () => {
    setWatchlistOpen(false);
    setAlertsOpen(false);
    setDiagnosticsOpen(false);
    setPortfolioOpen(!portfolioOpen);
  };

  const toggleAlerts = () => {
    setWatchlistOpen(false);
    setPortfolioOpen(false);
    setDiagnosticsOpen(false);
    setAlertsOpen(!alertsOpen);
  };

  const toggleDiagnostics = () => {
    setWatchlistOpen(false);
    setPortfolioOpen(false);
    setAlertsOpen(false);
    setDiagnosticsOpen(!diagnosticsOpen);
  };

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
            onClick={toggleWatchlist}
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
            onClick={togglePortfolio}
            aria-pressed={portfolioOpen}
            className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
              portfolioOpen
                ? "border-text bg-text text-page"
                : "border-border hover:bg-hover"
            }`}
          >
            {hydrated
              ? portfolioOpen
                ? "Tutup Portofolio"
                : holdingsCount > 0
                  ? `Portofolio (${holdingsCount})`
                  : "Portofolio"
              : "Portofolio"}
          </button>
          <button
            type="button"
            onClick={toggleAlerts}
            aria-pressed={alertsOpen}
            aria-label="Harga Alert"
            className={`relative rounded-md border px-2.5 py-1.5 transition-colors ${
              alertsOpen
                ? "border-text bg-text text-page"
                : "border-border hover:bg-hover"
            }`}
          >
            <svg
              className="size-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {hydrated && activeAlertCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-interactive px-1 text-[10px] font-medium text-white tabular-nums">
                {activeAlertCount > 99 ? "99+" : activeAlertCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={toggleDiagnostics}
            aria-pressed={diagnosticsOpen}
            aria-label="Diagnostics"
            className={`relative rounded-md border px-2.5 py-1.5 transition-colors ${
              diagnosticsOpen
                ? "border-text bg-text text-page"
                : "border-border hover:bg-hover"
            }`}
          >
            <svg
              className="size-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 3a9 9 0 0 0-9 9 9 9 0 0 0 9 9 9 9 0 0 0 9-9 9 9 0 0 0-9-9Z" />
              <path d="M12 8v4" />
              <path d="M12 16h.01" />
            </svg>
            {hydrated && unseenErrors > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-down px-1 text-[10px] font-medium text-white tabular-nums">
                {unseenErrors > 99 ? "99+" : unseenErrors}
              </span>
            )}
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
