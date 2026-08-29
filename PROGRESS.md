# PROGRESS — Crypto Market Web App

Log progres per sesi/tanggal. **File ini adalah sumber kebenaran untuk posisi terakhir pekerjaan** — cek di sini dulu sebelum mulai sesi baru.

Format entri baru (ikuti pola yang sama):

```md
## [Tanggal]
### Ketik koinota gaya: Done / In Progress / Blocked
- [x] Deskripsi yang selesai
- [ ] Deskripsi yang sedang/akan dikerjakan
- Catatan / blocker / hal yang perlu diperhatikan
```

---

## 29 Agustus 2026 — Sesi Inisialisasi Dokumen

### Status: Done (fase setup dokumentasi)

- [x] Menyusun PRD versi 1.0 (visi, fitur, scope, NFR, milestone) — file `PRD.md`
- [x] Menyusun ARCHITECTURE.md (tech stack, struktur folder, alur data, keputusan desain)
- [x] Menyusun TASKS.md (checklist tugas per fase)
- [x] Menyusun DECISIONS.md (catatan keputusan yang sudah diambil)
- [x] Menyusun BUGS.md (daftar known-issue / risiko yang dipantau)
- [x] Menyusun PROGRESS.md (file ini)

### Catatan
- **Belum ada kode apa pun.** Project masih berupa kumpulan dokumen perencanaan.
- Fase berikutnya (sesi coding): Fase 2 — setup project Next.js + integrasi WebSocket Binance (lihat TASKS.md).
- Stack final (dari DECISIONS.md): Next.js (TS) + Tailwind + Zustand + React Query + TradingView Lightweight Charts, deploy Vercel.
- Rename file PRD: `PRD_Crypto_Market_Web.md` → `PRD.md`.

---

## 29 Agustus 2026 — Sesi 1: Scaffold Project + Integrasi WebSocket Binance

### Status: Done (Milestone A selesai)

- [x] Scaffold Next.js 16.3.3 (TypeScript + Tailwind 4 + App Router + ESLint), package `market-news`, install `zustand`
- [x] Hapus `CLAUDE.md` bawaan create-next-app (sesuai permintaan, tidak pakai file Claude); `AGENTS.md` dibiarkan (dikelola `next dev`)
- [x] Struktur folder sesuai ARCHITECTURE.md: `components/`, `hooks/`, `lib/`, `store/`, `types/`
- [x] `types/index.ts` → `TickerWS`, `Coin`, `Kline`, `ConnectionStatus`, `Theme`
- [x] `lib/constants.ts` → URL WS Binance, 20 simbol default, key storage
- [x] `lib/format.ts` (format harga/percent/compact) + `lib/storage.ts` (wrapper Local Storage)
- [x] `lib/binance/ws.ts` → `buildStreamUrl` & `parseTickerMessage`
- [x] `hooks/useBinanceWS.ts` → koneksi + auto-reconnect (backoff 1s→30s) + status
- [x] `store/marketStore.ts` (ticker real-time) + `store/uiStore.ts` (theme/currency/status, persist)
- [x] `components/dashboard/MarketDataProvider.tsx` (satu koneksi WS di root layout)
- [x] `components/ui/ConnectionBadge.tsx`, `components/layout/Header.tsx` (toggle dark/light), `components/ThemeSync.tsx`
- [x] `components/dashboard/TickerTable.tsx` (tabel harga live) + halaman utama
- [x] Verifikasi: `npm run build` OK, `npm run lint` OK, dev server respons HTTP 200

> Posisi & langkah selanjutnya yang terbaru: lihat bagian **Sesi 1.6** di bawah.

---

### Catatan Sesi 1
- Dev server sempat tersisa berjalan saat tes — sudah dimatikan via `taskkill` (port 3031).
- `dark` mode default; preferensi disimpan di Local Storage key `crypto-ui`.

---

## 29 Agustus 2026 — Sesi 1.5: Fix hydration mismatch (font)

### Status: Done
- [x] Diagnosa: error "tree hydrated but attributes didn't match" muncul karena class modul `next/font` (`geist_*`) di `<html>` berbeda antara server & client di dev Turbopack (BUG-001)
- [x] Fix: lepas `next/font/google` (Geist & Geist_Mono) → system font stack di `globals.css` (`--font-sans`/`--font-mono`); `<html class="h-full antialiased">`
- [x] Verifikasi: `npm run build` OK, `npm run lint` OK, `curl` HTML bersih dari `geist`, HTTP 200
- [x] Update DECISIONS.md (keputusan font) & BUGS.md (BUG-001 Fixed)

---

## 29 Agustus 2026 — Sesi 1.6: Fix hydration (theme) + koneksi WS keblokir jaringan

### Status: Done
- [x] Hydration mismatch #2: script anti-flash menambah class `dark` ke `<html>` sebelum React hydrate → tambah `suppressHydrationWarning` di `<html>` (pola standar next-themes)
- [x] Lint error `react-hooks/set-state-in-effect` → ganti pola `mounted` state dengan `hooks/useHydrated.ts` (pakai `useSyncExternalStore`)
- [x] Diagnosa "Menghubungkan…/Menyambung ulang…" tak kunjung Live: **jaringan user memblokir `stream.binance.com` & `api.binance.com`** (REST GAGAL, WS ERROR) — `data-stream.binance.vision` CONNECTED
- [x] Fix: multi-endpoint + rotasi fallback otomatis di `useBinanceWS` & `lib/binance/ws.ts` (stream.binance.com → binance.vision)
- [x] Verifikasi: `npm run build` OK, `npm run lint` OK, dev HTTP 200
- [x] Update DECISIONS.md (multi-endpoint), BUGS.md (KI-003 update)

