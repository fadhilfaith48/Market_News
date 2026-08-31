"use client";

import { useHydrated } from "@/hooks/useHydrated";
import { useIsWatched, useWatchStore } from "@/store/watchStore";

export function WatchStar({
  code,
  size = 16,
}: {
  code: string;
  size?: number;
}) {
  const hydrated = useHydrated();
  const watched = useIsWatched(code);
  const toggle = useWatchStore((state) => state.toggle);

  return (
    <button
      type="button"
      aria-label={
        watched ? `Hapus ${code} dari watchlist` : `Tambah ${code} ke watchlist`
      }
      title={watched ? "Hapus dari watchlist" : "Tambah ke watchlist"}
      onClick={(event) => {
        event.stopPropagation();
        event.preventDefault();
        toggle(code);
      }}
      style={{ width: size, height: size }}
      className={`inline-flex shrink-0 cursor-pointer select-none items-center justify-center text-base leading-none transition-colors ${
        hydrated && watched
          ? "text-amber-400"
          : "text-zinc-400 hover:text-amber-400"
      }`}
    >
      {hydrated ? (watched ? "★" : "☆") : <span aria-hidden="true" />}
    </button>
  );
}