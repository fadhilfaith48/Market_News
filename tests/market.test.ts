import { describe, expect, it } from "vitest";

import { getMarketTone, toneText } from "@/lib/market";

describe("getMarketTone", () => {
  it("undefined → flat", () => {
    expect(getMarketTone(undefined)).toBe("flat");
  });

  it("0 → flat", () => {
    expect(getMarketTone(0)).toBe("flat");
  });

  it("positif → up", () => {
    expect(getMarketTone(1.5)).toBe("up");
  });

  it("negatif → down", () => {
    expect(getMarketTone(-0.5)).toBe("down");
  });
});

describe("toneText", () => {
  it("memetakan tone ke class Tailwind (.dark-aware)", () => {
    expect(toneText(1)).toBe("text-up");
    expect(toneText(-1)).toBe("text-down");
    expect(toneText(0)).toBe("text-flat");
    expect(toneText(undefined)).toBe("text-flat");
  });
});