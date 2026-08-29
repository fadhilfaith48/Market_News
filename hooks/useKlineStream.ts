"use client";

import { useEffect, useRef, useState } from "react";

import { buildKlineStreamUrl, parseKlineMessage } from "@/lib/binance/ws";
import type { CombinedStreamMessage, RawKlineMessage } from "@/lib/binance/ws";
import { BINANCE_WS_ENDPOINTS } from "@/lib/constants";
import type { LiveKline } from "@/types";

const RECONNECT_MIN_DELAY_MS = 1_000;
const RECONNECT_MAX_DELAY_MS = 30_000;

export function useKlineStream(
  symbol: string,
  interval: string,
  onCandle: (candle: LiveKline) => void,
) {
  const [open, setOpen] = useState(false);

  const socketRef = useRef<WebSocket | null>(null);
  const endpointIndexRef = useRef(0);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const manualCloseRef = useRef(false);

  const onCandleRef = useRef(onCandle);

  useEffect(() => {
    onCandleRef.current = onCandle;
  }, [onCandle]);

  useEffect(() => {
    const connect = () => {
      manualCloseRef.current = false;
      setOpen(false);

      const endpoint =
        BINANCE_WS_ENDPOINTS[
          endpointIndexRef.current % BINANCE_WS_ENDPOINTS.length
        ];
      const socket = new WebSocket(
        buildKlineStreamUrl(endpoint, symbol, interval),
      );
      socketRef.current = socket;

      socket.onopen = () => {
        reconnectAttemptsRef.current = 0;
        endpointIndexRef.current = 0;
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

        endpointIndexRef.current =
          (endpointIndexRef.current + 1) % BINANCE_WS_ENDPOINTS.length;

        const attempts = reconnectAttemptsRef.current;
        const delay = Math.min(
          RECONNECT_MIN_DELAY_MS * 2 ** attempts,
          RECONNECT_MAX_DELAY_MS,
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
      socketRef.current?.close();
      setOpen(false);
    };
  }, [symbol, interval]);

  return { open };
}