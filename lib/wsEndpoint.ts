import {
  BINANCE_WS_ENDPOINTS,
  WS_ENDPOINT_STORAGE_KEY,
} from "@/lib/constants";
import { getItem, setItem } from "@/lib/storage";

export function loadSavedEndpoint(): string {
  const saved = getItem<string>(WS_ENDPOINT_STORAGE_KEY);
  if (saved && (BINANCE_WS_ENDPOINTS as readonly string[]).includes(saved)) {
    return saved;
  }
  return BINANCE_WS_ENDPOINTS[0];
}

export function saveGoodEndpoint(endpoint: string): void {
  setItem(WS_ENDPOINT_STORAGE_KEY, endpoint);
}

export function endpointOf(index: number): string {
  const size = BINANCE_WS_ENDPOINTS.length;
  return BINANCE_WS_ENDPOINTS[((index % size) + size) % size];
}

export function endpointIndexOf(endpoint: string): number {
  const index = BINANCE_WS_ENDPOINTS.indexOf(
    endpoint as (typeof BINANCE_WS_ENDPOINTS)[number],
  );
  return index >= 0 ? index : 0;
}