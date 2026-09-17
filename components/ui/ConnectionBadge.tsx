"use client";

import { useUIStore } from "@/store/uiStore";
import type { ConnectionStatus } from "@/types";

const CONFIG: Record<
  ConnectionStatus,
  { label: string; dot: string }
> = {
  connecting: { label: "Menghubungkan…", dot: "bg-warning" },
  online: { label: "Live", dot: "bg-up" },
  reconnecting: { label: "Menyambung ulang…", dot: "bg-warning" },
  offline: { label: "Offline", dot: "bg-down" },
};

export function ConnectionBadge({ className = "" }: { className?: string }) {
  const status = useUIStore((state) => state.connectionStatus);
  const dataSource = useUIStore((state) => state.dataSource);
  const { label, dot } = CONFIG[status];

  return (
    <span
      role="status"
      aria-label={label}
      title={label}
      className={`inline-flex items-center gap-1.5 whitespace-nowrap text-xs text-muted ${className}`}
    >
      <span className={`size-2 animate-pulse rounded-full ${dot}`} />
      <span className="hidden lg:inline">{label}</span>
      {dataSource === "rest" && (
        <span className="hidden text-muted lg:inline">· REST</span>
      )}
    </span>
  );
}