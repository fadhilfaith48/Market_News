# TASKS — Crypto Market Web App

Daftar tugas mengikuti Milestones pada [PRD.md](./PRD.md) §12. Centang `[x]` saat selesai. Setiap selesai, catat juga di [PROGRESS.md](./PROGRESS.md).

**Status umum:** Milestone A–C selesai (scaffold Next.js 16, WS ticker real-time, tabel dashboard, logo/favicon, halaman detail koin + candlestick real-time). **Sedang berjalan: Milestone D — umpan balik user** + **E1 — Rombak gaya TradingView** (layout & styling; bagian paling bawah). Lihat [PROGRESS.md](./PROGRESS.md).

---

## Fase 1 — Riset & Desain (UI/UX)
- [ ] Menyusun PRD (✅ selesai — lihat PRD.md, versi 1.0)
- [ ] Memilih API data (Binance WS + REST, CoinGecko sebagai backup) ✅ (diputuskan di PRD)
- [ ] Menyusun ARCHITECTURE.md ✅ (diputuskan di PRD)
- [ ] Wireframe / mockup Figma halaman utama (dashboard)
- [ ] Wireframe / mockup halaman detail koin
- [ ] Wireframe / mockup halaman watchlist
- [ ] Menetapkan design system: warna (naik/turun), tipografi, dark/light theme
- [ ] Finalisasi struktur folder & pola komponen (App Router + feature-based)

## Fase 2 — Setup Arsitektur & Infrastruktur
- [x] Inisialisasi project Next.js 16 (TypeScript + Tailwind 4 + App Router)
- [x] Setup ESLint (prettier/lint-staged masih pending)
  - [ ] Setup Prettier / lint-staged
- [ ] Setup Vercel deployment (import repo, preview env)
- [x] Setup struktur folder sesuai ARCHITECTURE.md (app, components, hooks, lib, store, types)
- [x] Setup konfigurasi Tailwind (dark mode class strategy via `@custom-variant`)
- [x] Setup constants & types dasar (TickerWS, Coin, Kline, dsb.)
- [x] Setup lib/binance/ws.ts (parser + builder URL stream)
- [x] Setup hooks/useBinanceWS dengan auto-reconnect (exponential backoff)
- [ ] Setup lib/adapter: interface + implementasi Binance & CoinGecko
- [x] Setup lib/storage.ts (wrapper Local Storage)
- [x] Setup store Zustand: uiStore (theme, currency, connection status) + marketStore (ticker real-time)
- [x] Setup React Query provider + query client di root layout
- [ ] Setup .env.local & dokumentasi environment variables

## Fase 3 — Pengembangan Fitur Inti
- [x] Dashboard: komponen TickerTable dasar (harga, %24h, volume) — sumber WS Binance
- [ ] Dashboard: komponen LiveTicker (marquee harga real-time)
- [ ] Dashboard: highlight animasi naik/turun pada perubahan harga
- [ ] Dashboard: top gainers & top losers section
- [ ] Integrasi data pasar via CoinGecko (REST) + live update via Binance WS
- [x] Halaman detail koin `/coin/[symbol]`
- [x] Grafik candlestick interaktif dengan TradingView Lightweight Charts
- [x] Penggabungan data historis (REST) + live update (WS) dalam satu chart
- [x] Timeframe switcher (1m, 5m, 15m, 1h, 4h, 1d, 1w)
- [x] Stats card detail koin (high/low 24h, volume; market cap & supply masih nanti)
- [ ] Loading skeleton & error state di seluruh halaman

## Fase 4 — Fitur Tambahan
> Item watchlist, search bar, dan konversi mata uang di bawah ditindaklanjuti secara eksplisit di **Milestone D** (bagian bawah) sesuai umpan balik user.
- [ ] Watchlist: tombol bintang pada koin (tambah/hapus)
- [ ] Watchlist: store lokal (Zustand persist → Local Storage)
- [ ] Watchlist: halaman khusus menampilkan koin favorit dengan data real-time
- [ ] Search bar + autocomplete (debounce + client-side filtering)
- [ ] Filter koin: top gainers, top losers, market cap tertinggi
- [ ] Konversi mata uang (USD/IDR/dll) — dropdown di navbar
- [ ] API Route `/api/rate` untuk kurs fiat dengan cache
- [x] Dark/light mode toggle (persist preferensi) — toggle di Header + ThemeSync + inline script anti-flicker
- [ ] Responsive design: dashboard, detail koin, watchlist (mobile & desktop)
- [ ] Footer: sumber data, disclaimer, timestamp "last updated"

