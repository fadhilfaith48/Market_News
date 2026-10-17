"use client";

import { useEffect, useState } from "react";

import { LOG_LEVELS } from "@/lib/monitoring";
import type { DiagnosticEntry, LogLevel } from "@/lib/monitoring";
import { DrawerShell } from "@/components/ui/DrawerShell";
import { useToast } from "@/hooks/useToast";
import { useMonitoringStore } from "@/store/monitoringStore";
import { useUIStore } from "@/store/uiStore";

type Filter = "all" | LogLevel;

const LEVEL_STYLE: Record<LogLevel, string> = {
  error: "text-down",
  warn: "text-warning",
  info: "text-muted",
};

const LEVEL_LABEL: Record<LogLevel, string> = {
  error: "ERROR",
  warn: "WARN",
  info: "INFO",
};

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("id-ID", { hour12: false });
}

function formatEntry(entry: DiagnosticEntry): string {
  const lines = `[${formatTime(entry.ts)}] ${LEVEL_LABEL[entry.level]} ${entry.scope}: ${entry.message}`;
  return entry.detail ? `${lines}\n${entry.detail}` : lines;
}

function LogRow({ entry }: { entry: DiagnosticEntry }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="px-3 py-2">
      <button
        type="button"
        onClick={() => entry.detail && setExpanded((value) => !value)}
        className={`flex w-full items-start gap-2 rounded-lg text-left transition-colors hover:bg-hover focus-ring ${
          entry.detail ? "cursor-pointer" : "cursor-default"
        }`}
      >
        <span className="flex-none pt-0.5 font-mono text-[10px] text-muted tabular-nums">
          {formatTime(entry.ts)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5">
            <span
              className={`flex-none text-[10px] font-semibold ${LEVEL_STYLE[entry.level]}`}
            >
              {LEVEL_LABEL[entry.level]}
            </span>
            <span className="flex-none rounded bg-hover px-1 text-[10px] text-muted">
              {entry.scope}
            </span>
          </span>
          <span className="mt-0.5 block break-words text-[12px]">
            {entry.message}
          </span>
        </span>
        {entry.detail && (
          <span className="flex-none text-[10px] text-muted">
            {expanded ? "▲" : "▼"}
          </span>
        )}
      </button>
      {expanded && entry.detail && (
        <pre className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-page px-2.5 py-1.5 font-mono text-[10px] text-muted">
          {entry.detail}
        </pre>
      )}
    </div>
  );
}

export function DiagnosticsPanel() {
  const open = useUIStore((state) => state.diagnosticsOpen);
  const close = useUIStore((state) => state.setDiagnosticsOpen);
  const entries = useMonitoringStore((state) => state.entries);
  const clear = useMonitoringStore((state) => state.clear);
  const markViewed = useMonitoringStore((state) => state.markViewed);

  const [filter, setFilter] = useState<Filter>("all");
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (open) markViewed();
  }, [open, markViewed]);

  const visible =
    filter === "all"
      ? entries
      : entries.filter((entry) => entry.level === filter);

  const copyLogs = async () => {
    if (entries.length === 0) return;
    const text = entries.map(formatEntry).join("\n\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
      toast("success", "Log disalin", `${entries.length} catatan masuk ke clipboard.`);
    } catch {
      toast("error", "Gagal menyalin", "Clipboard tidak tersedia di browser ini.");
    }
  };

  const clearLogs = () => {
    const count = entries.length;
    clear();
    toast("info", "Log dibersihkan", `${count} catatan dihapus.`);
  };

  const filters: Filter[] = ["all", ...LOG_LEVELS];

  return (
    <DrawerShell
      open={open}
      title="Diagnostics"
      ariaLabel="Diagnostics"
      width="w-[320px]"
      onClose={() => close(false)}
    >
      <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
        <div className="flex gap-0.5 rounded-full bg-hover p-0.5">
          {filters.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={`rounded-full px-2 py-0.5 text-[11px] font-medium capitalize transition-colors ${
                filter === item
                  ? "bg-interactive text-white shadow-card"
                  : "text-muted hover:text-text"
              }`}
            >
              {item === "all" ? "Semua" : item}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {visible.length === 0 ? (
          <p className="rounded-xl border border-border/60 bg-page px-3 py-4 text-xs text-muted">
            {entries.length === 0
              ? "Belum ada catatan. Error runtime dan metrik performa akan muncul di sini."
              : "Tidak ada catatan untuk filter ini."}
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border/60">
            {visible.map((entry) => (
              <div
                key={entry.id}
                className="border-b border-border/50 last:border-b-0"
              >
                <LogRow entry={entry} />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2 border-t border-border px-3 py-2">
        <button
          type="button"
          onClick={copyLogs}
          disabled={entries.length === 0}
          className="btn-ghost focus-ring flex-1 justify-center disabled:cursor-not-allowed disabled:opacity-50"
        >
          {copied ? "Tersalin" : "Salin"}
        </button>
        <button
          type="button"
          onClick={clearLogs}
          disabled={entries.length === 0}
          className="btn-ghost focus-ring flex-1 justify-center disabled:cursor-not-allowed disabled:opacity-50"
        >
          Bersihkan
        </button>
      </div>
    </DrawerShell>
  );
}
