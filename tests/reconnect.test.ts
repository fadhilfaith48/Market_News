import { describe, expect, it } from "vitest";

import { getReconnectDelay } from "@/hooks/useBinanceWS";

describe("getReconnectDelay", () => {
  it("backoff eksponensial dimulai dari 1 detik", () => {
    expect(getReconnectDelay(0)).toBe(1_000);
    expect(getReconnectDelay(1)).toBe(2_000);
    expect(getReconnectDelay(2)).toBe(4_000);
    expect(getReconnectDelay(3)).toBe(8_000);
  });

  it("di-batasi maksimal 30 detik", () => {
    expect(getReconnectDelay(5)).toBe(30_000);
    expect(getReconnectDelay(10)).toBe(30_000);
    expect(getReconnectDelay(100)).toBe(30_000);
  });
});