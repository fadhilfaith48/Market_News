# Architecture — Crypto Market Web App

**Versi Dokumen:** 1.0
**Tanggal:** 29 Agustus 2026
**Status:** Rencana (belum ada kode)

Dokumen ini menjelaskan struktur teknis proyek. AI dan developer harus membaca dokumen ini agar tetap konsisten dengan pola yang sudah ditetapkan dan **tidak membuat struktur baru yang bertentangan**. Setiap perubahan arsitektur harus tercatat di [DECISIONS.md](./DECISIONS.md).

---

## 1. Ringkasan Arsitektur

Arsitektur mengadopsi pendekatan **"Vercel-Only" (serverless, tanpa backend terpisah)**:

```
┌──────────────┐   REST (historis/metadata)    ┌──────────────┐
│  Next.js App │ ─────────────────────────────▶ │   Binance    │
│  (Vercel)    │                                │  REST API    │
│              │                                └──────────────┘
│  Frontend    │            WS (real-time)      ┌──────────────┐
│  (Browser)   │ ─────────────────────────────▶ │   Binance    │
│              │  langsung, tanpa perantara     │  WS Streams  │
└──────────────┘                                └──────────────┘
       │  ▲
       │  │
       └──┘  API Route (proxy/cache) → CoinGecko / currency API
```

Poin kunci:
- **Koneksi WebSocket dibuka langsung dari browser client** ke `wss://stream.binance.com` — tidak ada WebSocket server sendiri, sehingga tidak perlu server yang dijaga tetap hidup.
- **Data historis/metadata di-fetch via REST** — langsung dari client atau melalui Next.js API Route (sebagai proxy ringan untuk menghindari CORS / rate-limit exposure).
- **Watchlist & preferensi user disimpan di Local Storage** browser — tanpa database server.
- **Caching** memakai ISR/revalidate bawaan Next.js untuk data yang jarang berubah.

---

## 2. Tech Stack

| Lapisan | Teknologi | Keterangan |
|---|---|---|
| Framework | **Next.js (React) + TypeScript** | SSR/SSG ringan, deploy terpadu di Vercel. Tanpa PHP/Laravel. |
| Styling | **Tailwind CSS** | Utility-first, memudahkan dark/light mode. |
| State / Data Fetching | **Zustand** (state UI) + **React Query** (caching & fetching server state) | Keputusan akhir tercatat di DECISIONS.md. |
| Chart | **TradingView Lightweight Charts** (utama) / Recharts (fallback) | Candlestick + line chart real-time. |
| Real-time | **Native WebSocket API** (browser) | Langsung ke Binance WS. |
| Backend | **Next.js API Routes** (serverless) | Hanya request REST singkat (<10 detik — batas Vercel Hobby). |
| Database | **Tidak ada** di Fase 1 | Watchlist di Local Storage. (Opsional: MongoDB Atlas free tier di fase berikutnya.) |
| Deployment | **Vercel Hobby (gratis)** | Frontend + API Routes dalam satu deployment. |

---

## 3. Struktur Folder (Target)

```
market-news/
├── app/                       # Next.js App Router
│   ├── layout.tsx             # Root layout (navbar, theme provider)
│   ├── page.tsx               # Dashboard real-time (halaman utama)
│   ├── watchlist/page.tsx     # Halaman watchlist
│   ├── coin/
│   │   └── [symbol]/page.tsx  # Halaman detail koin + chart
│   └── api/                   # API Routes (REST proxy & cache)
│       ├── coins/route.ts     # Daftar koin + market cap (cache ISR)
│       ├── coins/[symbol]/route.ts   # Metadata/detail koin (cache)
│       ├── klines/route.ts    # Data historis candlestick (cache)
│       └── rate/route.ts      # Kurs mata uang (cache)
├── components/                # Komponen React (atomic/feature-based)
│   ├── layout/                #   Navbar, Footer, CurrencySelector, ThemeToggle
│   ├── dashboard/             #   MarketTable, TopGainer, TopLoser, LiveTicker
│   ├── coin/                  #   PriceChart, StatsCard, WatchlistButton
│   ├── watchlist/             #   WatchlistTable, EmptyState
│   └── ui/                    #   SearchBar, Badge, Skeleton, dsb.
├── hooks/                     # Custom hooks
│   ├── useBinanceWS.ts        # Koneksi WebSocket + auto-reconnect
│   ├── useMarketData.ts       # Query React Query untuk data pasar
│   ├── useKlines.ts           # Query data historis chart
│   ├── useCurrency.ts         # Konversi mata uang
│   └── useWatchlist.ts        # CRUD watchlist di Local Storage
├── lib/                       # Utilitas & logika inti
│   ├── binance/
│   │   ├── ws.ts              # Build URL stream, parser message
│   │   └── rest.ts            # Client REST Binance
│   ├── adapters/              # Abstraksi data provider (adapter pattern)
│   │   ├── types.ts           # Interface Coin, PriceHistory, Kline, dsb.
│   │   └── coingecko.ts       # Provider CoinGecko
│   │   └── binance.ts         # Provider Binance
│   ├── storage.ts             # Wrapper Local Storage (get/set/remove)
│   ├── format.ts              # Format harga, persentase, satuan (b, m, k)
│   └── constants.ts           # Daftar symbol, URL, interval, timeframes
├── store/                     # Zustand stores
│   ├── marketStore.ts         # Harga real-time gabungan (dari WS)
│   ├── uiStore.ts             # Theme, currency terpilih, status koneksi
│   └── watchlistStore.ts      # State watchlist
├── types/                     # TypeScript types global
│   └── index.ts
├── public/                    # Asset statis
├── .env.local                 # Variabel env (jika ada key opsional)
├── PRD.md
├── ARCHITECTURE.md
├── TASKS.md
├── PROGRESS.md
├── DECISIONS.md
└── BUGS.md
```

