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

## 29 Agustus 2026 — Milestone D (Sesi Desain): Standar Desain UI/UX

### Status: Done (fokus desain; fitur D13.7 ditunda ke tahap fitur)
- [x] `app/globals.css` — keyframes `flash-up`/`flash-down` (450ms) + `shimmer` (+ custom props `--shimmer-base`/`--shimmer-hover` per tema)
- [x] `store/marketStore.ts` — tambah `previousLastPrice` map (harga sebelum update) untuk deteksi arah flash tanpa timer/ref
- [x] `lib/format.ts` — `formatPrice` aturan bertingkat (staircase): `≥1000`→compact, `≥1`→2 desimal, `<1 & ≥0.01`→4 desimal, `<0.01`→sig-digit gaya CMC (`formatMicroPrice`) — **menutup BUG-003 (SHIB)**
- [x] `hooks/useBinanceWS.ts` — opsi `retryCounter` (perubahan nilai → reconnect paksa)
- [x] `components/dashboard/marketDataContext.ts` + `MarketDataProvider.tsx` — `retryConnection` via React Context
- [x] `components/dashboard/TickerTable.tsx` — warna % 3 arah (flat=abu), flash sel Harga (key remount + CSS anim), volume `formatCompact`, skeleton shimmer saat loading, error+Retry saat offline, **card list mobile** (`sm:hidden`) + tabel desktop
- [x] `components/coin/CoinDetail.tsx` + `CoinDetailStats.tsx` — warna % 3 arah, skeleton chart shimmer, tombol Retry (refetch) saat klines error
- [x] Verifikasi: `npm run build` OK (25 route), `npm run lint` OK, dev `/` & `/coin/BTC` HTTP 200
- [ ] (defer) D13.7 navbar: search bar + currency selector → Milestone D no. 4 & 6 (tahap fitur)
- [x] Unit test formatter — dituntaskan 31 Agustus (Milestone D no. 2, lihat entri bawah)

### Catatan
- Flash harga diimplementasikan tanpa state/effect timer (hindari rule lint `react-hooks/refs` & `set-state-in-effect`): arah dari `previousLastPrice`, replay animasi lewat `key` yang berubah saat harga berganti.
- `offline` (state WS) hampir tak pernah tampil tanpa intervensi manual (hook terus auto-reconnect) — Retry berguna terutama saat jaringan user kembal; error state klines di detail halaman lebih sering terlihat (tombol Retry → `refetch`).

---

## 31 Agustus 2026 — Milestone D no. 1, 2, 3 & 5 (MATIC→POL, unit test formatter, watchlist dasar)

### Status: Done
- [x] **no.1 BUG MATIC→POL**: `MATICUSDT` → `POLUSDT` di `DEFAULT_SYMBOLS`; `COIN_NAMES.POL` = "Polygon (POL)"; `LOGO_OVERRIDES.POL` = atomiclabs `poly.svg` (hasil cek: `pol.svg` 404, `poly.svg` 200, CoinGecko 403 → tidak dipakai)
- [x] **no.1 verifikasi**: ticker `POLUSDT` live via `data-api.binance.vision` (price OK), `/api/klines?symbol=POLUSDT` 200, `/coin/POL` 200, `/coin/MATIC` → **404** (`dynamicParams = false` di `app/coin/[code]/page.tsx`)
- [x] **no.2 setup test**: **Vitest 4** (`npm i -D vitest`, `vitest.config.mts`, script `"test": "vitest run"`) + `tests/format.test.ts` — 12 tes pass (0 / <0.01 / 0.01–1 / ≥1 / ≥1000 / NaN + `formatPercent`/`formatCompact`)
- [x] **no.3+5 fondasi watchlist**: `store/watchStore.ts` (Zustand persist `crypto-watchlist`, `codes`+`toggle`+`useIsWatched`); `uiStore` + `watchlistOpen`/`setWatchlistOpen` (tidak di-persist)
- [x] `components/ui/WatchStar.tsx` — ☆/★, `stopPropagation`+`preventDefault`, hidrasi `useHydrated`; dipasang di `TickerTable` (sel "Koin" desktop + card mobile) & `CoinDetail` (samping kode)
- [x] `components/watchlist/WatchlistPanel.tsx` — drawer kanan 300px (toggle di Header), grouping kolaps "Watchlist Saya / Top Gainers / Semua Koin", highlight koin aktif (`usePathname`), klik → `/coin/{code}`, state kosong + hint; **mount di `app/layout.tsx`** (global)
- [x] `Header.tsx` — tombol "Watchlist" (toggle, `aria-pressed`)
- [x] Verifikasi: `npm run lint` OK, `npm test` 12/12, `npm run build` OK (25 route), dev `/` & `/coin/POL` HTTP 200

### Catatan
- Watchlist sementara **hanya dari 20 koin `DEFAULT_SYMBOLS`** (codes disaring list itu agar tak ada link mati).
- Panel watchlist memakai styling lama (zinc) — **belum restyle TV**; itu bagian E1 Tahap 2/4 yang masih wait.
- Masih pending: Milestone D no. 4 (search), 6 (currency), 7 (transisi timeframe), D13.7, dan seluruh E1 (Tahap 0–4).
- Perubahan sesi ini **belum di-commit/push** (tunggu instruksi user).

---

## 4 September 2026 — E1 Tahap 0 & 1 (TradingView token + detail 2 kolom)