### Posisi Saat Ini
- **Fase 2 (Setup):** selesai kecuali Vercel deployment, adapter CoinGecko, React Query, `.env.local`.
- **Fase 3 (Fitur Inti):** TickerTable dasar dari WS (sumber: Multi-endpoint Binance). LiveTicker, highlight animasi, top gainers/losers, data CoinGecko, dan halaman detail koin belum dibuat.

### Langkah Selanjutnya (Milestone B)
1. Setup **React Query** (+ provider di root layout)
2. Integrasi **CoinGecko REST** via adapter + API Route `/api/coins` (karena `api.binance.com` diblokir di jaringan user, REST Binance wajib via serverless)
3. Upgrade TickerTable (nama koin, image, market cap, sort) + LiveTicker marquee
4. Highlight animasi naik/turun harga
5. Update TASKS.md / PROGRESS.md / BUGS.md di akhir

## 29 Agustus 2026 — Sesi 1.7: Branding — custom logo crypto & favicon

### Status: Done
- [x] `app/icon.svg` — logo candlestick hijau di badge gelap, dipakai sebagai favicon (hapus `app/favicon.ico` bawaan agar SVG dipakai)
- [x] `components/layout/Logo.tsx` — SVG `currentColor` (menyesuaikan tema terang/gelap), dipakai di Header berdampingan teks "Market News"
- [x] Verifikasi: `npm run build` OK, `npm run lint` OK, HTML memuat `<link rel="icon" href="/icon.svg" type="image/svg+xml">`, logo tampil di header
- [x] Commit + push ke GitHub: `feat: custom logo & favicon crypto`

## 29 Agustus 2026 — Sesi 1.8: Logo koin di tabel (favicon tetap)

### Status: Done
- [x] `lib/coinMeta.ts` — pemetaan simbol → kode/nama/logo (18 logo SVG atomiclabs via jsDelivr + override SHIB/NEAR pakai gambar CoinGecko — semuanya terverifikasi HTTP 200)
- [x] `components/ui/CoinIcon.tsx` — logo koin dengan fallback inisial berwarna saat gagal load
- [x] Tabel: kolom "Koin" → logo + kode (mis. logo Bitcoin + "BTC")
- [x] Verifikasi: `npm run build` OK, `npm run lint` OK
- [x] Commit + push ke GitHub

---

## 29 Agustus 2026 — Milestone C: Halaman Detail Koin + Candlestick Real-time

### Status: Done
- [x] Instal `lightweight-charts@^5.2.1` + `@tanstack/react-query@^5.102.8` di dependencies
- [x] `lib/constants.ts` → `TIMEFRAMES` (1m…1w) + tipe `Timeframe`, `KLINE_DEFAULT_INTERVAL` (5m), `KLINE_LIMIT` (500), `BINANCE_MARKET_DATA_BASE` (`data-api.binance.vision`)
- [x] `types/index.ts` → interface `LiveKline` (pakai `k.x` `closed`)
- [x] `lib/binance/ws.ts` → `buildKlineStreamUrl` + `parseKlineMessage` (+ `RawKlineMessage`); URL stream `{symbol}@kline_{interval}`
- [x] `app/api/klines/route.ts` → proxy GET klines (validasi simbol/interval, limit clamp 100–1000, `fetch` + `next.revalidate: 60`)
- [x] `components/providers/QueryProvider.tsx` → React Query, dibungkus di `app/layout.tsx` (di luar `MarketDataProvider`)
- [x] `hooks/useKlines.ts` (queryKey `["klines",symbol,interval]`, `keepPreviousData`) + `hooks/useKlineStream.ts` (rotasi endpoint + backoff 1s→30s, filter interval)
- [x] `components/coin/PriceChart.tsx` (lightweight-charts v5, `CandlestickSeries`, theme-aware, `setData` historis + `update` candle live dengan merge OHLC)
- [x] `components/coin/CoinDetail.tsx` + `CoinDetailStats.tsx` (header koin, harga live dari store, stat 24j, timeswitch, indeks status live)
- [x] `app/coin/[code]/page.tsx` → `generateStaticParams`, `generateMetadata`, validasi `code`
- [x] `TickerTable.tsx` → baris jadi klik → `router.push('/coin/{code}')` + hover
- [x] Verifikasi: `npm run build` OK (25 route, SSG untuk 20 halaman koin), `npm run lint` OK, `/api/klines` 200, `/coin/BTC` 200
- [x] Commit + push ke GitHub

### Catatan
- **`use cache` / `cacheLife` butuh flag `cacheComponents`** di next.config → tidak dipakai; pakai model caching lama via `fetch(url, { next: { revalidate: 60 } })` (lihat `caching-without-cache-components.md`).
- Rule lint baru `react-hooks/refs` menolak akses `ref.current` saat render → pola "set ref di dalam `useEffect`" (contoh: `liveRef`, `onCandleRef`).
- Cast `CombinedStreamMessage.data` → `as unknown as RawKlineMessage` (tipe gabungan paksa ke tipe kline).
- Status "Grafik live / Menyambung ulang…" bersumber dari state `open` hook kline-stream (bukan ticker). Timeframe default 5m (ID).
- Statistik tetap dari ticker WS; market cap CoinGecko tetap ditunda (keputusan sesi sebelumnya).

---

<!-- 
Template entri selanjutnya — salin & isi di atas baris ini:

## 30 Agustus 2026 — Sesi Setup Project
- [x] npx create-next-app ...
- [ ] ...
-->