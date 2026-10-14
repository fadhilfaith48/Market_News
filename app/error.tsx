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
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="card flex flex-col items-center gap-3 p-8 text-center">
        <div className="text-sm font-semibold text-text">
          Terjadi kesalahan
        </div>
        <p className="max-w-sm text-sm text-muted">
          Aplikasi gagal memuat. Silakan coba lagi.
        </p>
        <button type="button" onClick={retry} className="btn-ghost focus-ring">
          Coba Lagi
        </button>
      </div>
    </div>
  );
}