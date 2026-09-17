import { describe, expect, it } from "vitest";

import { getReconnectDelay } from "@/hooks/useBinanceWS";

describe("getReconnectDelay", () => {
  it("backoff eksponensial dimulai dari 1 detik", () => {
    expect(getReconnectDelay(0)).toBe(1_000);
    expect(getReconnectDelay(1)).toBe(2_000);
    expect(getReconnectDelay(2)).toBe(4_000);
    expect(getReconnectDelay(3)).toBe(8_000);
  });

  it("default di-batasi maksimal 15 detik (reconnect cepat)", () => {
    expect(getReconnectDelay(4)).toBe(15_000);
    expect(getReconnectDelay(5)).toBe(15_000);
    expect(getReconnectDelay(10)).toBe(15_000);
  });

  it("mendukung cap/interval berbeda lewat argumen", () => {
    expect(getReconnectDelay(4, 30_000)).toBe(16_000);
    expect(getReconnectDelay(5, 30_000)).toBe(30_000);
  });
});