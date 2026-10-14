"use client";

import { useState } from "react";

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
      className="size-10 flex-none rounded-lg object-cover"
    />
  );
}

export function ArticleItem({ article }: { article: Article }) {
  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="focus-ring block rounded-xl px-2 py-2 transition-colors hover:bg-hover"
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