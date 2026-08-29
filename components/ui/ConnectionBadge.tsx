"use client";

import { useUIStore } from "@/store/uiStore";
import type { ConnectionStatus } from "@/types";

const CONFIG: Record<ConnectionStatus, { label: string; dot: string }> = {
  connecting: { label: "Menghubungkan…", dot: "bg-yellow-400" },
  online: { label: "Live", dot: "bg-green-500" },
  reconnecting: { label: "Menyambung ulang…", dot: "bg-orange-400" },
  offline: { label: "Terputus", dot: "bg-red-500" },
};

export function ConnectionBadge() {
  const status = useUIStore((state) => state.connectionStatus);
  const { label, dot } = CONFIG[status];

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
      <span className={`size-2 animate-pulse rounded-full ${dot}`} />
      {label}
    </span>
  );
}