import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="card flex flex-col items-center gap-3 p-8 text-center">
        <div className="text-5xl font-bold tabular-nums text-up-gradient">404</div>
        <div className="text-sm font-semibold text-text">
          Halaman tidak ditemukan
        </div>
        <p className="max-w-sm text-sm text-muted">
          Alamat yang Anda buka tidak tersedia atau sudah dipindahkan.
        </p>
        <Link href="/" className="btn-ghost focus-ring">
          Kembali ke Dashboard
        </Link>
      </div>
    </div>
  );
}