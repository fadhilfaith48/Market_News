export interface Holding {
  qty: number;
  avgCost: number;
}

export interface Position {
  code: string;
  symbol: string;
  currentValue: number;
  costBasis: number;
  pnl: number;
  pnlPercent: number;
}

export interface PortfolioSummary {
  totalValue: number;
  totalCost: number;
  pnl: number;
  pnlPercent: number;
  pricedCount: number;
}

export function getSymbol(code: string): string {
  return `${code}USDT`;
}

export function computePosition(
  code: string,
  { qty, avgCost }: Holding,
  lastPrice: number | undefined,
): Position | null {
  if (lastPrice === undefined || !Number.isFinite(lastPrice)) return null;
  const currentValue = qty * lastPrice;
  const costBasis = qty * avgCost;
  const pnl = currentValue - costBasis;
  const pnlPercent = costBasis > 0 ? (pnl / costBasis) * 100 : 0;
  return {
    code,
    symbol: getSymbol(code),
    currentValue,
    costBasis,
    pnl,
    pnlPercent,
  };
}

export function computeSummary(
  holdings: Record<string, Holding>,
  lastPriceByCode: Record<string, number | undefined>,
): PortfolioSummary {
  let totalValue = 0;
  let totalCost = 0;
  let pricedCount = 0;
  for (const [code, holding] of Object.entries(holdings)) {
    const position = computePosition(code, holding, lastPriceByCode[code]);
    if (!position) continue;
    totalValue += position.currentValue;
    totalCost += position.costBasis;
    pricedCount += 1;
  }
  const pnl = totalValue - totalCost;
  const pnlPercent = totalCost > 0 ? (pnl / totalCost) * 100 : 0;
  return { totalValue, totalCost, pnl, pnlPercent, pricedCount };
}