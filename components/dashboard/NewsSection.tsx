"use client";

import { useState } from "react";

import { useNews } from "@/hooks/useNews";
import { formatRelativeTime } from "@/lib/format";
import type { Article } from "@/lib/news";

function ArticleThumb({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={40}
      height={40}
      loading="lazy"
      onError={() => setFailed(true)}
      className="size-10 flex-none rounded object-cover"
    />
  );
}

function NewsSkeleton() {
  return (
    <div aria-hidden className="space-y-3 p-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="h-3 w-full rounded bg-border/60" />
          <div className="mt-1.5 h-2.5 w-2/3 rounded bg-border/40" />
        </div>
      ))}
    </div>
  );
}

function NewsItem({ article }: { article: Article }) {
  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded border border-transparent px-2 py-2 transition-colors hover:bg-hover hover:border-border/40"
    >
      <div className="flex items-start gap-2">
        {article.image ? <ArticleThumb src={article.image} alt="" /> : null}
        <div className="min-w-0">
          <p className="line-clamp-2 text-sm font-medium leading-snug">
            {article.title}
          </p>
          <p className="mt-1 text-xs text-muted">
            {article.source} · {formatRelativeTime(article.publishedAt)}
          </p>
        </div>
      </div>
    </a>
  );
}

export function NewsSection() {
  const { data, isPending, isError, refetch } = useNews();
  const hasArticles = (data?.length ?? 0) > 0;

  return (
    <section
      aria-label="Berita pasar"
      className="rounded border border-border"
    >
      <div className="border-b border-border px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted">
        Berita Pasar
      </div>
      {isPending ? <NewsSkeleton /> : null}
      {!isPending && isError ? (
        <div className="space-y-2 p-3 text-center">
          <p className="text-sm text-muted">Berita gagal dimuat.</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-hover"
          >
            Coba Lagi
          </button>
        </div>
      ) : null}
      {!isPending && !isError && !hasArticles ? (
        <p className="p-3 text-xs text-muted">Belum ada berita.</p>
      ) : null}
      {hasArticles ? (
        <div className="space-y-0.5 p-2">
          {data?.map((article) => (
            <NewsItem key={article.id} article={article} />
          ))}
        </div>
      ) : null}
    </section>
  );
}