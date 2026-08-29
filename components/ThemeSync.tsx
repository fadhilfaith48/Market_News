"use client";

import { useEffect } from "react";

import { useUIStore } from "@/store/uiStore";

export function ThemeSync() {
  const theme = useUIStore((state) => state.theme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return null;
}