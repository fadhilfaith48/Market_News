"use client";

import { ConnectionBadge } from "@/components/ui/ConnectionBadge";
import { useHydrated } from "@/hooks/useHydrated";
import { useUIStore } from "@/store/uiStore";

export function Header() {
  const theme = useUIStore((state) => state.theme);
  const toggleTheme = useUIStore((state) => state.toggleTheme);
  const hydrated = useHydrated();

  return (
    <header className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
      <div className="flex items-center gap-3">
        <span className="text-lg font-bold tracking-tight">Market News</span>
        <ConnectionBadge />
      </div>
      <button
        type="button"
        onClick={toggleTheme}
        className="rounded-md border border-zinc-200 px-3 py-1.5 text-xs font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
      >
        {hydrated ? (theme === "dark" ? "Terang" : "Gelap") : "Tema"}
      </button>
    </header>
  );
}