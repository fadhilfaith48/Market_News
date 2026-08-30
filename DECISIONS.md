# DECISIONS — Crypto Market Web App

Catatan keputusan teknis/produk penting. Fungsinya: **mencegah saran lama yang sudah ditolak terulang kembali**. Sebelum menyarankan pendekatan baru, cek dulu apakah keputusan serupa sudah pernah diambil.

Format entri baru:

```md
## [Tanggal] — [Judul keputusan]
- **Status:** Approved / Rejected / Changed (date)
- **Keputusan:** ...
- **Alasan:** ...
- **Trade-off yang diterima:** ...
- **Alternatif yang ditolak & alasannya:** ...
```

---

## 29 Agustus 2026 — Tanpa backend server terpisah ("Vercel-Only")
- **Status:** Approved
- **Keputusan:** Aplikasi hanya dideploy di Vercel Hobby (gratis). Tidak ada backend WebSocket server sendiri, database server, maupun Redis di Fase 1. Seluruh logika server memakai Next.js API Routes (serverless).
- **Alasan:** Biaya operasional $0; beban real-time streaming ditanggung langsung oleh infrastruktur exchange.
- **Trade-off:** Terikat batasan Vercel Hobby (10 detik eksekusi, 100 GB bandwidth, non-komersial); tidak bisa punya WebSocket server sendiri (tidak persisten).
- **Alternatif ditolak:** Railway/Render/VPS untuk WebSocket server + Express/Fastify (perlu biaya & maintenance).

## 29 Agustus 2026 — Koneksi WebSocket langsung dari client ke Binance
- **Status:** Approved
- **Keputusan:** Browser membuka WS langsung ke `wss://stream.binance.com` — tanpa proxy/perantara server.
- **Alasan:** Skalabilitas tidak dibatasi kapasitas server aplikasi; gratis; implementasi sederhana.
- **Trade-off:** Terkena batasan jaringan/firewall pengguna; perlu mekanisme fallback ke REST polling.

## 29 Agustus 2026 — Watchlist disimpan di Local Storage (tanpa database)
- **Status:** Approved (Fase 1)
- **Keputusan:** Watchlist & preferensi (theme, currency) disimpan per-device di browser Local Storage. Sinkronisasi akun **tidak** dibangun di Fase 1.
- **Alasan:** Tanpa biaya backend; cepat untuk MVP.
- **Trade-off:** Data tidak sinkron antar device/browser; hilang saat clear data/cache.
- **Alternatif ditolak (untuk sekarang):** MongoDB Atlas free tier + autentikasi ringan — ditunda ke fase berikutnya.

## 29 Agustus 2026 — Tanpa PHP / Laravel
- **Status:** Approved (constrained)
- **Keputusan:** Seluruh stack berbasis JavaScript/TypeScript. PHP dan Laravel sama sekali tidak digunakan.
- **Alasan:** Eksplisit diminta oleh pemilik produk; PRD merujuk arsitektur modern JS.

## 29 Agustus 2026 — Data historis di-fetch via API Route dengan cache ISR
- **Status:** Approved
- **Keputusan:** REST untuk data historis/metadata melalui Next.js API Route + cache/ISR, bukan hardcode client-side langsung ke provider.
- **Alasan:** Menghindari CORS & rate-limit exposure; mengurangi jumlah request ke API pihak ketiga via caching.
- **Trade-off:** Ada latensi tambahan (proxy) — tidak berlaku untuk WebSocket real-time.

## 29 Agustus 2026 — Pilihan library frontend
- **Status:** Approved
- **Keputusan:**
  - State global: **Zustand**; data fetching/caching: **React Query**.
  - Chart: **TradingView Lightweight Charts** (utama), Recharts sebagai fallback bila kebutuhan visualisasi non-candlestick.
  - Styling: **Tailwind CSS**.
- **Alasan:** Zustand ringan untuk state UI real-time berfrekuensi tinggi; React Query menangani fetch/cache/retry REST; Lightweight Charts ringan & khusus market.
- **Alternatif ditolak:** Redux (boilerplate berat), ApexCharts (lebih berat untuk real-time streaming).

