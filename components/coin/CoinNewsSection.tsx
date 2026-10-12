"use client";

import { ArticleItem } from "@/components/news/ArticleItem";
import { useNews } from "@/hooks/useNews";
import { COINGECKO_IDS, COIN_NAMES } from "@/lib/coinMeta";
import { filterArticlesByCoin } from "@/lib/news";

function CoinNewsSkeleton() {
  return (
    <div aria-hidden className="space-y-3 p-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="h-3 w-full rounded bg-border/60" />
          <div className="mt-1.5 h-2.5 w-2/3 rounded bg-border/40" />
        </div>
      ))}
    </div>
  );
}

export function CoinNewsSection({ code }: { code: string }) {
  const { data, isPending, isError, refetch } = useNews();
  const name = COIN_NAMES[code] ?? code;
  const articles = filterArticlesByCoin(
    data ?? [],
    code,
    name,
    COINGECKO_IDS[code],
  );

  return (
    <section aria-label={`Berita ${name}`} className="rounded border border-border">
      <div className="border-b border-border px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted">
        Berita {code}
      </div>
      {isPending ? <CoinNewsSkeleton /> : null}
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
      {!isPending && !isError && articles.length === 0 ? (
        <p className="p-3 text-xs text-muted">
          Belum ada berita tentang {name} ({code}).
        </p>
      ) : null}
      {articles.length > 0 ? (
        <div className="space-y-0.5 p-2">
          {articles.map((article) => (
            <ArticleItem key={article.id} article={article} />
          ))}
        </div>
      ) : null}
    </section>
  );
}