"use client";

import { useEffect } from "react";

import { useToastStore, type Toast, type ToastTone } from "@/store/toastStore";

const TOAST_DURATION_MS = 4200;

const TONE_STYLE: Record<ToastTone, { border: string; icon: string }> = {
  success: { border: "border-up", icon: "text-up" },
  error: { border: "border-down", icon: "text-down" },
  warning: { border: "border-warning", icon: "text-warning" },
  info: { border: "border-interactive", icon: "text-interactive" },
};

function ToneIcon({ tone }: { tone: ToastTone }) {
  const className = `size-4 flex-none ${TONE_STYLE[tone].icon}`;
  if (tone === "success") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 6 9 17l-5-5" />
      </svg>
    );
  }
  if (tone === "error") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M15 9l-6 6M9 9l6 6" />
      </svg>
    );
  }
  if (tone === "warning") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
        <path d="M12 9v4M12 17h.01" />
      </svg>
    );
  }
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  );
}

function ToastCard({ toast }: { toast: Toast }) {
  const dismiss = useToastStore((state) => state.dismiss);

  useEffect(() => {
    const timer = window.setTimeout(() => dismiss(toast.id), TOAST_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [toast.id, dismiss]);

  return (
    <div
      role="status"
      className={`pointer-events-auto flex w-full items-start gap-2.5 rounded-xl border bg-panel p-3 shadow-card animate-overlay-in ${TONE_STYLE[toast.tone].border}`}
    >
      <ToneIcon tone={toast.tone} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-snug">{toast.title}</p>
        {toast.description ? (
          <p className="mt-0.5 break-words text-xs text-muted">{toast.description}</p>
        ) : null}
      </div>
      <button
        type="button"
        aria-label="Tutup notifikasi"
        onClick={() => dismiss(toast.id)}
        className="focus-ring flex-none rounded-md p-0.5 text-muted transition-colors hover:text-text"
      >
        <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

/**
 * Wadah toast global — mount sekali di root layout. Posisi kanan bawah,
 * menumpuk ke atas, `aria-live` untuk dibaca screen reader.
 */
export function Toaster() {
  const toasts = useToastStore((state) => state.toasts);

  return (
    <div
      aria-live="polite"
      aria-label="Notifikasi"
      className="pointer-events-none fixed inset-x-3 bottom-3 z-[70] flex flex-col items-end gap-2 sm:inset-x-auto sm:right-4 sm:w-[340px]"
    >
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
