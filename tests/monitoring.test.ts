import { beforeEach, describe, expect, it } from "vitest";

import { MAX_LOG_ENTRIES } from "@/lib/constants";
import {
  appendLog,
  countErrors,
  countUnseenErrors,
  createLogEntry,
  describeError,
  errorToEntry,
  isLogLevel,
  sanitizeLogs,
} from "@/lib/monitoring";
import type { DiagnosticEntry } from "@/lib/monitoring";
import { useMonitoringStore } from "@/store/monitoringStore";

describe("createLogEntry", () => {
  it("membuat entri dengan id, ts, level dan scope", () => {
    const entry = createLogEntry("warn", "perf", "CLS");
    expect(entry.level).toBe("warn");
    expect(entry.scope).toBe("perf");
    expect(entry.message).toBe("CLS");
    expect(typeof entry.id).toBe("string");
    expect(Number.isFinite(entry.ts)).toBe(true);
  });

  it("memotong pesan dan detail yang terlalu panjang", () => {
    const entry = createLogEntry("info", "t", "a".repeat(400), "b".repeat(2000));
    expect(entry.message.length).toBeLessThanOrEqual(301);
    expect(entry.message.endsWith("…")).toBe(true);
    expect(entry.detail?.length).toBeLessThanOrEqual(1001);
  });

  it("mengganti pesan kosong dengan placeholder", () => {
    expect(createLogEntry("info", "t", "").message).toBe("(tanpa pesan)");
  });
});

describe("appendLog", () => {
  it("menjaga urutan dan ukuran maksimum (ring buffer)", () => {
    const base = Array.from({ length: MAX_LOG_ENTRIES }, (_, i) =>
      createLogEntry("info", "t", String(i)),
    );
    const next = appendLog(base, createLogEntry("error", "t", "baru"));

    expect(next).toHaveLength(MAX_LOG_ENTRIES);
    expect(next[next.length - 1].message).toBe("baru");
    expect(next[0].message).toBe("1");
  });

  it("menghormati batas kustom", () => {
    const next = appendLog([], createLogEntry("info", "t", "x"), 0);
    expect(next).toHaveLength(0);
  });
});

describe("describeError", () => {
  it("mengambil pesan dari Error", () => {
    expect(describeError(new Error("boom"))).toBe("boom");
  });

  it("menangani string, objek dan primitif", () => {
    expect(describeError("langsung")).toBe("langsung");
    expect(describeError({ a: 1 })).toBe('{"a":1}');
    expect(describeError(5)).toBe("5");
  });
});

describe("errorToEntry", () => {
  it("membuat entri error dengan stack/konteks", () => {
    const entry = errorToEntry("scope", new Error("gagal"), "ctx=1");
    expect(entry.level).toBe("error");
    expect(entry.message).toBe("gagal");
    expect(entry.detail).toContain("ctx=1");
  });
});

describe("isLogLevel", () => {
  it("menerima hanya level yang dikenal", () => {
    expect(isLogLevel("info")).toBe(true);
    expect(isLogLevel("error")).toBe(true);
    expect(isLogLevel("debug")).toBe(false);
    expect(isLogLevel(1)).toBe(false);
  });
});

describe("countErrors / countUnseenErrors", () => {
  const make = (level: DiagnosticEntry["level"], ts: number): DiagnosticEntry => ({
    ...createLogEntry(level, "t", "m"),
    ts,
  });

  it("menghitung semua error", () => {
    const entries = [make("error", 1), make("info", 2), make("error", 3)];
    expect(countErrors(entries)).toBe(2);
  });

  it("menghitung error yang belum dilihat", () => {
    const entries = [make("error", 10), make("error", 30), make("warn", 40)];
    expect(countUnseenErrors(entries, 20)).toBe(1);
    expect(countUnseenErrors(entries, 0)).toBe(2);
  });
});

describe("sanitizeLogs", () => {
  it("mengembalikan array kosong untuk input tidak valid", () => {
    expect(sanitizeLogs(null)).toEqual([]);
    expect(sanitizeLogs("x")).toEqual([]);
    expect(sanitizeLogs({})).toEqual([]);
  });

  it("membuang entri rusak dan mempertahankan yang valid", () => {
    const now = Date.now();
    const result = sanitizeLogs([
      { id: "a", ts: now, level: "error", scope: "s", message: "m" },
      { id: 1, ts: now, level: "error", scope: "s", message: "m" },
      { id: "b", ts: Number.NaN, level: "error", scope: "s", message: "m" },
      { id: "c", ts: now, level: "debug", scope: "s", message: "m" },
      { id: "d", ts: now, level: "info", scope: "s" },
      { id: "e", ts: now, level: "warn", scope: "s", message: "m", detail: 5 },
    ]);

    expect(result).toEqual([
      { id: "a", ts: now, level: "error", scope: "s", message: "m" },
      { id: "e", ts: now, level: "warn", scope: "s", message: "m" },
    ]);
  });

  it(`memotong ke ${MAX_LOG_ENTRIES} entri`, () => {
    const many = Array.from({ length: MAX_LOG_ENTRIES + 50 }, (_, i) => ({
      id: `a${i}`,
      ts: 1,
      level: "info",
      scope: "s",
      message: "m",
    }));
    expect(sanitizeLogs(many)).toHaveLength(MAX_LOG_ENTRIES);
  });
});

describe("monitoringStore", () => {
  beforeEach(() => {
    useMonitoringStore.setState({ entries: [], viewedAt: 0 });
  });

  it("add menyimpan entri", () => {
    useMonitoringStore.getState().add("error", "scope", "pesan");
    const { entries } = useMonitoringStore.getState();
    expect(entries).toHaveLength(1);
    expect(entries[0].level).toBe("error");
    expect(entries[0].message).toBe("pesan");
  });

  it("addEntry menerima entri siap pakai", () => {
    useMonitoringStore
      .getState()
      .addEntry(errorToEntry("scope", new Error("boom")));
    expect(useMonitoringStore.getState().entries[0].message).toBe("boom");
  });

  it("clear mengosongkan entri", () => {
    useMonitoringStore.getState().add("info", "s", "m");
    useMonitoringStore.getState().clear();
    expect(useMonitoringStore.getState().entries).toEqual([]);
  });

  it("markViewed memperbarui viewedAt", () => {
    useMonitoringStore.getState().markViewed();
    expect(useMonitoringStore.getState().viewedAt).toBeGreaterThan(0);
  });
});