## Fase 5 — Testing & QA
- [ ] Unit test: parser WS message, formatter harga, adapter data
- [ ] Unit test: store Zustand (watchlist, market store)
- [ ] Component test: MarketTable, PriceChart, WatchlistButton
- [ ] Test auto-reconnect WebSocket (simulasi putus koneksi)
- [ ] Load test WebSocket (banyak ticker subscribe di satu halaman)
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Aksesibilitas dasar (contrast, keyboard navigation)
- [ ] Perf audit (Lighthouse: FCP < 2s)

## Fase 6 — Deployment & Monitoring
- [ ] Deploy ke Vercel production
- [ ] Verifikasi WSS/HTTPS di production
- [ ] Monitoring uptime + error tracking (Vercel Analytics / Sentry)
- [ ] Status indikator koneksi WS di UI (online/offline/reconnecting)
- [ ] Release notes / changelog Fase 1

---

## Milestone D — Umpan Balik User (Gambar 1: Dashboard / Gambar 2: Detail Koin)

Diambil dari review user (29 Agustus 2026). Nomor tetap mengikuti urutan masukan user.

### 1. [BUG] MATIC tampil "-" di semua kolom
- [x] Verifikasi akar masalah: `MATICUSDT` **di-delist Binance sejak 2024-09-10** (swap token 1 MATIC = 1 POL); sejak 2024-09-13 trading dibuka sebagai `POLUSDT`
- [x] Ganti `MATICUSDT` → `POLUSDT` di `DEFAULT_SYMBOLS` (`lib/constants.ts`)
- [x] Update `COIN_NAMES.POL` = `Polygon (POL)` di `lib/coinMeta.ts`
- [x] Logo POL: `pol.svg` atomiclabs **tidak ada (404)** → `LOGO_OVERRIDES.POL` = atomiclabs **`poly.svg` (200)**; CoinGecko `assets.coingecko.com` ditolak (403) sehingga tidak dipakai; fallback huruf di `CoinIcon` tetap ada
- [x] Verifikasi: WS/REST `POLUSDT` hidup via `data-stream/data-api.binance.vision` (ticker price OK, `/api/klines?symbol=POLUSDT` 200); `/coin/POL` 200; tambah `dynamicParams = false` → `/coin/MATIC` **404**

### 2. [BUG] SHIB menampilkan harga "0"
- [x] Rombak `formatPrice` di `lib/format.ts` menjadi **aturan bertingkat (staircase)**:
  - `≥ 1` → 2 desimal
  - `< 1 && ≥ 0.01` → 4 desimal
  - `< 0.01` → tampilkan hingga digit signifikan pertama tidak nol (notasi gaya CoinMarketCap, mis. `0.00001234`) — jangan dibulatkan jadi "0"
  - `≥ 1000` → compact `formatCompact` (K/M/B/T)
- [x] Berlaku di tabel dashboard **dan** halaman detail (harga + stats)
- [x] Tambah unit test formatter: **Vitest 4** (devDep) + `vitest.config.mts` + script `"test": "vitest run"` + `tests/format.test.ts` (rentang: 0, < 0.01, 0.01–1, ≥ 1, ≥ 1000, NaN + formatPercent/formatCompact) — 12 tes pass

### 3. [FITUR] Watchlist — ikon bintang di tabel dashboard
- [x] `store/watchStore.ts` (Zustand + persist, key `WATCHLIST_STORAGE_KEY` = `crypto-watchlist`); simpan base code (mis. `BTC`) — + hook `useIsWatched`
- [x] `components/ui/WatchStar.tsx` — tombol ☆/★ dengan `stopPropagation` + `preventDefault` agar klik tidak memicu navigasi row (hidrasi via `useHydrated`)
- [x] Kolom bintang di `TickerTable` (sel "Koin" desktop + card mobile, sebelum logo)
- [x] ~~`app/watchlist/page.tsx` — halaman terpisah~~ **DIBATALKAN (E1 Tahap 2)** → **sudah dibangun**: panel sidebar drawer global `components/watchlist/WatchlistPanel.tsx` (tombol "Watchlist" di Header, state `uiStore.watchlistOpen`), list kompak logo+kode | harga | chg% (rata kanan), highlight koin aktif, grouping kolaps "Watchlist Saya / Top Gainers / Semua Koin"; data live dari ticker store (scope 20 koin default) + link ke `/coin/{code}`; mount di `app/layout.tsx` (global)
- [x] Toggle watchlist di halaman detail (no. 5) sinkron dengan store yang sama
- [x] (Refactor) `lib/market.ts` — helper `getMarketTone`/`toneText` + map `TONE_TEXT` (dedup warna 3 arah antara TickerTable & WatchlistPanel); `WatchlistPanel` → `toneText(change)`; `TickerTable` → `toneText(change)`
- [x] (UX) Panel watchlist **tutup otomatis** saat navigasi ke `/coin/{code}`; `WatchStar` diberi `p-0.5` (area klik lebih besar); panel `max-w-[85vw]`

