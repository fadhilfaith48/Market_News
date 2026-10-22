# BUGS / Known Issues — Crypto Market Web App

Daftar bug yang diketahui + risiko yang harus dipantau. Update file ini setiap menemukan bug baru saat development. Beri prioritas: **High** (menghambat fitur utama), **Medium**, **Low**.

Format entri baru:

```md
## [Judul / deskripsi singkat]
- **ID:** BUG-001 (tambah urut)
- **Tanggal ditemukan:** [tanggal]
- **Prioritas:** High / Medium / Low
- **Status:** Open / In Progress / Fixed / Won't Fix / Known-Limit
- **Langkah reproduce:** ...
- **Dampak:** ...
- **Solusi/rancangan perbaikan:** ...
- **Diperbaiki tanggal/versi:** ...
```

---

## Daftar Bug

## BUG-004 — Toggle tema Gelap/Terang tidak mengubah tampilan
- **Tanggal ditemukan:** 4 September 2026
- **Prioritas:** High
- **Status:** Fixed — 4 September 2026
- **Langkah reproduce:** Buka dashboard → klik tombol "Terang"/"Gelap" di pojok kanan Header → label berubah tetapi warna halaman tetap.
- **Penyebab:** Token salah urut di `app/globals.css`. Blok `.dark` ditulis **sebelum** `:root`. Keduanya sama-sama match `<html>` dengan spesifisitas setara `(0,1,0)`, sehingga aturan yang **belakangan** (`:root` = nilai terang) menang di elemen `<html>` dan nilai light selalu diwariskan ke seluruh halaman → class `dark` jadi tidak berefek.
- **Dampak:** Fitur ganti tema (dark/light) tidak berfungsi; tema terkunci terang.
- **Solusi/rancangan perbaikan:** Pindahkan blok `:root` (terang/default) ke atas dan `.dark` ke bawah agar dark menang cascade saat class aktif; tambah regression test `tests/theme.test.ts` (urutan blok + nilai `--tv-page` berbeda) dan rapikan class body `bg-background text-foreground` → `bg-page text-text`.
- **Diperbaiki tanggal/versi:** 4 September 2026 — urutan token dibalik di `globals.css`; verifikasi compiled CSS (`.dark{}` setelah `:root{}`); `tests/theme.test.ts`; build & lint OK.

## BUG-001 — Hydration mismatch pada atribut className `<html>` (dev Turbopack)
- **Tanggal ditemukan:** 29 Agustus 2026
- **Prioritas:** High
- **Status:** Fixed — dihilangkan dengan melepas `next/font/google` (Geist) → system font stack (lihat DECISIONS.md)
- **Langkah reproduce:** Buka `http://localhost:3000` saat dev (Turbopack) → console error "A tree hydrated but some attributes of the server rendered HTML didn't match".
- **Dampak:** Error di console dev; markup `<html>` tidak 100% sinkron antara server & client.
- **Solusi:** Hapus class modul font (`geist_*`) dari `<html>` di `layout.tsx`; pakai system font di `globals.css`.
- **Verifikasi:** `<html lang="id" class="h-full antialiased">` dan `grep "geist"` di HTML = 0; build & lint lolos.

## BUG-002 — MATIC menampilkan "-" di semua kolom (simbol sudah delisting)
- **Tanggal ditemukan:** 29 Agustus 2026
- **Prioritas:** High
- **Status:** Fixed — 4 September 2026 (Milestone D no.1): `MATICUSDT` → `POLUSDT`
- **Langkah reproduce:** Buka dashboard → baris "MATIC" selalu "-" di kolom Harga, 24 Jam, dan Volume.
- **Penyebab:** `MATICUSDT` **di-delist Binance sejak 2024-09-10** (token swap 1 MATIC = 1 POL ke Polygon/Pol); sejak 2024-09-13 trading dibuka sebagai **`POLUSDT`**. Tidak ada lagi ticker WS `MATICUSDT` → `tickers[MATICUSDT]` selalu undefined.
- **Dampak:** Satu baris mati permanen di tabel; menu detail MATIC tidak ada datanya.
- **Solusi/rancangan perbaikan:** Ganti `MATICUSDT` → `POLUSDT` di `DEFAULT_SYMBOLS` (`lib/constants.ts`); tambah `COIN_NAMES.POL` = "Polygon (POL)" di `lib/coinMeta.ts`; cek ketersediaan logo POL (atomiclabs kemungkinan tak punya `pol.svg` → override CoinGecko `polygon-ecosystem-token`); verifikasi WS ticker + REST klines `POLUSDT` hidup via `data-stream/data-api.binance.vision`.
- **Diperbaiki tanggal/versi:** 4 September 2026 — `DEFAULT_SYMBOLS` memakai `POLUSDT`; `COIN_NAMES.POL` = "Polygon (POL)"; logo `poly.svg` (atomiclabs) hidup; `dynamicParams = false` → `/coin/MATIC` **404**; `/coin/POL` 200; unit test & build OK.

