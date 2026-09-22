"use client";

import { useEffect, useRef, useState } from "react";

import {
  WS_RECONNECT_MAX_DELAY_MS,
  WS_RECONNECT_MIN_DELAY_MS,
  WS_CONNECT_TIMEOUT_MS,
  TICKER_BATCH_FLUSH_MS,
} from "@/lib/constants";
import { buildStreamUrl, parseTickerMessage } from "@/lib/binance/ws";
import type { CombinedStreamMessage } from "@/lib/binance/ws";
import { endpointIndexOf, endpointOf, loadSavedEndpoint, saveGoodEndpoint } from "@/lib/wsEndpoint";
import { createBatchFlusher, type BatchFlusher } from "@/lib/batcher";
import type { ConnectionStatus, TickerWS } from "@/types";

export function getReconnectDelay(
  attempts: number,
  max = WS_RECONNECT_MAX_DELAY_MS,
): number {
  return Math.min(WS_RECONNECT_MIN_DELAY_MS * 2 ** attempts, max);
}

interface UseBinanceWSOptions {
  symbols: string[];
  onTickers: (tickers: TickerWS[]) => void;
  onStatusChange: (status: ConnectionStatus) => void;
  retryCounter?: number;
}

export function useBinanceWS({
  symbols,
  onTickers,
  onStatusChange,
  retryCounter = 0,
}: UseBinanceWSOptions) {
  const [status, setStatus] = useState<ConnectionStatus>("connecting");

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const endpointIndexRef = useRef<number>(endpointIndexOf(loadSavedEndpoint()));
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const connectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const manualCloseRef = useRef(false);
  const batcherRef = useRef<BatchFlusher<TickerWS> | null>(null);

  const onTickersRef = useRef(onTickers);
  const onStatusChangeRef = useRef(onStatusChange);
  const symbolsKey = symbols.join(",");

  useEffect(() => {
    onTickersRef.current = onTickers;
    onStatusChangeRef.current = onStatusChange;
  }, [onTickers, onStatusChange]);

  useEffect(() => {
    const batcher = createBatchFlusher<TickerWS>(
      (batch) => onTickersRef.current(batch),
      TICKER_BATCH_FLUSH_MS,
    );
    batcherRef.current = batcher;

    const connect = () => {
      manualCloseRef.current = false;
      setStatus("connecting");
      onStatusChangeRef.current("connecting");

      const endpoint = endpointOf(endpointIndexRef.current);
      const socket = new WebSocket(buildStreamUrl(endpoint, symbols));
      socketRef.current = socket;

      connectTimerRef.current = setTimeout(() => {
        if (socket.readyState === WebSocket.OPEN) return;
        socket.close();
      }, WS_CONNECT_TIMEOUT_MS);

      socket.onopen = () => {
        if (connectTimerRef.current) clearTimeout(connectTimerRef.current);
        reconnectAttemptsRef.current = 0;
        saveGoodEndpoint(endpoint);
        setStatus("online");
        onStatusChangeRef.current("online");
      };

      socket.onmessage = (event: MessageEvent<string>) => {
        try {
          const raw = JSON.parse(event.data) as CombinedStreamMessage;
          const ticker = parseTickerMessage(raw.data);
          if (ticker) batcher.enqueue(ticker);
        } catch {
          // Pesan tidak valid — abaikan.
        }
      };

      socket.onerror = () => {
        socket.close();
      };

      socket.onclose = () => {
        if (manualCloseRef.current) return;
        if (connectTimerRef.current) clearTimeout(connectTimerRef.current);

        endpointIndexRef.current += 1;

        const attempts = reconnectAttemptsRef.current;
        const delay = getReconnectDelay(attempts);
        reconnectAttemptsRef.current += 1;

        setStatus("reconnecting");
        onStatusChangeRef.current("reconnecting");

        reconnectTimerRef.current = setTimeout(connect, delay);
      };
    };

    connect();

    return () => {
      manualCloseRef.current = true;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (connectTimerRef.current) clearTimeout(connectTimerRef.current);
      socketRef.current?.close();
      batcher.flushNow();
      batcher.dispose();
      batcherRef.current = null;
      setStatus("offline");
      onStatusChangeRef.current("offline");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbolsKey, retryCounter]);

  return { status };
}