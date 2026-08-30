# Product Requirements Document (PRD)
## Crypto Market Web App — Real-Time Data Dashboard

**Versi Dokumen:** 1.0
**Tanggal:** 29 Agustus 2026
**Status:** Draft

---

## 1. Executive Summary

### 1.1 Ringkasan Informasi
Crypto Market Web App adalah platform web yang menyajikan data pasar cryptocurrency secara **real-time**, mencakup harga, volume perdagangan, kapitalisasi pasar, pergerakan grafik (candlestick/line chart), serta fitur pemantauan portofolio pribadi (watchlist) tanpa melibatkan transaksi jual-beli aset kripto secara langsung (bukan exchange).

### 1.2 Latar Belakang
Banyak pengguna pemula maupun trader kripto membutuhkan satu tempat yang cepat, ringan, dan akurat untuk memantau pergerakan harga koin favorit mereka. Aplikasi tracker kripto yang ada saat ini sering kali berat, penuh iklan, atau tidak menyajikan data real-time yang benar-benar instan (delay beberapa menit). Produk ini hadir untuk mengisi celah tersebut dengan pengalaman yang cepat, ringan, dan fokus pada data live.

### 1.3 Tujuan Produk
- Menyediakan data harga cryptocurrency secara **real-time** (update tanpa perlu refresh halaman) menggunakan WebSocket.
- Memberikan visualisasi data pasar yang jelas dan interaktif (chart, ranking, ticker).
- Memungkinkan pengguna memantau koin favorit melalui fitur watchlist personal.
- Membangun arsitektur modern berbasis JavaScript (tanpa PHP/Laravel) yang scalable dan performant.

---

## 2. Target Audience & User Personas

### 2.1 Karakteristik Umum Target Pengguna
- Trader dan investor kripto (pemula hingga menengah).
- Enthusiast teknologi yang ingin memantau tren pasar kripto harian.
- Pengguna yang mengakses dari desktop maupun mobile browser.

### 2.2 User Persona

**Persona 1: "Andi — Trader Harian (Day Trader)"**
- Usia: 25–35 tahun.
- Kebutuhan: Data harga real-time yang akurat untuk mengambil keputusan cepat.
- Pain Points:
  - Aplikasi existing sering delay 1–2 menit sehingga merugikan saat trading cepat.
  - Terlalu banyak iklan yang mengganggu saat memantau chart.
  - Tidak ada notifikasi ketika harga menyentuh level tertentu.

**Persona 2: "Sinta — Investor Pemula"**
- Usia: 20–28 tahun.
- Kebutuhan: Tampilan sederhana untuk memahami tren pasar tanpa istilah teknis berlebihan.
- Pain Points:
  - Dashboard kripto kebanyakan terlalu kompleks untuk pemula.
  - Sulit menemukan ringkasan cepat "koin apa yang sedang naik/turun".

**Persona 3: "Rian — Developer/Enthusiast"**
- Usia: 22–30 tahun.
- Kebutuhan: Ingin memantau beberapa koin spesifik secara personal (watchlist).
- Pain Points:
  - Tidak bisa menyimpan daftar koin favorit tanpa membuat akun exchange.

---

## 3. Product Scope & Out of Scope

### 3.1 Dalam Cakupan (In Scope) — Fase 1
- Landing page ringkasan pasar kripto (top gainers, top losers, trending).
- Real-time price ticker untuk daftar koin utama (via WebSocket API pihak ketiga, mis. Binance/CoinGecko WS).
- Halaman detail koin dengan grafik candlestick/line real-time.
- Fitur watchlist personal (local storage / akun ringan tanpa transaksi finansial).
- Fitur pencarian & filter koin (berdasarkan nama, kapitalisasi pasar, volume).
- Konversi harga ke berbagai mata uang (USD, IDR, dll).
- Dark mode / light mode.
- Responsive design (desktop & mobile).

