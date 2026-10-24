"use client";

import { useHydrated } from "@/hooks/useHydrated";
import { useIsWatched, useWatchStore } from "@/store/watchStore";

/**
 * Tombol ☆/★ untuk watchlist.
 *
 * Ukuran area sentuh: **44px di HP** (`size-11`) dan 28px di layar ≥640px.
 * Di tampilan kartu mobile tinggi baris cukup untuk target 44px tanpa
 * menabrak tombol lain; di tabel desktop 28px sudah memadai (memakai mouse).
 * `aria-pressed` memberi tahu screen reader status terpilih.
 */
export function WatchStar({ code }: { code: string }) {
  const hydrated = useHydrated();
  const watched = useIsWatched(code);
  const toggle = useWatchStore((state) => state.toggle);

  return (
    <button
      type="button"
      aria-label={
        watched ? `Hapus ${code} dari watchlist` : `Tambah ${code} ke watchlist`
      }
      aria-pressed={hydrated ? watched : undefined}
      title={watched ? "Hapus dari watchlist" : "Tambah ke watchlist"}
      onClick={(event) => {
        event.stopPropagation();
        event.preventDefault();
        toggle(code);
      }}
      className="focus-ring inline-flex size-11 shrink-0 cursor-pointer select-none items-center justify-center rounded-md text-lg leading-none transition-colors sm:size-7 sm:text-base"
    >
      <span
        aria-hidden="true"
        className={`transition-colors ${
          hydrated && watched
            ? "text-warning"
            : "text-muted hover:text-warning"
        }`}
      >
        {hydrated ? (watched ? "★" : "☆") : ""}
      </span>
    </button>
  );
}