## BUG-003 — SHIB menampilkan harga "0"
- **Tanggal ditemukan:** 29 Agustus 2026
- **Prioritas:** High
- **Status:** Fixed — 29 Agustus 2026 (sesi desain Milestone D): `formatPrice` aturan bertingkat sudah diterapkan
- **Langkah reproduce:** Buka dashboard → baris SHIB, kolom Harga menampilkan "0".
- **Penyebab:** `formatPrice` di `lib/format.ts` tidak mengakomodasi harga mikro (< $0.01): cabang `compactFormatter` memangkas desimal (bisa menghasilkan "0") dan cabang default dibatasi maksimal 6 desimal — keduanya tidak aman untuk koin berharga sangat kecil.
- **Dampak:** Harga SHIB (dan koin mikro lain) terbaca keliru → menyesatkan pengguna.
- **Solusi/rancangan perbaikan:** `formatPrice` aturan bertingkat (staircase): `≥ 1` → 2 desimal; `< 1 && ≥ 0.01` → 4 desimal; `< 0.01` → hingga digit signifikan pertama non-nol (gaya CoinMarketCap, mis. `0.00001234`); `≥ 1000` → compact. Berlaku di tabel + detail + stats. Tambah unit test rentang: 0, < 0.01, 0.01–1, ≥ 1, ≥ 1000, NaN.
- **Diperbaiki tanggal/versi:** 29 Agustus 2026 — `lib/format.ts` (`formatPrice` staircase + `formatMicroPrice`); verifikasi build & lint lolos. Unit test formatter masih ditunda (Fase 5).

