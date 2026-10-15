"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface DrawerShellProps {
  open: boolean;
  title: string;
  onClose: () => void;
  ariaLabel?: string;
  width?: string;
  children: ReactNode;
  footer?: ReactNode;
}

/**
 * Shell bersama untuk semua drawer sisi (watchlist, portofolio, alert,
 * diagnostics): backdrop gelap + panel slide-in, tombol tutup, dan
 * dukungan aksesibilitas dasar (role dialog, aria-modal, Escape).
 */
export function DrawerShell({
  open,
  title,
  onClose,
  ariaLabel,
  width = "w-[300px]",
  children,
  footer,
}: DrawerShellProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        className="animate-overlay-in fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel ?? title}
        className={`animate-drawer-in fixed inset-y-0 right-0 z-50 flex ${width} max-w-[85vw] flex-col border-l border-border bg-panel shadow-card`}
      >
        <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2.5">
          <h2 className="truncate text-sm font-semibold">{title}</h2>
          <button
            ref={closeRef}
            type="button"
            aria-label={`Tutup ${title.toLowerCase()}`}
            onClick={onClose}
            className="btn-ghost size-8 justify-center p-0 focus-ring"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
        {footer ? (
          <div className="border-t border-border px-3 py-2.5">{footer}</div>
        ) : null}
      </aside>
    </>
  );
}