### 3.2 Di Luar Cakupan (Out of Scope) — Fase 1
- Fitur jual/beli aset kripto (bukan exchange, murni data monitoring).
- Integrasi wallet crypto (MetaMask, dompet on-chain, dsb.).
- Sistem pembayaran atau transaksi finansial apa pun.
- Backend berbasis PHP/Laravel (secara eksplisit tidak digunakan).
- Fitur social trading / forum komunitas.
- Aplikasi mobile native (iOS/Android) — hanya web responsive di Fase 1.
- Notifikasi push berbasis email/SMS (dipertimbangkan untuk fase berikutnya).

---

## 4. Key Features & Requirements

### 4.1 Real-Time Market Dashboard
**Deskripsi:** Halaman utama menampilkan tabel/list koin dengan data yang ter-update otomatis (harga, %perubahan 24 jam, volume, market cap) tanpa reload halaman.
**Skenario Penggunaan:**
1. Pengguna membuka halaman utama.
2. Sistem membuka koneksi WebSocket ke penyedia data (mis. Binance WebSocket API atau CoinGecko).
3. Setiap perubahan harga langsung tercermin di UI dengan animasi highlight (hijau untuk naik, merah untuk turun).

### 4.2 Halaman Detail Koin & Grafik Real-Time
**Deskripsi:** Menampilkan grafik candlestick/line interaktif yang update secara live, lengkap dengan indikator dasar (volume, high/low 24 jam).
**Skenario Penggunaan:**
1. Pengguna klik salah satu koin dari dashboard.
2. Sistem menampilkan grafik historis (fetch REST API) + live update (WebSocket) tergabung dalam satu chart.
3. Pengguna dapat mengganti timeframe (1m, 5m, 1h, 1d, 1w).

### 4.3 Watchlist Personal
**Deskripsi:** Pengguna dapat menandai koin favorit untuk dipantau di satu halaman khusus.
**Skenario Penggunaan:**
1. Pengguna klik ikon bintang pada koin tertentu.
2. Koin tersimpan di local storage (guest) atau akun ringan (jika login diaktifkan).
3. Halaman "Watchlist" menampilkan hanya koin-koin yang dipilih dengan data real-time.

### 4.4 Pencarian & Filter
**Deskripsi:** Search bar dengan autocomplete serta filter berdasarkan kategori (top gainers, top losers, market cap tertinggi).
**Skenario Penggunaan:**
1. Pengguna mengetik nama/simbol koin di search bar.
2. Sistem menampilkan hasil secara instan (client-side filtering + debounce).

### 4.5 Konversi Mata Uang
**Deskripsi:** Pengguna dapat mengganti tampilan harga dari USD ke IDR atau mata uang lain.
**Skenario Penggunaan:**
1. Pengguna memilih mata uang dari dropdown di navbar.
2. Seluruh harga di halaman otomatis dikonversi menggunakan kurs terbaru.

### 4.6 Tema Dark/Light Mode
**Deskripsi:** Toggle tema untuk kenyamanan visual, terutama saat memantau chart dalam waktu lama.

---

## 5. User Flow & Navigation

### 5.1 Flow Utama: Memantau Harga Koin
1. **Landing Page** → Pengguna mendarat di dashboard utama, melihat ringkasan pasar (top gainers/losers).
2. **Live Ticker** → Data harga langsung ter-update secara real-time tanpa aksi tambahan dari pengguna.
3. **Klik Koin** → Pengguna mengklik salah satu koin untuk melihat detail.
4. **Halaman Detail** → Menampilkan grafik real-time, statistik, dan tombol "Tambah ke Watchlist".
5. **Watchlist** → Pengguna mengakses menu "Watchlist" untuk melihat koin-koin yang telah disimpan.

### 5.2 Flow Sekunder: Pencarian Koin
1. Pengguna mengetik di search bar (tersedia di semua halaman melalui navbar).
2. Sistem menampilkan dropdown hasil pencarian secara instan.
3. Pengguna memilih salah satu hasil → diarahkan ke halaman detail koin.

