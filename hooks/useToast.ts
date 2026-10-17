"use client";

import { useCallback } from "react";

import { useToastStore, type ToastTone } from "@/store/toastStore";

export type { ToastTone };

/**
 * Helper untuk memunculkan toast dari komponen React.
 * Mengembalikan fungsi `toast(tone, title, description?)`.
 */
export function useToast() {
  const add = useToastStore((state) => state.add);
  return useCallback(
    (tone: ToastTone, title: string, description?: string) =>
      add(tone, title, description),
    [add],
  );
}
