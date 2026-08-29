# TASKS — Crypto Market Web App

Daftar tugas mengikuti Milestones pada [PRD.md](./PRD.md) §12. Centang `[x]` saat selesai. Setiap selesai, catat juga di [PROGRESS.md](./PROGRESS.md).

**Status umum:** Fase 1 & 2 belum dimulai (belum ada kode).

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
- [ ] Setup React Query provider + query client di root layout
- [ ] Setup .env.local & dokumentasi environment variables

## Fase 3 — Pengembangan Fitur Inti
- [x] Dashboard: komponen TickerTable dasar (harga, %24h, volume) — sumber WS Binance
- [ ] Dashboard: komponen LiveTicker (marquee harga real-time)
- [ ] Dashboard: highlight animasi naik/turun pada perubahan harga
- [ ] Dashboard: top gainers & top losers section
- [ ] Integrasi data pasar via CoinGecko (REST) + live update via Binance WS
- [ ] Halaman detail koin `/coin/[symbol]`
- [ ] Grafik candlestick interaktif dengan TradingView Lightweight Charts
- [ ] Penggabungan data historis (REST) + live update (WS) dalam satu chart
- [ ] Timeframe switcher (1m, 5m, 15m, 1h, 4h, 1d, 1w)
- [ ] Stats card detail koin (high/low 24h, volume, market cap, supply)
- [ ] Loading skeleton & error state di seluruh halaman

## Fase 4 — Fitur Tambahan
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

## Nanti (Backlog — di luar Fase 1)
- [ ] Opsional: MongoDB Atlas (free tier) + autentikasi ringan untuk sinkronisasi watchlist antar device
- [ ] Opsional: notifikasi harga (ketika harga menyentuh level tertentu)
- [ ] Opsional: notifikasi push email/SMS