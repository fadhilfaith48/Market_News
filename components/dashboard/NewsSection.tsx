"use client";

import { useNews } from "@/hooks/useNews";
import { ArticleItem } from "@/components/news/ArticleItem";

function NewsSkeleton() {
  return (
    <div aria-hidden className="space-y-3 py-1">
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
      className="card p-3"
    >
      <h3 className="section-title">Berita Pasar</h3>
      {isPending ? <NewsSkeleton /> : null}
      {!isPending && isError ? (
        <div className="space-y-2 py-3 text-center">
          <p className="text-sm text-muted">Berita gagal dimuat.</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="btn-ghost focus-ring"
          >
            Coba Lagi
          </button>
        </div>
      ) : null}
      {!isPending && !isError && !hasArticles ? (
        <p className="text-xs text-muted">Belum ada berita.</p>
      ) : null}
      {hasArticles ? (
        <div className="space-y-0.5">
          {data?.map((article) => (
            <ArticleItem key={article.id} article={article} />
          ))}
        </div>
      ) : null}
    </section>
  );
}