## BUG-005 — `notFound()` di halaman dinamis menghasilkan HTTP 200 (bukan 404)
- **Tanggal ditemukan:** 17 September 2026
- **Prioritas:** Low
- **Status:** Fixed — 22 September 2026 (`dynamicParams` dikembalikan ke default; lihat catatan bawah)
- **Langkah reproduce:** Ubah `/coin/[code]` ke `dynamicParams` default lalu panggil `notFound()` untuk kode tak dikenal (`/coin/MATIC`) → UI not-found tampil tetapi status HTTP **200** (respons streamed).
- **Dampak:** Mesin pencari/API tidak mendapat kode 404 → status tidak benar untuk URL tak dikenal.
- **Solusi/rancangan perbaikan:** Pertahankan `dynamicParams = false` (halaman `/coin/{kode}` hanya untuk 20 koin yang di-generate → kode lain 404 di level routing). Halaman `app/coin/[code]/not-found.tsx` dibatalkan (segment not-found tak terpakai); UI 404 memakai `app/not-found.tsx` global.
- **Diperbaiki tanggal/versi:** 17 September 2026 — dikembalikan ke `dynamicParams = false`; verifikasi `/coin/MATIC` → 404.
- **Update 22 September 2026:** Keputusan dibalik. `dynamicParams = false` membuat kode tak dikenal (mis. dari watchlist `localStorage` lama) **hard navigation / reload penuh** saat diklik (fetch RSC 404 → fallback full-page load, vercel/next.js#79057). Kini `dynamicParams` default (`true`) + validasi `VALID_CODES` (`DEFAULT_SYMBOLS` tanpa sufiks `USDT`) + `notFound()` di `generateMetadata` dan page → kode tak dikenal dirender sebagai 404 **soft** (tanpa reload penuh). Trade-off: status HTTP kembali **200 streamed** untuk `/coin/{kode tak dikenal}`. Verifikasi: `npm run lint` & `npm run build` OK; 50 koin tetap SSG.

## BUG-006 — Watchlist menyimpan kode lama/delisted dari localStorage
- **Tanggal ditemukan:** 22 September 2026
- **Prioritas:** Medium
- **Status:** Fixed — 22 September 2026
- **Langkah reproduce:** Isi `localStorage["crypto-watchlist"]` dengan kode yang tidak ada di `DEFAULT_SYMBOLS` (mis. `MATIC`) → (sebelum BUG-001 diperbaiki) klik baris itu dari "Watchlist Saya" → **hard navigation/reload penuh** menuju 404. Saat ini baris mati sudah tak dirender (WatchlistPanel sudah memfilter `DEFAULT_SYMBOLS`), tetapi kode stale tetap tersimpan di storage.
- **Dampak:** Data watchlist mengandung kode usang; berpotensi menyulut reload bila UI lain membaca `codes` mentah; daftar "Watchlist Saya" bisa menampilkan angka/isi yang tidak sinkron dengan daftar koin.
- **Solusi/rancangan perbaikan:** Sanitasi di `store/watchStore.ts`: (1) `toggle` hanya menerima kode dari `VALID_CODES` (`DEFAULT_SYMBOLS` tanpa sufiks `USDT`) — kode tak dikenal diabaikan; (2) `merge` persist membuang kode invalid/non-string saat rehydrate dari `localStorage`; (3) helper `sanitizeCodes` diekspor & diuji (memberi jalan keluar bersih dari storage lama).
- **Diperbaiki tanggal/versi:** 22 September 2026 — `store/watchStore.ts` + `tests/store.test.ts` (9 test, 87 total hijau) + lint OK.

## BUG-007 — State koin sebelumnya tersisa saat pindah antar /coin/[code]
- **Tanggal ditemukan:** 22 September 2026
- **Prioritas:** Medium
- **Status:** Fixed — 22 September 2026
- **Langkah reproduce:** Buka `/coin/BTC`, tunggu candle live masuk, klik koin lain (mis. `/coin/ETH`) → grafik sesaat menampilkan candle live milik BTC yang tercampur dengan data historis baru ETH; interval/timeframe juga tidak di-reset antar koin.
- **Penyebab:** Navigasi antar dua URL pada segmen dinamis yang sama (`/coin/[code]`) **tidak me-remount** komponen `CoinDetail` (client component bertahan, `useState` tidak di-reset). Candle `live` dari koin lama masih tersimpan sampai pesan WS koin baru pertama tiba (dan `PriceChart` sempat mencampurnya ke data koin baru).
- **Dampak:** Data grafik/live koin baru terkontaminasi data koin lama sesaat setelah navigasi.
- **Solusi/rancangan perbaikan:** Beri `key={code}` pada `<CoinDetail>` di `app/coin/[code]/page.tsx` → React me-remount instance untuk tiap kode (interval & candle live di-reset, WS kline dibuka ulang). Catatan: interval/timeframe ikut di-reset ke default per koin.
- **Diperbaiki tanggal/versi:** 22 September 2026 — `key={code}`; verifikasi lint & build OK (50 koin tetap SSG).

## BUG-008 — Tidak ada loading/error UI khusus segmen koin
- **Tanggal ditemukan:** 22 September 2026
- **Prioritas:** Low
- **Status:** Fixed — 22 September 2026
- **Langkah reproduce:** Navigasi ke `/coin/{kode}` → transisi memakai skeleton global `app/loading.tsx` (berupa tabel dashboard) yang tidak mirip layout detail koin; bila terjadi error tak tertangkap di segmen koin, menampilkan UI error global.
- **Dampak:** Skeleton tidak menggambarkan konten detail koin (kesan aplikasi lambat/pindah halaman aneh); error tak tertangkap di segmen koin menampilkan UI error yang generik.
- **Solusi/rancangan perbaikan:** Tambah `app/coin/[code]/loading.tsx` (skeleton chart + info panel menyerupai `CoinDetail`) dan `app/coin/[code]/error.tsx` (client boundary dengan tombol "Coba Lagi"). Sesuai panduan Next: dynamic route tanpa `loading.tsx` memberi kesan "app not responding".
- **Diperbaiki tanggal/versi:** 22 September 2026 — buat 2 file di `app/coin/[code]/`; verifikasi lint & build OK, 50 koin tetap SSG.

## BUG-009 — iOS auto-zoom saat input pencarian difokuskan (HP)
- **Tanggal ditemukan:** 22 Oktober 2026
- **Prioritas:** High
- **Status:** Fixed — 22 Oktober 2026
- **Langkah reproduce:** Buka aplikasi di iPhone Safari (atau iPad) → ketuk kolom pencarian di header → halaman otomatis zoom-in dan zoom tidak bisa dikembalikan (tetap ter-magnify) → seluruh layout tampak kacau.
- **Penyebab:** Input `SearchBox` (`components/layout/SearchBox.tsx`) memakai `font-size: text-xs` (12px). iOS Safari melakukan auto-zoom pada setiap input dengan font-size < 16px; zoom bersifat persisten selama halaman tidak di-reload.
- **Dampak:** Di HP, pengguna yang baru mengetik satu karakter di kolom pencarian langsung kehilangan kendali atas tampilan halaman; zoom juga menutupi sebagian konten.
- **Solusi/rancangan perbaikan:** Naikkan font-size input menjadi 16px di bawah breakpoint `sm` (`text-base sm:text-xs`) → auto-zoom tidak terpicu, sementara tampilan desktop tetap ringkas. Verifikasi: CSS ter-build berisi `--text-base: 1rem` dan utiliti `.text-base` aktif pada <640px.
- **Diperbaiki tanggal/versi:** 22 Oktober 2026 — `components/layout/SearchBox.tsx`; lint, 201 test, & build OK.

## BUG-010 — Panel info detail koin tertutup header sticky di tablet
- **Tanggal ditemukan:** 22 Oktober 2026
- **Prioritas:** Medium
- **Status:** Fixed — 22 Oktober 2026
- **Langkah reproduce:** Buka `/coin/BTC` di tablet (lebar < 1024px) → scroll ke bawah → panel info (statistik, edit holding, alert) yang `sticky` tertimpa header.
- **Penyebab:** `CoinDetail` memakai offset tetap `lg:top-20` (80px). Namun di bawah 1024px header menjadi 2 baris (baris logo/tombol + baris pencarian & mata uang, `Header.tsx`), sehingga tinggi header ≈ 95px > 80px.
- **Dampak:** Bagian atas panel info terpotong header saat scroll di tablet — konten tidak terbaca.
- **Solusi/rancangan perbaikan:** Ganti offset statis dengan CSS variable `--header-h` yang nilainya diukur runtime: `Header` memakai `ResizeObserver` pada elemen `<header>` lalu menulis `--header-h` ke `<html>`; `CoinDetail` memakai `top-[var(--header-h,5rem)]` (fallback 5rem bila JS belum berjalan). Nilai `--header-h` otomatis menyesuaikan bila tinggi header berubah di kemudian hari.
- **Diperbaiki tanggal/versi:** 22 Oktober 2026 — `components/layout/Header.tsx` (ResizeObserver), `components/coin/CoinDetail.tsx`, `app/coin/[code]/loading.tsx`, `app/globals.css` (fallback `--header-h: 6.5rem`).

## BUG-011 — Konten tertutup notch / gesture bar di iPhone
- **Tanggal ditemukan:** 22 Oktober 2026
- **Prioritas:** Medium
- **Status:** Fixed — 22 Oktober 2026
- **Langkah reproduce:** Buka aplikasi di iPhone (Safari) → toast di pojok kanan bawah tertutup gesture bar; drawer sisi & footer tertutup area swipe-to-close.
- **Penyebab:** Aplikasi belum mendeklarasikan `viewport` → `viewport-fit` default `auto`, sehingga `env(safe-area-inset-*)` selalu bernilai 0 dan konten tidak mendapat ruang aman.
- **Dampak:** Elemen fixed (Toaster) & area bawah drawer/footer tertutup indikator home iPhone → tombol toast & footer sulit disentuh.
- **Solusi/rancangan perbaikan:** Tambahkan `export const viewport` di `app/layout.tsx` (`viewportFit: "cover"`, `themeColor` light/dark), `padding-bottom: env(safe-area-inset-bottom)` pada `body`, `padding-top` aman pada header, dan padding aman pada `Toaster` + `DrawerShell`.
- **Diperbaiki tanggal/versi:** 22 Oktober 2026 — `app/layout.tsx`, `app/globals.css`, `components/ui/Toaster.tsx`, `components/ui/DrawerShell.tsx`; verifikasi HTML: `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"/>` + 2 tag `theme-color`.

## BUG-012 — Kolom chart terlalu sempit di iPad portrait (768px)
- **Tanggal ditemukan:** 22 Oktober 2026
- **Prioritas:** Medium
- **Status:** Fixed — 22 Oktober 2026
- **Langkah reproduce:** Buka `/coin/BTC` di iPad portrait (768px) → layout 2 kolom aktif → kolom chart hanya ≈ 420px; candle + volume + MA7/MA25 + sumbu harga saling berdesakan.
- **Penyebab:** `CoinDetail` memakai `md:grid-cols-[minmax(0,1fr)_300px]` (2 kolom mulai 768px) — berbeda dengan `app/coin/[code]/loading.tsx` yang sudah memakai `lg:`.
- **Dampak:** Chart sulit dibaca di tablet portrait; tombol toolbar ikut rapat.
- **Solusi/rancangan perbaikan:** Samakan breakpoint ke `lg` (1024px) → di bawah itu chart memakai lebar penuh 1 kolom, konsisten dengan skeleton loading.
- **Diperbaiki tanggal/versi:** 22 Oktober 2026 — `components/coin/CoinDetail.tsx` (`md:` → `lg:`).

## Known Issues / Risiko yang Dipantau (dari perencanaan)

## Known Issue 1 — Watchlist & preferensi tidak tersinkron antar device
- **ID:** KI-001
- **Prioritas:** Medium
- **Status:** Known-Limit (Fase 1)
- **Dampak:** Watchlist tersimpan di Local Storage per browser/device; hilang saat clear data; tidak sinkron jika akses dari device lain.
- **Solusi:** Dijadwalkan di fase berikutnya — MongoDB Atlas (free tier) + autentikasi ringan. Bisa dicomunikasikan sebagai batasan di UI (disclaimer).

## Known Issue 2 — Koneksi WebSocket dapat terputus / dibatasi jaringan
- **ID:** KI-002
- **Prioritas:** High
- **Status:** In Progress — lihat entri PROGRESS.md 17/09/2026 (Paket A+B)
- **Dampak:** Data real-time berhenti update jika koneksi ke Binance WS terputus (jaringan tidak stabil, firewall, proxy).
- **Solusi:** Implementasi `useBinanceWS` dengan auto-reconnect (exponential backoff), indikator status koneksi di UI (online/reconnecting/offline), dan fallback ke REST polling via API Route.
- **Update 17/09/2026:** Paket A — connect timeout **5s** (`WS_CONNECT_TIMEOUT_MS`), mulai dari endpoint tersimpan (`lib/wsEndpoint.ts`), endpoint sukses diingat (`localStorage "binance-ws-endpoint"`), tidak reset index saat `onopen`, backoff dipercepat **1s→15s** (`WS_RECONNECT_MAX_DELAY_MS`, `getReconnectDelay` cap default baru; `tests/reconnect.test.ts` di-update). Paket B — fallback polling REST **5s** (`TICKER_POLL_INTERVAL_MS`) via `app/api/tickers/route.ts` (proxy `data-api.binance.vision/api/v3/ticker/24hr`, field verbose, `next.revalidate: 5`, timeout 6s, `parseTickersRest` di `lib/binance/ws.ts`) saat WS bukan `online`, di-apply ke `marketStore` + indikator "· REST" di `ConnectionBadge` (state `dataSource` di `uiStore`). Catatan: REST Binance memakai **nama field penjang** (`symbol`/`lastPrice`/…), bukan kode singkat seperti WS (`s`/`c`/…) — mahal habits kalau menyalin format WS ke REST (sudah difix & diuji `tests/rest.test.ts`). Verifikasi penuh di production (Vercel) masih menunggu push (Binance diblokir di jaringan dev).
- **Todo pengujian:** Matikan internet/koneksi saat dev → pastikan status "Menyambung ulang…" lalu kembali "Live"; cek tidak ada multiple reconnect berjalan bersamaan.

## Known Issue 3 — Rate limit / downtime API pihak ketiga (Binance/CoinGecko)
- **ID:** KI-003
- **Prioritas:** High
- **Status:** In Progress — sebagian tertangani
- **Dampak:** Jika provider rate-limit atau down, data real-time/historis terhenti atau gagal fetch.
- **Solusi:** Caching ISR/revalidate pada API Route; fallback provider (CoinCap sebagai backup CoinGecko); adapter pattern agar mudah beralih; tampilkan timestamp "last updated" + sumber data.
- **Update 29/08/2026:** Terbukti jaringan user memblokir `stream.binance.com` & `api.binance.com` (WS → ERROR, REST → GAGAL). Endpoint `data-stream.binance.vision` jalan → fallback multi-endpoint WS sudah diimplementasikan. REST Binance ke depan via API Route (serverless), bukan dari client.
- **Update 17/09/2026:** `/api/coins` (proxy CoinGecko `coins/markets`) sudah dibangun — terverifikasi 200 di dev (`api.coingecko.com` tidak diblokir jaringan dev), `next.revalidate: 300` menekan rate-limit; UI fallback "n/a" bila error/429. Catatan: `assets.coingecko.com` (CDN gambar) sempat 403 di jaringan dev — logo tetap pakai atomiclabs + fallback huruf.
- **Update 28/09/2026:** **Fallback provider kini HIDUP** — `/api/coins` lewat `lib/adapters` (CoinGecko → **CoinPaprika** saat gagal/429/empty, output `{ coins, source }`). CoinCap v2 sudah mati global (dipakai CoinPaprika, terverifikasi 200 dari jaringan dev). TON & DOT tidak punya data valid di CoinPaprika → "n/a" saat fallback. Baris "Sumber: CoinPaprika" tampil bila fallback aktif.

## Known Issue 4 — Batasan Vercel Hobby plan
- **ID:** KI-004
- **Prioritas:** Low
- **Status:** Known-Limit
- **Dampak:** Batas 10 detik eksekusi / 100 GB bandwidth / 100.000 request perbulan; penggunaan hanya untuk non-komersial. Jika dimonetisasi harus upgrade ke Pro ($20/bulan).
- **Solusi:** Jaga cache API Route agar request ke external API minimal; pantau penggunaan di dashboard Vercel.

## Known Issue 5 — Rendering chart saat data streaming berfrekuensi tinggi
- **ID:** KI-005
- **Prioritas:** Medium
- **Status:** Partial — batching ticker WS diterapkan (22/09/2026); memoization & throttle chart kline belum
- **Dampak:** Potensi lag/jank pada chart & tabel jika update WS masuk terlalu banyak sekaligus.
- **Solusi:** Throttle/batch update store (maks N kali per detik), memoization komponen, dan manfaatkan API incremental TradingView Lightweight Charts.
- **Update 22/09/2026:** Batching diterapkan — `lib/batcher.ts` (`createBatchFlusher`, dedup per simbol, flush 250ms `TICKER_BATCH_FLUSH_MS`), `store/marketStore.ts` (`applyTickers`, satu `set` per batch), `hooks/useBinanceWS.ts` (`onTickers` + batcher, flush saat cleanup), `useTickerPolling.ts` ikut memakai `applyTickers`. Test: `tests/batcher.test.ts` baru + `tests/store.test.ts` (`applyTickers`), 95 test hijau, lint & build OK. Belum: throttle update kline/`useKlineStream`, `React.memo` pada baris tabel, dan kompresi re-render `FlashPrice`.

## Known Issue 6 — Target sentuh kecil & gap responsif P2/P3 (backlog)
- **ID:** KI-006
- **Prioritas:** Medium
- **Status:** Open — sengaja ditunda (P1 sudah diselesaikan pada 22 Oktober 2026)
- **Dampak:** Di HP beberapa target sentuh masih di bawah standar ergonomis: bintang watchlist `WatchStar` hanya 16×16px, tombol header ≈ 28px, chip filter/MA/timeframe ≈ 24px (rekomendasi Apple ≥44px, Material ≥48dp). LiveTicker marquee juga tidak bisa dijeda di perangkat sentuh (`hover:` hanya berlaku di perangkat ber-hover), sehingga 50 koin (durasi ≈ 140 detik) terus berjalan tanpa jeda. Dashboard tetap 1 kolom sampai 1280px, sehingga iPad landscape (1024–1280px) memakai tabel selebar penuh.
- **Solusi/rancangan perbaikan:** (P2) perbesar area sentuh bintang/ikon/chip; pause marquee pada `pointerdown`; clamp lebar dropdown pencarian agar tidak meluber; tambahkan affordance scroll pada deret timeframe; tambah layout 2 kolom dashboard mulai `lg`. (P3) sembunyikan kolom Volume di <768px; sediakan kontrol sort pada tampilan kartu mobile; hentikan animasi kilatan harga saat `prefers-reduced-motion`. Tidak ada dependency baru (pure Tailwind/CSS).
- **Catatan:** Belum ada pengujian otomatis pada viewport nyata (Playwright/e2e belum dipasang) — verifikasi responsif selama ini masih manual/berbasis kelas Tailwind.

---

<!-- 
Template bug baru — salin & isi di atas baris ini:

## [Judul]
- **ID:** BUG-006
- **Tanggal ditemukan:** [tanggal]
- **Prioritas:** ...
- **Status:** Open
- **Langkah reproduce:** ...
- **Dampak:** ...
- **Solusi/rancangan perbaikan:** ...
-->