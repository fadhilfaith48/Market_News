import { describe, expect, it } from "vitest";

import { formatCompact, formatPercent, formatPrice } from "@/lib/format";

describe("formatPrice — aturan bertingkat (staircase)", () => {
  it("nilai non-finite menghasilkan tanda strip", () => {
    expect(formatPrice(Number.NaN)).toBe("-");
    expect(formatPrice(Number.POSITIVE_INFINITY)).toBe("-");
    expect(formatPrice(Number.NEGATIVE_INFINITY)).toBe("-");
  });

  it("nilai 0 menghasilkan '0' (tidak berwarna / bukan compact)", () => {
    expect(formatPrice(0)).toBe("0");
  });

  it("koin mikro (< 0.01) menampilkan digit signifikan, tidak dibulatkan 0", () => {
    expect(formatPrice(0.00001234)).toBe("0.00001234");
    expect(formatPrice(0.005)).toBe("0.005");
    expect(formatPrice(0.0000001)).toBe("0.0000001");
  });

  it("rentang 0.01 s.d. < 1 → empat desimal", () => {
    expect(formatPrice(0.01)).toBe("0.0100");
    expect(formatPrice(0.5)).toBe("0.5000");
    expect(formatPrice(0.9999)).toBe("0.9999");
  });

  it("rentang 1 s.d. < 1000 → dua desimal", () => {
    expect(formatPrice(1)).toBe("1.00");
    expect(formatPrice(50.123)).toBe("50.12");
    expect(formatPrice(999.99)).toBe("999.99");
  });

  it("nilai ≥ 1000 → compact (K / M / B / T)", () => {
    expect(formatPrice(1000)).toBe("1K");
    expect(formatPrice(1234.56)).toBe("1.23K");
    expect(formatPrice(1_000_000)).toBe("1M");
    expect(formatPrice(123_456_789)).toBe("123.46M");
    expect(formatPrice(1_000_000_000)).toBe("1B");
    expect(formatPrice(1_000_000_000_000)).toBe("1T");
  });

  it("nilai negatif dipertahankan tandanya", () => {
    expect(formatPrice(-1)).toBe("-1.00");
    expect(formatPrice(-0.00001234)).toBe("-0.00001234");
  });
});

describe("formatPercent", () => {
  it("non-finite → '-'", () => {
    expect(formatPercent(Number.NaN)).toBe("-");
  });

  it("0% tanpa tanda plus", () => {
    expect(formatPercent(0)).toBe("0.00%");
  });

  it("positif diberi tanda '+', negatif tanpa plus", () => {
    expect(formatPercent(2.5)).toBe("+2.50%");
    expect(formatPercent(-3)).toBe("-3.00%");
  });
});

describe("formatCompact", () => {
  it("menggunakan notasi compact en-US", () => {
    expect(formatCompact(1_250_000)).toBe("1.25M");
    expect(formatCompact(0)).toBe("0");
  });

  it("non-finite → '-'", () => {
    expect(formatCompact(Number.NaN)).toBe("-");
  });
});