### 5.3 Navigasi Utama
- Navbar: Logo | Dashboard | Watchlist | Search Bar | Currency Selector | Dark/Light Toggle.
- Footer: Sumber data, disclaimer, tautan dokumentasi API (jika publik).

---

## 6. Data & Architecture Requirements

### 6.1 Entitas Data Utama
| Entitas | Atribut Utama |
|---|---|
| **Coin** | id, symbol, name, current_price, market_cap, volume_24h, price_change_24h, image_url |
| **PriceHistory** | coin_id, timestamp, open, high, low, close, volume |
| **Watchlist** | user_id/session_id, coin_id, added_at |
| **User (opsional, jika login diaktifkan)** | id, email, preferred_currency, theme_preference |

### 6.2 Arsitektur Data — Pendekatan "Vercel-Only" (Serverless, Tanpa Backend Terpisah)

> **Perubahan strategi:** Untuk memungkinkan deployment 100% gratis hanya di Vercel, aplikasi ini **tidak menggunakan backend WebSocket server sendiri**. Sebagai gantinya, setiap browser client melakukan koneksi WebSocket **langsung** ke exchange (mis. `wss://stream.binance.com`). Beban real-time streaming sepenuhnya ditanggung oleh infrastruktur exchange, bukan server aplikasi.

- **Sumber data real-time:** Koneksi WebSocket dibuka langsung dari sisi client (browser) ke Binance WebSocket Streams — tidak melalui server perantara.
- **Sumber data historis:** Di-fetch langsung dari REST API publik (Binance/CoinGecko), baik langsung dari client maupun melalui Next.js API Route (sebagai proxy ringan untuk menghindari CORS/rate-limit exposure).
- **Penyimpanan watchlist:** Local Storage browser — tidak ada database server. Watchlist bersifat per-device/per-browser (lihat trade-off di Bagian 9).
- **Caching:** Menggunakan cache bawaan Next.js (ISR/revalidate) pada API Route untuk data historis/metadata koin yang jarang berubah, guna mengurangi jumlah request ke API pihak ketiga.
- **Tanpa database & tanpa Redis** di Fase 1 — seluruh state disimpan di sisi client.

---

## 7. Technology Stack & Integration

> **Catatan:** Sesuai permintaan, stack **tidak menggunakan PHP maupun Laravel**. Seluruh stack berbasis JavaScript/TypeScript, dan dirancang agar dapat di-deploy **100% gratis hanya menggunakan Vercel** (tanpa backend server terpisah).

### 7.1 Frontend
- **Framework:** Next.js (React) — untuk SSR/SSG halaman ringan dan performa optimal.
- **Styling:** Tailwind CSS.
- **State Management:** Zustand atau React Query (untuk data fetching & caching client-side).
- **Chart Library:** TradingView Lightweight Charts atau Recharts/ApexCharts untuk visualisasi candlestick.
- **Real-time Client:** Native WebSocket API, connect langsung dari browser ke Binance WebSocket Streams (tanpa server perantara).

### 7.2 Backend
- **Tidak ada backend server terpisah di Fase 1.** Logika yang biasanya di backend (proxy API, konversi mata uang, caching data historis) dijalankan melalui **Next.js API Routes** (serverless functions bawaan Vercel), yang otomatis ikut ter-deploy bersama frontend tanpa infrastruktur tambahan.
- Fungsi API Route ini hanya digunakan untuk request singkat (REST, bukan WebSocket) sehingga cocok dengan batas eksekusi 10 detik pada Vercel Hobby plan.

### 7.3 Database & Caching
- **Tidak ada database server di Fase 1.** Watchlist dan preferensi pengguna disimpan di **Local Storage** browser.
- **Caching:** Memanfaatkan cache/revalidate bawaan Next.js pada API Route untuk data yang jarang berubah (metadata koin, daftar market cap), sehingga mengurangi frekuensi request ke API pihak ketiga.
- *(Opsional, Fase berikutnya jika ingin watchlist tersinkron antar device):* MongoDB Atlas (free tier) + autentikasi ringan.

