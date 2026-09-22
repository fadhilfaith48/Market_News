import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createBatchFlusher } from "@/lib/batcher";

interface Item {
  symbol: string;
  price: number;
}

describe("createBatchFlusher", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("flush meneruskan item setelah interval berjalan", () => {
    const onFlush = vi.fn();
    const batcher = createBatchFlusher<Item>(onFlush, 250);

    batcher.enqueue({ symbol: "BTCUSDT", price: 64000 });
    expect(onFlush).not.toHaveBeenCalled();

    vi.advanceTimersByTime(250);
    expect(onFlush).toHaveBeenCalledTimes(1);
    expect(onFlush).toHaveBeenCalledWith([{ symbol: "BTCUSDT", price: 64000 }]);
  });

  it("menyatukan ticker per simbol — hanya yang terbaru yang dikirim", () => {
    const onFlush = vi.fn();
    const batcher = createBatchFlusher<Item>(onFlush, 250);

    batcher.enqueue({ symbol: "BTCUSDT", price: 64000 });
    batcher.enqueue({ symbol: "ETHUSDT", price: 3000 });
    batcher.enqueue({ symbol: "BTCUSDT", price: 64050 });

    vi.advanceTimersByTime(250);
    expect(onFlush).toHaveBeenCalledTimes(1);
    expect(onFlush).toHaveBeenCalledWith([
      { symbol: "BTCUSDT", price: 64050 },
      { symbol: "ETHUSDT", price: 3000 },
    ]);
  });

  it("flushNow langsung mengirim batch dan membatalkan timer tertunda", () => {
    const onFlush = vi.fn();
    const batcher = createBatchFlusher<Item>(onFlush, 250);

    batcher.enqueue({ symbol: "BTCUSDT", price: 64000 });
    batcher.flushNow();

    expect(onFlush).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(250);
    expect(onFlush).toHaveBeenCalledTimes(1);
  });

  it("batch kosong tidak memanggil onFlush", () => {
    const onFlush = vi.fn();
    const batcher = createBatchFlusher<Item>(onFlush, 250);

    vi.advanceTimersByTime(250);
    expect(onFlush).not.toHaveBeenCalled();

    batcher.flushNow();
    expect(onFlush).not.toHaveBeenCalled();
  });

  it("dispose membatalkan timer yang belum flush", () => {
    const onFlush = vi.fn();
    const batcher = createBatchFlusher<Item>(onFlush, 250);

    batcher.enqueue({ symbol: "BTCUSDT", price: 64000 });
    batcher.dispose();

    vi.advanceTimersByTime(250);
    expect(onFlush).not.toHaveBeenCalled();
  });

  it("enqueue baru setelah flush menjadwalkan flush berikutnya", () => {
    const onFlush = vi.fn();
    const batcher = createBatchFlusher<Item>(onFlush, 250);

    batcher.enqueue({ symbol: "ETHUSDT", price: 3000 });
    vi.advanceTimersByTime(250);
    expect(onFlush).toHaveBeenCalledTimes(1);

    batcher.enqueue({ symbol: "ETHUSDT", price: 3050 });
    vi.advanceTimersByTime(250);
    expect(onFlush).toHaveBeenCalledTimes(2);
    expect(onFlush).toHaveBeenLastCalledWith([
      { symbol: "ETHUSDT", price: 3050 },
    ]);
  });
});