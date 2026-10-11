import { MAX_LOG_ENTRIES } from "@/lib/constants";

export type LogLevel = "info" | "warn" | "error";

export const LOG_LEVELS: LogLevel[] = ["info", "warn", "error"];

export interface DiagnosticEntry {
  id: string;
  ts: number;
  level: LogLevel;
  scope: string;
  message: string;
  detail?: string;
}

const MAX_MESSAGE_LENGTH = 300;
const MAX_DETAIL_LENGTH = 1000;

function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max)}…` : value;
}

function makeId(ts: number): string {
  return `${ts.toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createLogEntry(
  level: LogLevel,
  scope: string,
  message: string,
  detail?: string,
): DiagnosticEntry {
  const ts = Date.now();
  const entry: DiagnosticEntry = {
    id: makeId(ts),
    ts,
    level,
    scope,
    message: truncate(message || "(tanpa pesan)", MAX_MESSAGE_LENGTH),
  };
  if (detail) entry.detail = truncate(detail, MAX_DETAIL_LENGTH);
  return entry;
}

export function appendLog(
  entries: DiagnosticEntry[],
  entry: DiagnosticEntry,
  max: number = MAX_LOG_ENTRIES,
): DiagnosticEntry[] {
  const next = [...entries, entry];
  return next.length > max ? next.slice(next.length - max) : next;
}

export function describeError(value: unknown): string {
  if (value instanceof Error) return value.message || value.name || "Error";
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

export function errorToEntry(
  scope: string,
  error: unknown,
  context?: string,
): DiagnosticEntry {
  const stack = error instanceof Error ? error.stack : undefined;
  const detail = [stack, context].filter(Boolean).join("\n\n");
  return createLogEntry("error", scope, describeError(error), detail || undefined);
}

export function captureErrorContext(extra?: string): string {
  if (typeof window === "undefined") return extra ?? "";
  const parts = [
    `route=${window.location?.pathname ?? "-"}`,
    `online=${typeof navigator !== "undefined" ? navigator.onLine : true}`,
  ];
  if (typeof navigator !== "undefined" && navigator.userAgent) {
    parts.push(`ua=${navigator.userAgent}`);
  }
  if (extra) parts.push(extra);
  return parts.join("\n");
}

export function isLogLevel(value: unknown): value is LogLevel {
  return value === "info" || value === "warn" || value === "error";
}

export function countErrors(entries: DiagnosticEntry[]): number {
  return entries.reduce(
    (total, entry) => (entry.level === "error" ? total + 1 : total),
    0,
  );
}

export function countUnseenErrors(
  entries: DiagnosticEntry[],
  viewedAt: number,
): number {
  return entries.reduce(
    (total, entry) =>
      entry.level === "error" && entry.ts > viewedAt ? total + 1 : total,
    0,
  );
}

export function sanitizeLogs(raw: unknown): DiagnosticEntry[] {
  if (!Array.isArray(raw)) return [];
  const result: DiagnosticEntry[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const entry = item as Record<string, unknown>;
    const { id, ts, level, scope, message, detail } = entry;
    if (typeof id !== "string") continue;
    if (typeof ts !== "number" || !Number.isFinite(ts)) continue;
    if (!isLogLevel(level)) continue;
    if (typeof scope !== "string") continue;
    if (typeof message !== "string") continue;
    const sanitized: DiagnosticEntry = { id, ts, level, scope, message };
    if (typeof detail === "string" && detail) sanitized.detail = detail;
    result.push(sanitized);
  }
  return result.slice(-MAX_LOG_ENTRIES);
}