### 7.4 Integrasi Pihak Ketiga
- **Binance WebSocket API** — data real-time harga & order book, diakses langsung dari client (gratis, tanpa API key untuk data publik).
- **CoinGecko API** — data historis, market cap, metadata koin (di-proxy melalui Next.js API Route bila perlu menghindari CORS/rate-limit exposure).
- **Currency Exchange API** (`open.er-api.com`, backup `exchangerate.host`) — untuk konversi mata uang fiat.

### 7.5 Deployment & Infrastruktur — 100% Gratis via Vercel
- **Hosting:** Vercel Hobby plan (gratis, mencakup frontend + API Routes serverless dalam satu deployment).
- **Tanpa hosting backend terpisah** (tidak perlu Railway/Render/VPS) karena tidak ada WebSocket server yang perlu dijaga tetap hidup.
- **CDN & HTTPS:** Sudah otomatis disediakan oleh Vercel, tanpa konfigurasi tambahan.
- **Batasan yang perlu diperhatikan:** Vercel Hobby dibatasi untuk penggunaan **personal/non-komersial**; jika aplikasi mulai dimonetisasi, perlu upgrade ke Vercel Pro ($20/bulan).

---

## 8. Non-Functional Requirements (NFR)

### 8.1 Performa
- Waktu update data real-time maksimal **< 1 detik** dari perubahan harga di sumber data.
- Waktu muat awal halaman (First Contentful Paint) **< 2 detik**.
- Optimasi rendering chart agar tidak menyebabkan lag saat data streaming masuk dalam frekuensi tinggi.

### 8.2 Keamanan
- Rate limiting pada endpoint REST API backend untuk mencegah abuse.
- Validasi dan sanitasi seluruh input pengguna (search, watchlist).
- Koneksi WebSocket menggunakan WSS (secure WebSocket) di production.
- HTTPS wajib di seluruh endpoint.

### 8.3 Skalabilitas
- Karena koneksi WebSocket dilakukan langsung dari tiap browser client ke exchange (bukan melalui server aplikasi), skalabilitas jumlah pengguna **tidak dibatasi oleh kapasitas server sendiri** — beban streaming ditanggung oleh infrastruktur Binance/exchange.
- Next.js API Routes (serverless) otomatis di-scale oleh Vercel sesuai jumlah request, tanpa konfigurasi tambahan.

### 8.4 Keandalan (Reliability)
- Mekanisme auto-reconnect pada WebSocket client jika koneksi ke exchange terputus.
- Fallback ke REST API polling (via API Route) jika koneksi WebSocket client gagal (mis. dibatasi jaringan/firewall pengguna).
- Monitoring uptime deployment Vercel (built-in) serta status ketersediaan API pihak ketiga.

### 8.5 Aksesibilitas & Kompatibilitas
- Mendukung browser modern (Chrome, Firefox, Safari, Edge — versi terbaru).
- Responsive di berbagai ukuran layar (mobile, tablet, desktop).

---

## 9. Assumptions & Dependencies

### 9.1 Asumsi
- Pengguna memiliki koneksi internet yang stabil untuk menerima data real-time.
- Data yang ditampilkan bersifat informatif, bukan untuk eksekusi transaksi finansial langsung.
- API pihak ketiga (Binance/CoinGecko) tersedia dengan uptime tinggi dan rate limit yang memadai untuk kebutuhan aplikasi.

### 9.2 Ketergantungan (Dependencies)
- Ketersediaan dan stabilitas WebSocket API dari penyedia data eksternal (Binance/CoinGecko), karena aplikasi tidak memiliki server WebSocket cadangan sendiri.
- Kebijakan rate-limit dari API pihak ketiga yang dapat berubah sewaktu-waktu.
- Layanan hosting Vercel (Hobby plan) sebagai satu-satunya infrastruktur deployment; batasan penggunaan non-komersial pada plan ini perlu dipantau seiring pertumbuhan produk.

