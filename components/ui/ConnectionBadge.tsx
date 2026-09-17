"use client";

import { useUIStore } from "@/store/uiStore";
import type { ConnectionStatus } from "@/types";

const CONFIG: Record<ConnectionStatus, { label: string; dot: string }> = {
  connecting: { label: "Menghubungkan…", dot: "bg-warning" },
  online: { label: "Live", dot: "bg-up" },
  reconnecting: { label: "Menyambung ulang…", dot: "bg-warning" },
  offline: { label: "Terputus", dot: "bg-down" },
};

export function ConnectionBadge({
  compact = false,
  className = "",
}: {
  compact?: boolean;
  className?: string;
}) {
  const status = useUIStore((state) => state.connectionStatus);
  const dataSource = useUIStore((state) => state.dataSource);
  const { label, dot } = CONFIG[status];

  if (compact) {
    return (
      <span
        role="status"
        aria-label={label}
        title={label}
        className={`inline-flex items-center ${className}`}
      >
        <span className={`size-2 animate-pulse rounded-full ${dot}`} />
      </span>
    );
  }

  return (
    <span
      role="status"
      className={`inline-flex items-center gap-1.5 text-xs text-muted ${className}`}
    >
      <span className={`size-2 animate-pulse rounded-full ${dot}`} />
      {label}
      {dataSource === "rest" && <span className="text-muted">· REST</span>}
    </span>
  );
}