### Status: Done
- [x] **E1 Tahap 0 — Token warna**: `app/globals.css` ditulis ulang dengan 11 token semantik TradingView (`--tv-page/panel/border/text/muted/up/down/flat/interactive/hover/warning`) untuk dark & light; map ke Tailwind v4 via `@theme inline` → semua komponen di-update dari hardcoded `zinc-*/green-*/red-*` ke `bg-page`, `text-up`, `border`, dll (11 file)
- [x] **E1 Tahap 0 — PriceChart**: hardcoded hex diganti baca CSS variables via `getComputedStyle`, fallback ke default TV colors
- [x] **E1 Tahap 1 — CoinQuoteBar**: info bar tipis di atas chart — logo · kode/nama · WatchStar · O/H/L/C/Vol (tabular-nums)
- [x] **E1 Tahap 1 — ChartToolbar**: tab timeframe kiri bawah (7 interval, active = `bg-interactive`) + jam UTC kanan bawah
- [x] **E1 Tahap 1 — CoinInfoPanel**: sidebar kanan sticky — harga besar + %, status live/koneksi, Key Stats (volume, high/low/change, market cap n/a, supply n/a), Key Facts (tren bullish/bearish/sideways, likuiditas tinggi/sedang/rendah)
- [x] **E1 Tahap 1 — CoinDetail refactor**: layout `lg:grid-cols-[minmax(0,1fr)_300px]`, `< lg` tumpuk; `key={interval}` pada PriceChart → remount bersih saat ganti TF; `setLive(null)` di `handleIntervalChange`
- [x] Verifikasi: `tsc --noEmit` OK, `npm run lint` OK, `npm test` 12/12, `npm run build` OK (25 route), commit `07ba3bb` + push

### Catatan
- `CoinDetailStats.tsx` tidak di-import lagi (digantikan `CoinInfoPanel`), tapi file masih ada untuk referensi.
- E1 Tahap 2 (Watchlist panel) sudah selesai dari sesi sebelumnya.
- Sisa E1: Tahap 3 (Search + Currency) dan Tahap 4 (Styling umum TV).

---

## 4 September 2026 — E1 Tahap 3 (Search bar + Currency selector)

### Status: Done
- [x] **API Route** `app/api/rate/route.ts` → proxy `open.er-api.com/v6/latest/USD` dengan `next.revalidate: 3600` (ISR 1 jam)
- [x] **React Query hook** `hooks/useFiatRates.ts` → queryKey `["rates"]`, staleTime 1 jam, retry 2
- [x] **Format helpers** `lib/format.ts` → `convertPrice(usd, rate)`, `formatCurrency(value, currency, rates)`, `SUPPORTED_CURRENCIES` (USD/IDR/EUR/JPY/SGD), locale-aware formatting
- [x] **SearchBox** `components/layout/SearchBox.tsx` → filter `COIN_NAMES` + `DEFAULT_SYMBOLS`, keyboard nav (↑/↓/Enter/Escape), dropdown → `/coin/{code}`
- [x] **CurrencySelect** `components/layout/CurrencySelect.tsx` → dropdown USD/IDR/EUR/JPY/SGD, state ke `uiStore.currency` (persist)
- [x] **Header.tsx** → integrasi `SearchBox` + `CurrencySelect` di antara ConnectionBadge dan Watchlist button
- [x] **Konversi harga** di: `TickerTable` (FlashPrice), `CoinInfoPanel` (harga besar + high/low), `CoinQuoteBar` (O/H/L/C), `WatchlistPanel` (PanelRow) — volume tetap USD `formatCompact`
- [x] Verifikasi: `tsc --noEmit` OK, `npm run lint` OK, `npm test` 12/12, `npm run build` OK (26 route termasuk `/api/rate`)

### Catatan
- Sisa E1: hanya Tahap 4 (Styling umum TV) yang belum.
- Data harga tetap dalam USD dari Binance; konversi hanya di lapisan tampilan.

---

## 31 Agustus 2026 — Perbaikan pasca-audit watchlist & dedup tone

### Status: Done
- [x] `lib/market.ts` (baru) — `MarketTone`, `getMarketTone(change)`, `TONE_TEXT` map, `toneText(change)`; **dedup** warna 3 arah yang sebelumnya dobel di `TickerTable.tsx` & `WatchlistPanel.tsx`
- [x] `TickerTable.tsx` — ganti `percentTone`/`TONE_TEXT` lokal → `toneText(change)` dari `lib/market`
- [x] `WatchlistPanel.tsx` — ganti tone lokal → `toneText(change)`; **panel tutup otomatis** saat klik baris navigasi (`close(false)` sebelum `router.push`)
- [x] `WatchStar.tsx` — tambah `p-0.5` (area klik lebih besar) & indikator warna di span dalam
- [x] `WatchlistPanel.tsx` — `w-[300px] max-w-[85vw]` (hindari overflow layar sangat sempit)
- [x] Verifikasi: lint OK, `npm test` 12/12, `npm run build` OK (25 route), dev `/` & `/coin/POL` 200

### Catatan
- Perubahan sesi ini **belum di-commit/push** (tunggu instruksi user).

---

<!-- 
Template entri selanjutnya — salin & isi di atas baris ini:

## 30 Agustus 2026 — Sesi Setup Project
- [x] npx create-next-app ...
- [ ] ...
-->

---