---

## 10. Risk & Mitigation Plan

| Risiko | Dampak | Mitigasi |
|---|---|---|
| API pihak ketiga membatasi rate limit / down | Data real-time terhenti | Implementasi caching (Redis) + fallback ke sumber data cadangan (mis. CoinCap sebagai backup CoinGecko) |
| Koneksi WebSocket terputus di sisi client | Data tidak update | Auto-reconnect logic + indikator status koneksi di UI |
| Lonjakan trafik saat volatilitas pasar tinggi | Beban naik pada API Route/serverless functions | Manfaatkan auto-scaling bawaan Vercel + caching pada API Route; beban WebSocket real-time tidak terpengaruh karena ditanggung langsung oleh exchange |
| Watchlist hilang saat pengguna ganti device/browser | Pengalaman pengguna kurang konsisten | Dikomunikasikan sebagai batasan Fase 1 (local storage); disediakan opsi sinkronisasi akun di fase berikutnya |
| Data harga tidak akurat/delay dari sumber | Kepercayaan pengguna menurun | Menampilkan timestamp "last updated" dan sumber data secara transparan |
| Perubahan kebijakan/API breaking changes dari Binance/CoinGecko | Fitur real-time berhenti berfungsi | Abstraksi layer data (adapter pattern) agar mudah beralih provider |

---

## 11. Success Metrics (Indikator Keberhasilan)

| Metrik | Target |
|---|---|
| Latensi update data real-time | < 1 detik dari sumber ke tampilan pengguna |
| Uptime sistem | ≥ 99.5% per bulan |
| First Contentful Paint (FCP) | < 2 detik |
| Jumlah pengguna aktif harian (DAU) di 3 bulan pertama | Target awal: 1.000 pengguna aktif harian |
| Rata-rata jumlah koin di watchlist per pengguna | ≥ 3 koin (indikator engagement) |
| Bounce rate halaman dashboard | < 40% |
| Error rate koneksi WebSocket | < 1% dari total sesi |

---

## 12. Milestones & Timeline Estimasi

| Fase | Deskripsi | Estimasi Waktu |
|---|---|---|
| **Fase 1: Riset & Desain (UI/UX)** | Wireframe, mockup Figma, pemilihan API data, desain arsitektur sistem | 1–2 minggu |
| **Fase 2: Setup Arsitektur & Infrastruktur** | Setup Next.js + Express/Fastify, konfigurasi WebSocket server, setup database & Redis | 1 minggu |
| **Fase 3: Pengembangan Fitur Inti** | Dashboard real-time, halaman detail koin, integrasi chart | 3–4 minggu |
| **Fase 4: Fitur Tambahan** | Watchlist, search & filter, konversi mata uang, dark/light mode | 2 minggu |
| **Fase 5: Testing & QA** | Unit testing, load testing WebSocket, cross-browser testing | 1–2 minggu |
| **Fase 6: Deployment & Monitoring** | Deploy ke production, setup monitoring & alerting | 1 minggu |
| **Total Estimasi** | | **±9–12 minggu** |

---

## 13. Standar Desain UI/UX

Konvensi visual & interaksi yang berlaku konsisten di seluruh halaman (dashboard, halaman detail koin, watchlist). Mengikuti pola umum dashboard market crypto, dengan orientasi gaya platform trading profesional (referensi TradingView). Checklist implementasi: lihat Milestone D di [TASKS.md](./TASKS.md).

### 13.1 Layout tabel
- Semua kolom angka (harga, % perubahan, volume) **rata kanan**, `tabular-nums`.
- Kolom nama koin **rata kiri** dengan logo + simbol + nama lengkap.

### 13.2 Warna indikator
- Hijau = naik, merah = turun, **abu netral = flat** (perubahan 0% / data tidak berubah).
- Konsisten di tabel, badge %, dan candle chart (hijau untuk candle naik, merah untuk turun).

