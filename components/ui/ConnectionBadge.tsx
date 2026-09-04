"use client";

import { useUIStore } from "@/store/uiStore";
import type { ConnectionStatus } from "@/types";

const CONFIG: Record<ConnectionStatus, { label: string; dot: string }> = {
  connecting: { label: "Menghubungkan…", dot: "bg-warning" },
  online: { label: "Live", dot: "bg-up" },
  reconnecting: { label: "Menyambung ulang…", dot: "bg-warning" },
  offline: { label: "Terputus", dot: "bg-down" },
};

export function ConnectionBadge() {
  const status = useUIStore((state) => state.connectionStatus);
  const { label, dot } = CONFIG[status];

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted">
      <span className={`size-2 animate-pulse rounded-full ${dot}`} />
      {label}
    </span>
  );
}
