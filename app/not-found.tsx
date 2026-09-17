import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col items-center gap-3 px-4 py-16 text-center">
      <div className="text-4xl font-bold tabular-nums text-muted">404</div>
      <div className="text-sm font-semibold text-text">
        Halaman tidak ditemukan
      </div>
      <p className="max-w-sm text-sm text-muted">
        Alamat yang Anda buka tidak tersedia atau sudah dipindahkan.
      </p>
      <Link
        href="/"
        className="rounded-md border border-border px-4 py-1.5 text-sm font-medium hover:bg-hover"
      >
        Kembali ke Dashboard
      </Link>
    </div>
  );
}