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

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

/**
 * Shell bersama untuk semua drawer sisi (watchlist, portofolio, alert,
 * diagnostics): backdrop gelap + panel slide-in, tombol tutup, dan
 * dukungan aksesibilitas (role dialog, aria-modal, Escape, **focus trap**).
 *
 * Focus trap: selama drawer terbuka, Tab/Shift+Tab berputar di antara elemen
 * fokus di dalam panel saja, dan fokus dikembalikan ke elemen pemicu saat
 * drawer ditutup.
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
  const panelRef = useRef<HTMLElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement;
    restoreFocusRef.current =
      previouslyFocused instanceof HTMLElement ? previouslyFocused : null;
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;
      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((element) => element.offsetParent !== null);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || active === panel)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      restoreFocusRef.current?.focus();
      restoreFocusRef.current = null;
    };
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
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel ?? title}
        className={`animate-drawer-in fixed inset-y-0 right-0 z-50 flex ${width} max-w-[85vw] flex-col border-l border-border bg-panel pb-[env(safe-area-inset-bottom,0px)] shadow-card`}
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