## 29 Agustus 2026 — Pola struktur folder feature-based di dalam App Router
- **Status:** Approved
- **Keputusan:** Struktur folder mengikuti ARCHITECTURE.md §3: `components/` dibagi per-fitur (dashboard, coin, watchlist, ui), `hooks/` berisi custom hooks WebSocket/query, `lib/` untuk logika inti + adapter, `store/` untuk Zustand.
- **Alasan:** Konsisten antar halaman, mudah di-scale, dan memisahkan logic data (adapter) dari UI.

## 29 Agustus 2026 — Abstraksi data provider (adapter pattern)
- **Status:** Approved
- **Keputusan:** Semua akses data pihak ketiga (Binance/CoinGecko/CoinCap) melewati interface `lib/adapters/types.ts` dengan implementasi per provider.
- **Alasan:** Melindungi aplikasi dari API breaking change provider; memudahkan fallback (mis. CoinCap sebagai backup CoinGecko).
- **Trade-off:** Sedikit overhead abstraksi di awal.

## 29 Agustus 2026 — Satu koneksi WebSocket global via provider di Root Layout
- **Status:** Approved
- **Keputusan:** `MarketDataProvider` (client component) dipasang di root layout dan membuka **satu** koneksi WS ke Binance; pesan ticker ditulis ke `marketStore` (Zustand) lalu dibaca komponen mana pun. Hook `useBinanceWS` dipakai hanya oleh provider ini.
- **Alasan:** Menghindari banyak koneksi WS per halaman/komponen; data harga tersedia global untuk dashboard yang akan datang (header, watchlist).
- **Trade-off:** Semua halaman selalu terhubung WS meski halaman itu tidak butuh.

## 29 Agustus 2026 — Reconnect WebSocket: exponential backoff 1s→30s, tanpa PING client
- **Status:** Approved
- **Keputusan:** Auto-reconnect memakai backoff `min(1000ms * 2^attempts, 30s)`, reset `attempts` saat koneksi terbuka. Tidak mengirim PING frame manual dari client — server Binance mengirim ping dan browser menanggapi pong otomatis.
- **Alasan:** Cukup untuk data ticker; menghindari state yang rumit; penyebab utama putus (jaringan berubah) tetap tercover oleh reconnect.
- **Catatan:** Belum diuji pada simulasi putus koneksi nyata — jadi item di BUGS.md (KI-002) tetap Open.

## 29 Agustus 2026 — UI persist pakai Zustand persist (key `crypto-ui`), default theme dark
- **Status:** Approved
- **Keputusan:** `uiStore` memakai `persist` middleware Zustand dengan nama key `crypto-ui` (menyimpan `theme` & `currency` saja). Default theme = `dark`, dengan inline script di `<head>` untuk mencegah flash saat load.
- **Alasan:** Sekali setup, tanpa pendekatan lain; `partialize` membatasi data yang disimpan.
- **Alternatif ditolak:** custom storage manual — ditolak, cukup pakai middleware bawaan.

## 29 Agustus 2026 — Verifikasi build/lint sebelum update dokumen
- **Status:** Approved
- **Keputusan:** Setiap sesi selesai, jalankan `npm run build` + `npm run lint` (bukan hanya dev server) sebelum update TASKS/PROGRESS.
- **Alasan:** Menangkap error type/lint lebih awal dari pada saat runtime.

## 29 Agustus 2026 — Multi-endpoint WebSocket + fallback otomatis
- **Status:** Approved
- **Keputusan:** Koneksi WS Binance memakai daftar endpoint bergantian: `wss://stream.binance.com:9443/stream` lalu `wss://data-stream.binance.vision:9443/stream`. Saat koneksi gagal/putus, index endpoint maju (rotasi) sebelum reconnect; saat berhasil `open`, kembali ke urutan awal.
- **Alasan:** Di jaringan tertentu (termasuk dev user), `stream.binance.com` & `api.binance.com` diblokir/geo-block, sementara `data-stream.binance.vision` lancar (terverifikasi: stream.binance.com → ERROR, binance.vision → CONNECTED). Fallback membuat aplikasi tetap jalan lintas jaringan.
- **Trade-off:** Satu percobaan gagal tambahan bila endpoint pertama kembali hidup; acceptable demi self-healing.
- **Catatan untuk masa depan:** REST `api.binance.com` juga diblokir di jaringan user → semua REST Binance harus lewat API Route (serverless Vercel, bukan dari client/user network).

