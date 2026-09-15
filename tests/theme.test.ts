import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const css = readFileSync(
  path.resolve(import.meta.dirname, "../app/globals.css"),
  "utf8",
);

describe("urutan cascade token tema", () => {
  it("`.dark` ditulis setelah `:root` agar menang cascade saat class aktif", () => {
    const lightIndex = css.indexOf(":root {");
    const darkIndex = css.indexOf(".dark {");
    expect(lightIndex).toBeGreaterThan(-1);
    expect(darkIndex).toBeGreaterThan(-1);
    expect(darkIndex).toBeGreaterThan(lightIndex);
  });

  it("terang & gelap mendefinisikan --tv-page yang berbeda (bukan no-op)", () => {
    const lightPage = css.match(/:root\s*{[^}]*--tv-page:\s*([^;]+);/)?.[1]?.trim();
    const darkPage = css.match(/\.dark\s*{[^}]*--tv-page:\s*([^;]+);/)?.[1]?.trim();
    expect(lightPage).toBeTruthy();
    expect(darkPage).toBeTruthy();
    expect(lightPage).not.toBe(darkPage);
  });
});