### 13.3 Micro-interaction (flash highlight)
- Saat harga diperbarui real-time, sel yang berubah diberi **flash background hijau/merah 300–500ms** (sesuai arah perubahan) agar terasa "hidup".

### 13.4 Skeleton loading
- Saat data awal di-fetch, tampilkan **skeleton shimmer** — bukan halaman kosong maupun spinner biasa.

### 13.5 Empty & error state
- Jika WebSocket gagal terhubung atau API down: tampilkan pesan jelas + **tombol Retry**. Tabel tidak dibiarkan kosong tanpa penjelasan.

### 13.6 Responsive
- Desktop: tabel penuh. Mobile: tabel dashboard berubah menjadi **card list per koin** (menghindari horizontal scroll).

### 13.7 Navbar konsisten
- Search bar dan currency selector tersedia di **semua halaman** (dashboard, detail koin, watchlist) — via komponen global di `Header`.

### 13.8 Number formatting
- Singkatan standar **K, M, B, T** untuk volume/market cap besar (kompak, maks 2 angka di belakang koma).
- Harga koin mikro (< $0.01) ditampilkan sampai digit signifikan pertama tidak nol (gaya CoinMarketCap), jangan dibulatkan jadi "0".

### 13.9 Layout halaman detail koin — 2 kolom (gaya TradingView)
- Kolom kiri (±75%): info-bar tipis satu baris (logo · kode/nama · **O**pen **H**igh **L**ow **C**lose · Volume, `tabular-nums`) di atas chart candlestick full-size; toolbar timeframe di **bawah** chart.
- Kolom kanan (±25%, sticky): harga besar + perubahan, status koneksi ("Live"/"Menyambung ulang…"), "Last update at [waktu]", **Key Stats** sebagai list label-kiri/nilai-kanan (Volume 24j, Tertinggi/Terendah 24j, Perubahan 24j; Market Cap & Supply placeholder "n/a"), dan **Key Facts** ringkas statis (dari % & volume — bukan AI).
- Mobile (< lg): kedua kolom ditumpuk (chart dulu, lalu info).

### 13.10 Watchlist sebagai panel sidebar (bukan halaman terpisah)
- Watchlist ditampilkan sebagai **panel drawer di sisi kanan** yang bisa di-toggle show/hide (dari tombol "Watchlist" di Header), global di dashboard & halaman detail.
- Baris kompak satu baris per koin: logo+kode | harga | chg% (rata kanan, `tabular-nums`); baris koin yang sedang dibuka diberi highlight; grouping kolaps "Watchlist Saya / Top Gainers / Semua Koin".
- **Halaman `/watchlist` dibatalkan** — digantikan panel (keputusan di DECISIONS.md).

### 13.11 Chart: jalur sumbu & grid
- Grid line sangat tipis/samar (opacity rendah, lebih samar dari border panel).
- Harga di **sumbu kanan** chart (right price scale), bukan kiri.

### 13.12 Palet warna TradingView & styling umum
- Background gelap solid `#131722` (bukan pure black): panel `#1e222d`, border `#2a2e39`, teks primer `#d1d4dc`, teks muted `#787b86`; **naik `#26a69a`, turun `#ef5350`** (khas TradingView). Light mode tetap ada sebagai TV-light: bg `#ffffff`, border `#e3e6ea`, naik `#089981`, turun `#f23645`.
- Border antar panel: garis tipis 1px abu gelap — **bukan shadow** (kesan clean).
- Angka harga besar (panel utama & watchlist) pakai font tabular/monospace agar digit rata.
- Tidak ditiru dari referensi: toolbar kiri penuh (indicator/drawing/alert/replay/trade) & tombol BUY/SELL — di luar scope (aplikasi murni monitoring, bukan exchange).

---

*Dokumen ini bersifat living document dan dapat diperbarui seiring berjalannya proses diskusi dan pengembangan produk.*