### 4. [FITUR] Search bar di header *(dikerjakan di E1 Tahap 3)*
- [ ] `components/layout/SearchBox.tsx` di `Header` (sebelah toggle tema)
- [ ] Filter client-side atas `COIN_NAMES`/kode (code terkait `coinMeta.ts`), debounce ±150ms, dropdown hasil (logo + kode + nama), klik → `/coin/{code}`; tutup saat blur/Escape
- [ ] Perluasan data pencarian (skala 20 koin saat ini; jika nanti > daftar, pindah ke REST `/api/coins`)

### 5. [FITUR] Tombol watchlist di halaman detail
- [x] Pakai `WatchStar` yang sama di header `CoinDetail` (di samping nama koin `/ USDT`), storage/fungsi sama dgn dashboard (no. 3)

### 6. [FITUR] Currency selector global (konversi kurs otomatis) *(dikerjakan di E1 Tahap 3)*
- [ ] Dropdown mata uang di `Header` (USD / IDR / EUR / JPY / SGD) → simpan ke `uiStore.currency` (state + persist sudah ada)
- [ ] API Route `app/api/rate/route.ts` → proxy `open.er-api.com/v6/latest/USD` (gratis tanpa key, CORS terbuka; backup `exchangerate.host`), cache via `fetch({ next: { revalidate: 3600 } })`
- [ ] `hooks/useFiatRates.ts` (React Query, queryKey `["rates"]`)
- [ ] Helper `formatCurrency(usd, currency, rate)` di `lib/format.ts`
- [ ] Terapkan konversi di: tabel dashboard, harga & stats halaman detail
- [ ] Pertahankan harga tersimpan dalam USD (Binance) — konversi hanya di lapisan tampilan

### 7. [CEK] Transisi timeframe chart (1M/5M/…/1W)
- [ ] Hapus risiko candle basi TF lama masuk chart TF baru: `setLive(null)` saat ganti interval + render `PriceChart` dengan `key={interval}` (remount bersih)
- [ ] Skeleton/loading state saat data historis TF baru di-fetch (pastikan tidak flicker)
- [ ] Verifikasi WS reconnect otomatis ke `{symbol}@kline_{interval}` baru (rotasi endpoint + backoff sudah ada) dan indeks status "Grafik live / Menyambung ulang…" akurat

### Standar Desain / UX (konvensi umum web market crypto)
Spek baku tercatat di [PRD.md](./PRD.md) §13 "Standar Desain UI/UX"; daftar di bawah adalah ceklis implementasinya.

- [x] **D13.1 Layout tabel**: kolom angka (harga, %, volume) rata kanan; kolom koin rata kiri dengan logo + simbol + nama lengkap (sudah berjalan baik — pertahankan)
- [x] **D13.2 Warna indikator**: hijau = naik, merah = turun, **abu netral = flat (perubahan 0% / data tidak berubah)** — konsisten di tabel, badge %, dan candle chart (bukan default hijau/merah untuk 0%)
- [x] **D13.3 Micro-interaction**: flash highlight singkat 300–500ms (background hijau/merah) di sel harga yang berubah secara real-time
- [x] **D13.4 Skeleton loading**: shimmer skeleton saat data awal sedang di-fetch (dashboard, tabel, detail) — bukan halaman kosong/spinner biasa
- [x] **D13.5 Empty & error state**: pesan jelas + tombol **Retry** saat WS gagal connect / API down; tabel tidak dibiarkan kosong tanpa penjelasan
- [x] **D13.6 Responsive mobile**: tabel dashboard berubah menjadi **card list per koin** (bukan horizontal-scroll) agar tetap mudah dibaca
- [ ] **D13.7 Navbar konsisten**: search bar + currency selector muncul di SEMUA halaman (dashboard, detail koin, watchlist) — Header sudah global; komponennya **sedang dikerjakan di E1 Tahap 3** (SearchBox + CurrencySelect)
- [x] **D13.8 Number formatting**: singkatan standar K/M/B/T untuk volume/market cap besar (`formatCompact`) — sudah diterapkan, cukup verifikasi

### E1 — Rombak Gaya TradingView (Layout & Styling)

