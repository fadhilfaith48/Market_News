import type { MetadataRoute } from "next";

import { VALID_CODES } from "@/lib/constants";
import { SITE_URL } from "@/lib/site";

/**
 * Sitemap: halaman utama + satu entri per koin yang didukung.
 * `VALID_CODES` diturunkan dari `DEFAULT_SYMBOLS` (50 koin).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: `${SITE_URL}/`,
      lastModified,
      changeFrequency: "daily",
      priority: 1,
    },
    ...Array.from(VALID_CODES).map((code) => ({
      url: `${SITE_URL}/coin/${code}`,
      lastModified,
      changeFrequency: "hourly" as const,
      priority: 0.7,
    })),
  ];
}
