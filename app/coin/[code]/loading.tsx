export default function CoinLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6">
      <div className="mb-4 h-4 w-40 rounded bg-border/60" />
      <div className="flex flex-col gap-0 lg:grid lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0">
          <div className="shimmer h-16 w-full" />
          <div className="shimmer h-[500px] w-full border border-border border-t-0" />
          <div className="shimmer h-10 w-full border border-border border-t-0" />
        </div>
        <div className="mt-4 border-t border-border pt-4 lg:mt-0 lg:border-t-0 lg:border-l lg:border-border lg:pl-4 lg:pt-0">
          <div className="lg:sticky lg:top-4">
            <div className="shimmer h-24 w-full" />
            <div className="mt-4 shimmer h-44 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}