import { describe, expect, it } from "vitest";

import {
  ema,
  movingAverage,
  movingAveragePoints,
  sma,
  toIndicatorPoints,
} from "@/lib/indicators";

describe("sma", () => {
  it("menghitung rata-rata bergerak sederhana", () => {
    expect(sma([1, 2, 3, 4, 5], 3)).toEqual([null, null, 2, 3, 4]);
  });

  it("mengembalikan null saat data kurang dari periode", () => {
    expect(sma([1, 2], 3)).toEqual([null, null]);
  });

  it("periode 1 mengembalikan nilai itu sendiri", () => {
    expect(sma([4, 7, 9], 1)).toEqual([4, 7, 9]);
  });

  it("periode tidak valid menghasilkan semua null", () => {
    expect(sma([1, 2, 3], 0)).toEqual([null, null, null]);
    expect(sma([1, 2, 3], -2)).toEqual([null, null, null]);
  });

  it("nilai non-finite membuat window tersebut null", () => {
    expect(sma([1, Number.NaN, 3, 4], 2)).toEqual([null, null, null, 3.5]);
  });
});

describe("ema", () => {
  it("memulai dari SMA periode awal lalu iterasi", () => {
    // SMA(1,2,3) = 2, multiplier = 2/(3+1) = 0.5
    // (4-2)*0.5+2 = 3 ; (5-3)*0.5+3 = 4
    expect(ema([1, 2, 3, 4, 5], 3)).toEqual([null, null, 2, 3, 4]);
  });

  it("mengembalikan null saat data kurang dari periode", () => {
    expect(ema([1, 2], 3)).toEqual([null, null]);
  });

  it("nilai non-finite membuat titik tersebut null", () => {
    const result = ema([1, 2, 3, Number.NaN, 5], 3);
    expect(result[2]).toBe(2);
    expect(result[3]).toBeNull();
    expect(result[4]).not.toBeNull();
  });

  it("perriode tidak valid menghasilkan semua null", () => {
    expect(ema([1, 2, 3], 0)).toEqual([null, null, null]);
  });
});

describe("movingAverage", () => {
  it("meneruskan ke sma atau ema sesuai jenis", () => {
    const values = [1, 2, 3, 4, 5];
    expect(movingAverage(values, 3, "sma")).toEqual(sma(values, 3));
    expect(movingAverage(values, 3, "ema")).toEqual(ema(values, 3));
  });
});

describe("toIndicatorPoints", () => {
  it("mengubah milidetik menjadi detik dan melewati nilai null", () => {
    const points = toIndicatorPoints(
      [null, 2, null, 4],
      [1_700_000_000_000, 1_700_000_001_000, 1_700_000_002_000, 1_700_000_003_000],
    );
    expect(points).toEqual([
      { time: 1_700_000_001, value: 2 },
      { time: 1_700_000_003, value: 4 },
    ]);
  });

  it("mengabaikan timestamp yang tidak valid", () => {
    const points = toIndicatorPoints([1, 2], [Number.NaN, 1_700_000_000_000]);
    expect(points).toEqual([{ time: 1_700_000_000, value: 2 }]);
  });
});

describe("movingAveragePoints", () => {
  it("menghitung MA dari deret harga close", () => {
    const closes = [
      { time: 1_700_000_000_000, close: 1 },
      { time: 1_700_000_001_000, close: 2 },
      { time: 1_700_000_002_000, close: 3 },
    ];
    const points = movingAveragePoints(closes, 2, "sma");
    expect(points).toEqual([
      { time: 1_700_000_001, value: 1.5 },
      { time: 1_700_000_002, value: 2.5 },
    ]);
  });
});
