import { describe, expect, it } from "vitest";

import { BINANCE_WS_ENDPOINTS } from "@/lib/constants";
import { endpointOf, endpointIndexOf, loadSavedEndpoint } from "@/lib/wsEndpoint";

describe("loadSavedEndpoint", () => {
  it("tanpa Local Storage (node) → fallback ke endpoint pertama", () => {
    expect(loadSavedEndpoint()).toBe(BINANCE_WS_ENDPOINTS[0]);
  });
});

describe("endpointOf", () => {
  it("memilih endpoint berdasarkan index", () => {
    expect(endpointOf(0)).toBe(BINANCE_WS_ENDPOINTS[0]);
    expect(endpointOf(1)).toBe(BINANCE_WS_ENDPOINTS[1]);
  });

  it("membungkus index negatif dan melebihi panjang", () => {
    expect(endpointOf(2)).toBe(BINANCE_WS_ENDPOINTS[0]);
    expect(endpointOf(-1)).toBe(BINANCE_WS_ENDPOINTS[1]);
  });
});

describe("endpointIndexOf", () => {
  it("menemukan index endpoint yang valid", () => {
    expect(endpointIndexOf(BINANCE_WS_ENDPOINTS[1])).toBe(1);
  });

  it("endpoint asing → fallback 0", () => {
    expect(endpointIndexOf("wss://example.com")).toBe(0);
  });
});