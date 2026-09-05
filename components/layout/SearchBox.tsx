"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { CoinIcon } from "@/components/ui/CoinIcon";
import { COIN_NAMES } from "@/lib/coinMeta";
import { DEFAULT_SYMBOLS } from "@/lib/constants";

interface SearchItem {
  code: string;
  name: string;
  symbol: string;
}

const ITEMS: SearchItem[] = DEFAULT_SYMBOLS.map((s) => {
  const code = s.replace(/USDT$/, "");
  return { code, name: COIN_NAMES[code] ?? code, symbol: s };
});

export function SearchBox() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    if (!query.trim()) return ITEMS;
    const q = query.toLowerCase();
    return ITEMS.filter(
      (item) =>
        item.code.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q),
    );
  }, [query]);

  useEffect(() => {
    if (open && listRef.current) {
      const active = listRef.current.children[activeIndex] as HTMLElement;
      active?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex, open]);

  const navigate = useCallback(
    (code: string) => {
      setOpen(false);
      setQuery("");
      router.push(`/coin/${code}`);
    },
    [router],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[activeIndex]) navigate(results[activeIndex].code);
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        placeholder="Cari koin…"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setActiveIndex(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={handleKeyDown}
        className="w-32 rounded-md border border-border bg-panel px-2.5 py-1.5 text-xs text-text placeholder-muted outline-none transition-colors focus:border-interactive sm:w-48"
      />
      {open && (
        <div
          ref={listRef}
          className="absolute left-0 top-full z-50 mt-1 max-h-64 w-64 overflow-y-auto rounded border border-border bg-panel"
        >
          {results.length === 0 ? (
            <div className="px-3 py-2 text-xs text-muted">
              Tidak ditemukan
            </div>
          ) : (
            results.map((item, i) => (
              <button
                key={item.code}
                type="button"
                onMouseDown={() => navigate(item.code)}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors ${
                  i === activeIndex ? "bg-hover text-text" : "text-muted hover:bg-hover"
                }`}
              >
                <CoinIcon symbol={item.symbol} size={16} />
                <span className="font-medium">{item.code}</span>
                <span className="truncate text-muted">{item.name}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