> Catatan: struktur di atas adalah **target**. Saat memulai implementasi, ikuti pola ini. Jika ada perubahan struktur, perbarui dokumen ini + catat di DECISIONS.md.

---

## 4. Alur Data

### 4.1 Real-Time (WebSocket Binance)
1. App `useBinanceWS` membuka koneksi ke `wss://stream.binance.com:9443/stream?streams=btcusdt@ticker/ethusdt@ticker/...`.
2. Server Binance mengirim message JSON tiap perubahan harga (ticker / bookTicker / kline).
3. Hook mem-parsing message dan menulis ke `marketStore` (Zustand).
4. Komponen tabel/ticker subscribe ke store dan re-render (dengan throttling bila perlu — lihat NFR performa).
5. Jika koneksi putus → **auto-reconnect** + indikator status koneksi di UI.

### 4.2 Historis & Metadata (REST)
1. Client memanggil **API Route** Next.js (`/api/klines`, `/api/coins`).
2. API Route meneruskan ke provider (Binance/CoinGecko) dengan **cache ISR/revalidate**.
3. Halaman detail koin menggabungkan data historis (satu kali fetch) + update live (WS) dalam satu chart.

### 4.3 Watchlist
1. `useWatchlist` membaca/menulis array `coin[]` di Local Storage (key: `crypto-watchlist`).
2. Perubahan langsung tercermin di UI via `watchlistStore`.
3. **Batasan Fase 1:** per-device/browser, tidak tersinkron antar device.

---

## 5. Keputusan Desain Sistem Utama

| # | Keputusan | Alasan | Detail di |
|---|---|---|---|
| D1 | Tanpa WebSocket server sendiri | Bisa deploy 100% gratis di Vercel Hobby; beban streaming ditanggung exchange. | DECISIONS.md |
| D2 | WS langsung client → Binance | Skalabilitas tidak dibatasi server aplikasi. | DECISIONS.md |
| D3 | Watchlist di Local Storage | Tanpa database Fase 1; sederhana & gratis. | DECISIONS.md |
| D4 | Tanpa PHP/Laravel | Eksplisit sesuai permintaan; seluruh stack JS/TS. | PRD §7 |
| D5 | API Route sebagai proxy + cache | Menghindari CORS & rate-limit exposure; hemat request API pihak ketiga. | PRD §6.2 |

---

## 6. Non-Functional Requirements Teknis

- **Latensi update < 1 detik** → WS + throttled re-render.
- **FCP < 2 detik** → SSG/SSR, code-splitting, minimal bundle.
- **Reliability** → auto-reconnect WS (exponential backoff), fallback REST polling jika WS gagal, indikator status koneksi.
- **Keamanan** → hanya WSS/HTTPS, validasi input, rate-limit pada API Route.
- **Kompatibilitas** → browser modern + responsive mobile/desktop.

---

## 7. Batasan Infrastruktur (Vercel Hobby)

- **Serverless function limit: 10 detik eksekusi / 1 GB memori / 100 GB bandwidth / 100.000 request per bulan.**
- Penggunaan **non-komersial** (personal). Upgrade ke Pro ($20/bulan) jika dimonetisasi.
- Karena tidak ada WebSocket server, batasan di atas hanya berlaku untuk API Route REST & rendering.

---

## 8. Risiko Arsitektur & Fallback

| Risiko | Mitigasi |
|---|---|
| Binance/CoinGecko rate-limit / down | Caching ISR; fallback provider CoinCap; adapter pattern agar mudah ganti provider. |
| WS client terputus | Auto-reconnect + fallback REST polling via API Route. |
| Watchlist hilang antar device | Komunikasi sebagai batasan Fase 1; opsi akun di fase berikutnya. |

---

*Dokumen living — perbarui saat arsitektur berubah, dan selalu catat alasannya di DECISIONS.md.*