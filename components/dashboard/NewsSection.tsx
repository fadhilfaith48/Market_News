"use client";

import { useNews } from "@/hooks/useNews";
import { ArticleItem } from "@/components/news/ArticleItem";

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
            <ArticleItem key={article.id} article={article} />
          ))}
        </div>
      ) : null}
    </section>
  );
}