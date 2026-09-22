export interface BatchFlusher<T extends { symbol: string }> {
  enqueue(item: T): void;
  flushNow(): void;
  dispose(): void;
}

export function createBatchFlusher<T extends { symbol: string }>(
  onFlush: (items: T[]) => void,
  intervalMs: number,
): BatchFlusher<T> {
  let pending = new Map<string, T>();
  let timer: ReturnType<typeof setTimeout> | null = null;

  const flush = () => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
    if (pending.size === 0) return;
    const items = [...pending.values()];
    pending = new Map();
    onFlush(items);
  };

  return {
    enqueue(item) {
      pending.set(item.symbol, item);
      if (timer === null) {
        timer = setTimeout(flush, intervalMs);
      }
    },
    flushNow: flush,
    dispose() {
      if (timer !== null) clearTimeout(timer);
      timer = null;
      pending = new Map();
    },
  };
}