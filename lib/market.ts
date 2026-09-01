export type MarketTone = "up" | "down" | "flat";

export function getMarketTone(change: number | undefined): MarketTone {
  if (change === undefined || change === 0) return "flat";
  return change > 0 ? "up" : "down";
}

export const TONE_TEXT: Record<MarketTone, string> = {
  up: "text-green-600 dark:text-green-400",
  down: "text-red-600 dark:text-red-400",
  flat: "text-zinc-500 dark:text-zinc-400",
};

export function toneText(change: number | undefined): string {
  return TONE_TEXT[getMarketTone(change)];
}
