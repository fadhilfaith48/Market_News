import type { Metadata } from "next";

import { CoinDetail } from "@/components/coin/CoinDetail";
import { COIN_NAMES } from "@/lib/coinMeta";
import { DEFAULT_SYMBOLS } from "@/lib/constants";

export function generateStaticParams() {
  return [...DEFAULT_SYMBOLS].map((symbol) => ({
    code: symbol.replace("USDT", ""),
  }));
}

interface Props {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const name = COIN_NAMES[code] ?? code;
  return {
    title: `${name} (${code}) — Market News`,
    description: `Harga real-time dan grafik candlestick ${code} (${name}).`,
  };
}

export default async function CoinPage({ params }: Props) {
  const { code } = await params;
  return <CoinDetail code={code.toUpperCase()} />;
}