import { describe, expect, it } from "vitest";

import { normalizeFearGreed } from "@/lib/fearGreed";

describe("normalizeFearGreed", () => {
  it("mengekstrak nilai, klasifikasi, dan timestamp (detik → ms)", () => {
    const result = normalizeFearGreed({
      data: [
        { value: "69", value_classification: "Greed", timestamp: "1791763200" },
      ],
    });

    expect(result).toEqual({
      value: 69,
      classification: "Greed",
      updatedAt: 1_791_763_200_000,
    });
  });

  it("mengembalikan null untuk struktur rusak", () => {
    expect(normalizeFearGreed(null)).toBeNull();
    expect(normalizeFearGreed({})).toBeNull();
    expect(normalizeFearGreed({ data: [] })).toBeNull();
    expect(normalizeFearGreed({ data: "x" })).toBeNull();
  });

  it("menormalkan value non-angka menjadi null", () => {
    const result = normalizeFearGreed({
      data: [{ value: "abc", value_classification: "Greed" }],
    });
    expect(result?.value).toBeNull();
    expect(result?.classification).toBe("Greed");
    expect(result?.updatedAt).toBeNull();
  });

  it("fallback klasifikasi tidak dikenal", () => {
    const result = normalizeFearGreed({
      data: [{ value: "10" }],
    });
    expect(result?.value).toBe(10);
    expect(result?.classification).toBe("Unknown");
  });
});