"use client";

import { useEffect } from "react";

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-4xl flex-col items-center gap-3 px-4 py-16 text-center">
      <div className="text-sm font-semibold text-text">
        Terjadi kesalahan
      </div>
      <p className="max-w-sm text-sm text-muted">
        Aplikasi gagal memuat. Silakan coba lagi.
      </p>
      <button
        type="button"
        onClick={retry}
        className="rounded-md border border-border px-4 py-1.5 text-sm font-medium hover:bg-hover"
      >
        Coba Lagi
      </button>
    </div>
  );
}