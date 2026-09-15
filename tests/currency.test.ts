import { describe, expect, it } from "vitest";

import { convertPrice, formatCurrency } from "@/lib/format";

describe("convertPrice", () => {
  it("mengalikan nilai USD dengan rate", () => {
    expect(convertPrice(100, 15_000)).toBe(1_500_000);
    expect(convertPrice(0.5, 0.92)).toBeCloseTo(0.46);
  });
});

describe("formatCurrency", () => {
  it("USD langsung memakai formatPrice (tanpa konversi)", () => {
    expect(formatCurrency(1234.56, "USD", undefined)).toBe("1.23K");
    expect(formatCurrency(0.5, "USD", { USD: 1 })).toBe("0.5000");
  });

  it("fallback ke formatPrice saat rate belum tersedia", () => {
    expect(formatCurrency(100, "IDR", undefined)).toBe("100.00");
    expect(formatCurrency(100, "IDR", {})).toBe("100.00");
    expect(formatCurrency(100, "IDR", { EUR: 1 })).toBe("100.00");
  });

  it("menghormati locale mata uang (IDR: titik ribuan + koma desimal)", () => {
    expect(formatCurrency(0.5, "IDR", { IDR: 16_000 })).toBe("8.000,00");
  });

  it("menghormati locale mata uang (EUR: koma desimal)", () => {
    expect(formatCurrency(100, "EUR", { EUR: 0.92 })).toBe("92,00");
  });

  it("menghormati locale mata uang (SGD: gaya Inggris)", () => {
    expect(formatCurrency(100, "SGD", { SGD: 1.35 })).toBe("135.00");
  });

  it("konversi besar memakai notasi compact sesuai locale", () => {
    const result = formatCurrency(1_000_000_000, "IDR", { IDR: 16_100 });
    expect(result.replace(/\s/g, "")).toBe("16,1T");
  });
});