## 29 Agustus 2026 — Lepas `next/font/google` (Geist) → system font stack
- **Status:** Approved
- **Keputusan:** Hapus penggunaan `next/font/google` (Geist, Geist_Mono). Font memakai system stack via CSS variable `--font-sans`/`--font-mono` di `globals.css`. `<html>` tidak lagi membawa class modul font (`geist_*`).
- **Alasan:** Di dev Turbopack, class hash font `next/font` berbeda antara render server & client → hydration mismatch pada atribut `className` `<html>` (BUG-001). Solusi ini menghilangkan sumber mismatch, mempercepat build (tanpa fetch font Google), dan cocok dengan prinsip "ringan & cepat".
- **Trade-off:** Tampilan font jadi bergantung OS; tidak se-spesifik Geist.

## 29 Agustus 2026 — Sumber kurs fiat: open.er-api.com (backup exchangerate.host)
- **Status:** Approved
- **Keputusan:** Konversi mata uang (USD → IDR/dll) memakai `https://open.er-api.com/v6/latest/USD` — gratis tanpa API key, CORS terbuka, terverifikasi HTTP 200 di dev. Backup: `exchangerate.host` (satu vendor, exchangerate-api). Di-proxy lewat API Route `/api/rate` + cache (`fetch next.revalidate`).
- **Alasan:** PRD §7.4 menulis "exchangerate.host" sebagai contoh, tetapi endpoint resminya belakangan membatasi akses tanpa key; `open.er-api.com` adalah endpoint gratis aktif dari vendor yang sama dan berfungsi penuh.
- **Trade-off:** Kurs diperbarui sekali sehari (rate terakhir direspons); cukup untuk tampilan konversi harga.
- **Alternatif ditolak:** exchangerate.host sebagai sumber utama (perlu key), frankfurter.app (kurasi ECB, tidak selalu ada IDR stabil), hardcode kurs (tidak real).

## 29 Agustus 2026 — Aturan format harga bertingkat (koin mikro)
- **Status:** Approved
- **Keputusan:** `formatPrice` memakai aturan bertingkat (staircase): `≥ 1` → 2 desimal; `< 1 && ≥ 0.01` → 4 desimal; `< 0.01` → hingga digit signifikan pertama non-nol (gaya CoinMarketCap, mis. `0.00001234`); `≥ 1000` → compact (K/M/B/T).
- **Alasan:** Perbaiki BUG-003 — SHIB (dan koin mikro lain) tampil "0" karena formatter lama memangkas desimal.
- **Trade-off:** Harga koin besar akan tampil compact (mis. BTC volume) — sesuai konvensi; nilai ≥ 1 di bawah 1000 tetap 2 desimal penuh.

## 29 Agustus 2026 — Konvensi warna indikator: naik=hijau, turun=merah, flat=abu
- **Status:** Approved
- **Keputusan:** Hijau = naik, merah = turun, dan **abu netral = flat** (perubahan 0% / data tidak berubah). Berlaku konsisten di tabel, badge %, dan candle chart.
- **Alasan:** Logika lama (`isUp = (change ?? 0) >= 0`) membuat 0% berwarna hijau — menyesatkan.
- **Trade-off:** Tidak ada — data netral memang seharusnya netral.

## 29 Agustus 2026 — Responsive mobile: tabel → card list
- **Status:** Approved
- **Keputusan:** Di layar mobile, tabel dashboard diubah menjadi **card list per koin** (bukan tabel horizontal-scroll) agar mudah dibaca; `.md:` ke atas tetap tabel penuh.
- **Alasan:** Konvensi umum dashboard trading mobile; menghindari scroll horizontal yang menyulitkan.
- **Trade-off:** Dua jalur rendering pada komponen tabel (perlu dipelihara konsistensi).

## 30 Agustus 2026 — Rombak tampilan mengikuti gaya TradingView (E1)
- **Status:** Approved
- **Keputusan:** Seluruh tampilan dirombak ke gaya platform trading profesional (referensi TradingView), terbatas pada **layout & styling** — tanpa fitur order/trading (aplikasi tetap murni monitoring). Direvisi bertahap: detail koin 2 kolom → watchlist sidebar → styling umum.
- **Alasan:** Meningkatkan kesan "hidup" & pro; konvensi yang sudah familiar pengguna trading.
- **Trade-off:** Pekerjaan restyle menyeluruh; pola token warna baru perlu dipelihara.
- **Alternatif ditolak:** Menambah fitur trading/BUY-SELL (di luar scope PRD).

