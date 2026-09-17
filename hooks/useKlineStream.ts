"use client";

import { useEffect, useRef, useState } from "react";

import { buildKlineStreamUrl, parseKlineMessage } from "@/lib/binance/ws";
import type { CombinedStreamMessage, RawKlineMessage } from "@/lib/binance/ws";
import {
  WS_CONNECT_TIMEOUT_MS,
  WS_RECONNECT_MAX_DELAY_MS,
  WS_RECONNECT_MIN_DELAY_MS,
} from "@/lib/constants";
import {
  endpointIndexOf,
  endpointOf,
  loadSavedEndpoint,
  saveGoodEndpoint,
} from "@/lib/wsEndpoint";
import type { LiveKline } from "@/types";

export function useKlineStream(
  symbol: string,
  interval: string,
  onCandle: (candle: LiveKline) => void,
) {
  const [open, setOpen] = useState(false);

  const socketRef = useRef<WebSocket | null>(null);
  const endpointIndexRef = useRef<number>(endpointIndexOf(loadSavedEndpoint()));
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const connectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const manualCloseRef = useRef(false);

  const onCandleRef = useRef(onCandle);

  useEffect(() => {
    onCandleRef.current = onCandle;
  }, [onCandle]);

  useEffect(() => {
    const connect = () => {
      manualCloseRef.current = false;
      setOpen(false);

      const endpoint = endpointOf(endpointIndexRef.current);
      const socket = new WebSocket(
        buildKlineStreamUrl(endpoint, symbol, interval),
      );
      socketRef.current = socket;

      connectTimerRef.current = setTimeout(() => {
        if (socket.readyState === WebSocket.OPEN) return;
        socket.close();
      }, WS_CONNECT_TIMEOUT_MS);

      socket.onopen = () => {
        if (connectTimerRef.current) clearTimeout(connectTimerRef.current);
        reconnectAttemptsRef.current = 0;
        saveGoodEndpoint(endpoint);
        setOpen(true);
      };

      socket.onmessage = (event: MessageEvent<string>) => {
        try {
          const raw = JSON.parse(event.data) as CombinedStreamMessage;
          const candle = parseKlineMessage(
            raw.data as unknown as RawKlineMessage,
          );
          if (candle && candle.interval === interval) {
            onCandleRef.current(candle);
          }
        } catch {
          // abaikan pesan tidak valid
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
        const delay = Math.min(
          WS_RECONNECT_MIN_DELAY_MS * 2 ** attempts,
          WS_RECONNECT_MAX_DELAY_MS,
        );
        reconnectAttemptsRef.current += 1;

        setOpen(false);
        reconnectTimerRef.current = setTimeout(connect, delay);
      };
    };

    connect();

    return () => {
      manualCloseRef.current = true;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (connectTimerRef.current) clearTimeout(connectTimerRef.current);
      socketRef.current?.close();
      setOpen(false);
    };
  }, [symbol, interval]);

  return { open };
}