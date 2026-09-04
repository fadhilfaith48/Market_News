export type MarketTone = "up" | "down" | "flat";

export function getMarketTone(change: number | undefined): MarketTone {
  if (change === undefined || change === 0) return "flat";
  return change > 0 ? "up" : "down";
}

export const TONE_TEXT: Record<MarketTone, string> = {
  up: "text-up",
  down: "text-down",
  flat: "text-flat",
};

export function toneText(change: number | undefined): string {
  return TONE_TEXT[getMarketTone(change)];
}