Berdasarkan prompt desain referensi TradingView (30 Agustus 2026). Fokus **layout & styling saja** — tanpa fitur order/trading (aplikasi tetap murni monitoring). Spek lengkap: PRD §13.9–13.12. Update ARCHITECTURE.md bila struktur komponen berubah + TASKS.md tiap bagian selesai.

- **Tahap 0 — Fondasi token warna** ✅
  - [x] `app/globals.css`: token semantik dark/light (`--tv-page`, `--tv-panel`, `--tv-border`, `--tv-text`, `--tv-muted`, `--tv-up/down/flat/interactive/hover/warning`) → map ke Tailwind v4 (`@theme inline`); update `--shimmer-base/hover`
- **Tahap 1 — Detail koin 2 kolom** (PRD §13.9, 13.11) ✅
  - [x] `components/coin/CoinQuoteBar.tsx` — info-bar tipis: logo · kode/nama · O/H/L/C · Vol (satu baris, `tabular-nums`)
  - [x] `components/coin/ChartToolbar.tsx` — tab timeframe **kiri** bawah chart (7 interval: 1m/5m/15m/1h/4h/1d/1w) + **jam UTC** kanan bawah (render time, tanpa setInterval)
  - [x] `components/coin/CoinInfoPanel.tsx` — sidebar kanan sticky: harga besar + perubahan · status "Live"/"Menyambung…" · "Last update at [waktu]" (dari `eventTime`) · Key Stats list (Volume 24j, Tertinggi/Terendah 24j, Perubahan 24j; Market Cap & Supply "n/a") · Key Facts ringkas (dari % & volume)
  - [x] Rombak `CoinDetail.tsx` → `lg:grid-cols-[minmax(0,1fr)_300px]`; hapus `CoinDetailStats.tsx`; `< lg` tumpuk; ganti interval → reset candle live (`setLive(null)` + remount `key`)
- **Tahap 2 — Watchlist jadi panel sidebar** (PRD §13.10)
  - [ ] `store/watchStore.ts` (Zustand persist `crypto-watchlist`, `toggle`) + `components/ui/WatchStar.tsx` (☆/★, `stopPropagation`)
  - [ ] Star di `TickerTable` (kolom kiri) & header `CoinDetail`
  - [ ] `components/watchlist/WatchlistPanel.tsx` — drawer kanan global (tombol "Watchlist" di Header, state `uiStore.watchlistOpen`), list kode+logo | harga | chg%, highlight koin aktif (`pathname`), grouping kolaps Watchlist Saya / Top Gainers / Semua Koin, state kosong + CTA
  - [ ] Koreksi ARCHITECTURE/TASKS/DECISIONS — halaman `/watchlist` dibatalkan
- **Tahap 3 — Search bar + currency di Header** (menuntaskan D13.7 + Milestone D no.4 & 6)
  - [ ] `app/api/rate/route.ts` → proxy `open.er-api.com/v6/latest/USD` (`next.revalidate: 3600`); `hooks/useFiatRates.ts` (React Query `["rates"]`)
  - [ ] Helper `convertPrice`/`formatCurrency` di `lib/format.ts`
  - [ ] `components/layout/SearchBox.tsx` (filter `COIN_NAMES`, debounce ±150ms, dropdown → `/coin/{kode}`, blur/Escape) + `components/layout/CurrencySelect.tsx` (USD/IDR/EUR/JPY/SGD → `uiStore.currency`) di `Header.tsx`
  - [ ] Terapkan konversi harga di TickerTable & CoinInfoPanel (%; volume tetap USD `formatCompact`; harga tersimpan tetap USD)
- **Tahap 4 — Styling umum TV** (PRD §13.12)
  - [ ] Retune komponen lama (Header, TickerTable, ConnectionBadge, card list, skeleton) ke token TV; audit ganti shadow-heavy → border 1px
  - [ ] `PriceChart.tsx`: grid sangat samar, price scale kanan, bg transparan, warna candle dari token up/down, hapus border scale
- **Docs & verifikasi**
  - [ ] Update ARCHITECTURE.md (struktur komponen baru), DECISIONS.md (keputusan E1), TASKS.md tiap tahap, PROGRESS.md
  - [ ] Build 25 route + lint; HTTP 200 `/` & `/coin/BTC`; cek visual 2 kolom → stack, sticky sidebar, toolbar bawah + clock, toggle panel + highlight, dropdown search/currency, harga IDR

---

## Nanti (Backlog — di luar Fase 1)
- [ ] Opsional: MongoDB Atlas (free tier) + autentikasi ringan untuk sinkronisasi watchlist antar device
- [ ] Opsional: notifikasi harga (ketika harga menyentuh level tertentu)
- [ ] Opsional: notifikasi push email/SMS