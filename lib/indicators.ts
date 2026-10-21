/**
 * Indikator teknikal sederhana (moving average).
 *
 * Seluruh fungsi di file ini **pure** (tanpa side effect, tanpa I/O) agar
 * mudah diuji unit test. Konvensi umum pasar: nilai `null` berarti masa
 * pemanasan (warm-up) belum cukup, sehingga titik tersebut tidak digambar.
 */

export interface IndicatorPoint {
  /** Unix timestamp dalam detik. */
  time: number;
  value: number;
}

export type MovingAverageKind = "sma" | "ema";

function isFiniteNumber(value: number): boolean {
  return Number.isFinite(value);
}

/**
 * Simple Moving Average (rata-rata bergerak sederhana).
 *
 * @param values Deret harga (mis. harga close).
 * @param period Panjang periode rata-rata.
 * @returns Array sepanjang `values`; `null` selama masa pemanasan.
 */
export function sma(values: number[], period: number): (number | null)[] {
  const result: (number | null)[] = new Array(values.length).fill(null);
  if (!Number.isInteger(period) || period <= 0) return result;
  if (values.length < period) return result;

  for (let i = period - 1; i < values.length; i += 1) {
    let sum = 0;
    let valid = true;
    for (let j = i - period + 1; j <= i; j += 1) {
      const value = values[j];
      if (!isFiniteNumber(value)) {
        valid = false;
        break;
      }
      sum += value;
    }
    result[i] = valid ? sum / period : null;
  }
  return result;
}

/**
 * Exponential Moving Average (rata-rata bergerak eksponensial).
 *
 * Nilai pertama Equivalent Moving Average (SMA) dari `period` data awal,
 * lalu iterasi dengan multiplier `2 / (period + 1)`.
 *
 * @param values Deret harga (mis. harga close).
 * @param period Panjang periode.
 * @returns Array sepanjang `values`; `null` selama masa pemanasan.
 */
export function ema(values: number[], period: number): (number | null)[] {
  const result: (number | null)[] = new Array(values.length).fill(null);
  if (!Number.isInteger(period) || period <= 0) return result;
  if (values.length < period) return result;

  const window = values.slice(0, period);
  if (!window.every(isFiniteNumber)) return result;

  const multiplier = 2 / (period + 1);
  let previous = window.reduce((sum, value) => sum + value, 0) / period;
  result[period - 1] = previous;

  for (let i = period; i < values.length; i += 1) {
    const value = values[i];
    if (!isFiniteNumber(value)) {
      result[i] = null;
      continue;
    }
    previous = (value - previous) * multiplier + previous;
    result[i] = previous;
  }
  return result;
}

/**
 * Menghitung moving average sesuai jenis yang diminta.
 */
export function movingAverage(
  values: number[],
  period: number,
  kind: MovingAverageKind,
): (number | null)[] {
  return kind === "ema" ? ema(values, period) : sma(values, period);
}

/**
 * Mengubah hasil moving average menjadi titik siap-gambar.
 * Nilai `null` (masa pemanasan) dilewati.
 */
export function toIndicatorPoints(
  values: (number | null)[],
  timestamps: number[],
): IndicatorPoint[] {
  const points: IndicatorPoint[] = [];
  const length = Math.min(values.length, timestamps.length);
  for (let i = 0; i < length; i += 1) {
    const value = values[i];
    const time = timestamps[i];
    if (value === null || !isFiniteNumber(value)) continue;
    if (!isFiniteNumber(time)) continue;
    points.push({ time: Math.trunc(time / 1000), value });
  }
  return points;
}

export interface ClosePoint {
  /** Open time candle dalam milidetik. */
  time: number;
  close: number;
}

/**
 * Menghitung titik moving average dari deret candle (menggunakan harga close).
 */
export function movingAveragePoints(
  closes: ClosePoint[],
  period: number,
  kind: MovingAverageKind,
): IndicatorPoint[] {
  const values = closes.map((point) => point.close);
  const timestamps = closes.map((point) => point.time);
  return toIndicatorPoints(movingAverage(values, period, kind), timestamps);
}