## 30 Agustus 2026 — Palet warna TradingView (dark tetap + TV-light)
- **Status:** Approved
- **Keputusan:** Dark diubah dari pure black (`#0a0a0a`) ke solid `#131722`, panel `#1e222d`, border `#2a2e39`, teks primer `#d1d4dc`, muted `#787b86`; **naik `#26a69a`, turun `#ef5350`** (khas TV). **Light mode tetap dipertahankan** sebagai TV-light: bg `#ffffff`, border `#e3e6ea`, naik `#089981`, turun `#f23645`. Border antar panel = garis 1px abu gelap, **tanpa shadow**; angka harga pakai `tabular-nums`. Token diimplementasikan sebagai CSS var semantik → map Tailwind v4 (`@theme inline`).
- **Alasan:** Kontras chart lebih baik daripada hitam pekat; meniru palet TV yang familiar; mode light masih berguna & sudah dilisensi pengguna.
- **Trade-off:** Perlu retune class zinc lama ke token.
- **Alternatif ditolak:** Dark-only tanpa toggle (menghapus fitur yang sudah ada).

## 30 Agustus 2026 — Halaman detail koin: layout 2 kolom
- **Status:** Approved
- **Keputusan:** Detail koin memakai `grid` 2 kolom: kiri ±75% = info-bar tipis (O/H/L/C + vol) di atas chart full + toolbar timeframe di bawah chart; kanan ±25% sticky = harga besar + perubahan, status "Live", "Last update at", **Key Stats list label-kiri/nilai-kanan** (bukan card kotak-kotak), + **Key Facts** ringkas statis dari % & volume (bukan AI generatif). Mobile `< lg`: ditumpuk.
- **Alasan:** Meniru layout "Apple Inc · 1D · O/H/L/C" pada referensi; Key Stats list lebih rapat & pro daripada card bertumpuk.
- **Trade-off:** Sidebar memakan lebar di layar sedang (diatasi tumpukan saat `< lg`).
- **Keputusan terkait:** Timeframe berada di **bawah** chart (7 interval Binance tetap dipertahankan — bukan preset kalender TV), grid chart sangat samar, harga di sumbu kanan.

## 30 Agustus 2026 — Watchlist sebagai panel sidebar, bukan halaman terpisah
- **Status:** Approved (menggantikan rencana halaman `/watchlist`)
- **Keputusan:** Watchlist direpresentasikan sebagai **panel drawer sisi kanan global**, di-toggle dari tombol "Watchlist" di Header (state `uiStore.watchlistOpen`), muncul di dashboard & detail koin. Baris kompak: logo+kode | harga | chg%, highlight baris koin aktif, grouping kolaps "Watchlist Saya / Top Gainers / Semua Koin". **Pengembangan `app/watchlist/page.tsx` dibatalkan.**
- **Alasan:** Referensi TV menampilkan watchlist sebagai panel samping; hemat navigasi, data live langsung terlihat; konsisten lintas halaman.
- **Trade-off:** Panel overlay/dock memakan ruang layar (bisa di-toggle); tidak ada URL khusus watchlist.
- **Alternatif ditolak:** Halaman `/watchlist` terpisah (sudah pernah direncanakan di Milestone D no.3), panel hanya di dashboard (kurang "global").

## 30 Agustus 2026 — Search bar + currency selector dikerjakan di sesi E1
- **Status:** Approved (merevisi keputusan "defer ke tahap fitur")
- **Keputusan:** `SearchBox` + `CurrencySelect` dibangun sekarang di sesi rombak **E1 Tahap 3** (di Header, global) → menuntaskan D13.7 & Milestone D no.4 & 6. Sumber kurs tetap `open.er-api.com` (keputusan 29 Agustus) via `/api/rate`.
- **Alasan:** Navbar konsisten adalah bagian dari gaya TV; pengerjaan setahap dengan layout menghindari utang desain ganda.
- **Trade-off:** Menambah cakupan sesi desain (sekitar 3-4 komponen + 1 API route).

---

## Keputusan yang Pernah Dibahas & Ditutup
- Backend Express/Fastify untuk WebSocket server → **ditolak** (lihat keputusan #1).
- Use local state (useState) saja untuk data real-time → **diganti** Zustand + marketStore untuk berbagi antar halaman.