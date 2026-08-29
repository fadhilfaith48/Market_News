"use client";

import { useEffect, useRef, useState } from "react";

import { BINANCE_WS_ENDPOINTS } from "@/lib/constants";
import { buildStreamUrl, parseTickerMessage } from "@/lib/binance/ws";
import type { CombinedStreamMessage } from "@/lib/binance/ws";
import type { ConnectionStatus, TickerWS } from "@/types";

const RECONNECT_MIN_DELAY_MS = 1_000;
const RECONNECT_MAX_DELAY_MS = 30_000;

interface UseBinanceWSOptions {
  symbols: string[];
  onTicker: (ticker: TickerWS) => void;
  onStatusChange: (status: ConnectionStatus) => void;
}

export function useBinanceWS({
  symbols,
  onTicker,
  onStatusChange,
}: UseBinanceWSOptions) {
  const [status, setStatus] = useState<ConnectionStatus>("connecting");

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const endpointIndexRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const manualCloseRef = useRef(false);

  const onTickerRef = useRef(onTicker);
  const onStatusChangeRef = useRef(onStatusChange);
  const symbolsKey = symbols.join(",");

  useEffect(() => {
    onTickerRef.current = onTicker;
    onStatusChangeRef.current = onStatusChange;
  }, [onTicker, onStatusChange]);

  useEffect(() => {
    const connect = () => {
      manualCloseRef.current = false;
      setStatus("connecting");
      onStatusChangeRef.current("connecting");

      const endpoint =
        BINANCE_WS_ENDPOINTS[
          endpointIndexRef.current % BINANCE_WS_ENDPOINTS.length
        ];
      const socket = new WebSocket(buildStreamUrl(endpoint, symbols));
      socketRef.current = socket;

      socket.onopen = () => {
        reconnectAttemptsRef.current = 0;
        endpointIndexRef.current = 0;
        setStatus("online");
        onStatusChangeRef.current("online");
      };

      socket.onmessage = (event: MessageEvent<string>) => {
        try {
          const raw = JSON.parse(event.data) as CombinedStreamMessage;
          const ticker = parseTickerMessage(raw.data);
          if (ticker) onTickerRef.current(ticker);
        } catch {
          // Pesan tidak valid — abaikan.
        }
      };

      socket.onerror = () => {
        socket.close();
      };

      socket.onclose = () => {
        if (manualCloseRef.current) return;

        endpointIndexRef.current =
          (endpointIndexRef.current + 1) % BINANCE_WS_ENDPOINTS.length;

        const attempts = reconnectAttemptsRef.current;
        const delay = Math.min(
          RECONNECT_MIN_DELAY_MS * 2 ** attempts,
          RECONNECT_MAX_DELAY_MS,
        );
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
      socketRef.current?.close();
      setStatus("offline");
      onStatusChangeRef.current("offline");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbolsKey]);

  return { status };
}