"use client";

import { useState } from "react";

import { useCoinInfo } from "@/hooks/useCoinInfo";
import { getCoinMeta } from "@/lib/coinMeta";

function AboutSkeleton() {
  return (
    <div aria-hidden className="card p-4">
      <div className="shimmer h-3.5 w-40 rounded" />
      <div className="mt-3 space-y-2">
        <div className="shimmer h-3 w-full rounded" />
        <div className="shimmer h-3 w-11/12 rounded" />
        <div className="shimmer h-3 w-4/5 rounded" />
      </div>
    </div>
  );
}

function ExternalLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="btn-ghost focus-ring px-2.5 py-1.5"
    >
      {label}
      <svg
        className="size-3"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      </svg>
    </a>
  );
}

export function CoinAbout({ code }: { code: string }) {
  const { data, isPending, isError } = useCoinInfo(code);
  const [expanded, setExpanded] = useState(false);
  const { name } = getCoinMeta(`${code}USDT`);

  if (isPending) return <AboutSkeleton />;
  if (isError || !data) return null;

  const links = [
    data.homepage ? { href: data.homepage, label: "Website" } : null,
    data.explorer ? { href: data.explorer, label: "Explorer" } : null,
    data.whitepaper ? { href: data.whitepaper, label: "Whitepaper" } : null,
  ].filter((item): item is { href: string; label: string } => item !== null);

  const categories = data.categories.slice(0, 4);
  const canExpand = data.description.length > 320;

  return (
    <section aria-label={`Tentang ${name}`} className="card p-4">
      <h2 className="section-title">Tentang {name}</h2>

      {data.description ? (
        <div>
          <p
            className={`text-sm leading-relaxed text-text ${
              expanded ? "" : "line-clamp-6"
            }`}
          >
            {data.description}
          </p>
          {canExpand ? (
            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              className="focus-ring mt-1 text-xs font-medium text-interactive hover:underline"
            >
              {expanded ? "Tampilkan lebih sedikit" : "Selengkapnya"}
            </button>
          ) : null}
        </div>
      ) : null}

      {categories.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {categories.map((category) => (
            <span key={category} className="pill bg-hover text-muted">
              {category}
            </span>
          ))}
        </div>
      ) : null}

      {links.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {links.map((link) => (
            <ExternalLink key={link.label} href={link.href} label={link.label} />
          ))}
        </div>
      ) : null}

      <p className="mt-3 text-[10px] text-muted">
        Sumber data: CoinGecko. Deskripsi ditulis oleh komunitas — bersifat
        informatif, bukan nasihat keuangan.
      </p>
    </section>
  );
}
