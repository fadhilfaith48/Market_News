export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6">
      <div className="space-y-3">
        <div className="shimmer h-5 w-40 rounded" />
        <div className="shimmer h-4 w-64 rounded" />
      </div>
      <div className="mt-6 overflow-hidden rounded border border-border">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
              <th className="px-4 py-3">Koin</th>
              <th className="px-4 py-3 text-right">Harga</th>
              <th className="px-4 py-3 text-right">24 Jam</th>
              <th className="px-4 py-3 text-right">Volume</th>
              <th className="px-4 py-3 text-right">Market Cap</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 10 }, (_, index) => (
              <tr key={index} className="border-b border-border/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="shimmer h-6 w-6 rounded-full" />
                    <div className="shimmer h-3.5 w-16 rounded" />
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="shimmer ml-auto h-3.5 w-20 rounded" />
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="shimmer ml-auto h-3.5 w-16 rounded" />
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="shimmer ml-auto h-3.5 w-20 rounded" />
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="shimmer ml-auto h-3.5 w-20 rounded" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}