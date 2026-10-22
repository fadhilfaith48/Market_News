export default function CoinLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6">
      <div className="mb-4 h-4 w-40 rounded-lg bg-border/60" />
      <div className="flex flex-col gap-3 lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-4">
        <div className="min-w-0 space-y-3">
          <div className="card shimmer h-16 w-full" />
          <div className="card shimmer h-[500px] w-full" />
          <div className="card shimmer h-10 w-full" />
        </div>
        <div className="lg:sticky top-[var(--header-h,5rem)]">
          <div className="card shimmer h-24 w-full" />
          <div className="card shimmer mt-3 h-44 w-full" />
        </div>
      </div>
    </div>
  );
}