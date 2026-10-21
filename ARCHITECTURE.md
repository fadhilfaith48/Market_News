# Architecture — Crypto Market Web App

**Versi Dokumen:** 1.4 (17 September 2026 — fallback REST polling `/api/tickers`, harden koneksi WS)
**Tanggal:** 29 Agustus 2026
**Status:** Aktif — fitur inti terimplementasi (dashboard real-time, detail koin 2 kolom, candlestick live, watchlist panel, search & currency, market cap/supply, sort & filter tabel, fallback REST saat WS gagal)

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
       └──┘  API Route (proxy/cache) → CoinGecko (fallback CoinPaprika) / currency API
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
│   ├── layout.tsx             # Root layout (navbar, theme provider, MarketDataProvider)
│   ├── page.tsx               # Dashboard real-time (halaman utama)
│   ├── error.tsx              # Global error boundary (TV-styled, tombol retry)
│   ├── loading.tsx            # Fallback loading global (shimmer)
│   ├── not-found.tsx          # Halaman 404 global (TV-styled)
│   ├── coin/
│   │   └── [code]/page.tsx    # Halaman detail koin + chart (2 kolom, E1) — dynamicParams=false
│   └── api/                   # API Routes (REST proxy & cache)
│       ├── coins/route.ts     # Market cap/supply via lib/adapters: CoinGecko → fallback CoinPaprika (cache 300s, timeout 6s)
│       ├── coin-info/route.ts # Profil koin (deskripsi/kategori/link) via lib/adapters/coinInfo (cache 1 jam)
│       ├── klines/route.ts    # Data historis candlestick (cache)
│       ├── tickers/route.ts   # Snapshot harga 24j Binance (fallback REST, cache 5s, timeout 6s)
│       └── rate/route.ts      # Kurs mata uang (proxy open.er-api.com, cache 1 jam)
├── components/                # Komponen React (atomic/feature-based)
│   ├── layout/                #   Header (SearchBox + CurrencySelect + toggle Watchlist), Footer, Logo, ThemeToggle
│   ├── dashboard/             #   TickerTable (sort&filter), MarketDataProvider, LiveTicker, TopMovers
│   ├── coin/                  #   PriceChart (candle/line/area + volume + MA), ChartToolbar, CoinQuoteBar, CoinInfoPanel, CoinAbout
│   ├── watchlist/             #   WatchlistPanel — panel sidebar drawer (menggantikan halaman /watchlist)
│   ├── portfolio/             #   PortfolioPanel (drawer) + HoldingEditor (form posisi di halaman koin)
│   ├── alerts/                #   AlertsPanel (drawer) + AlertQuickAdd (tombol ▲/▼ di halaman koin)
│   ├── monitoring/            #   DiagnosticsPanel — drawer log error & performa (ring localStorage)
│   └── ui/                    #   CoinIcon, ConnectionBadge, WatchStar, SearchBox, CurrencySelect, Toaster, skeleton
├── hooks/                     # Custom hooks
│   ├── useBinanceWS.ts        # Koneksi WebSocket + auto-reconnect (timeout 5s, saved endpoint)
│   ├── useKlines.ts           # Query data historis chart
│   ├── useKlineStream.ts      # Subskripsi candle live (WS) dari store
│   ├── useFiatRates.ts        # Kurs mata uang via /api/rate
│   ├── useCoinMarket.ts       # Market cap/supply via /api/coins
│   ├── useCoinInfo.ts         # Profil koin (deskripsi/kategori/link) via /api/coin-info
│   ├── useTickerPolling.ts    # Fallback REST polling 5s saat WS offline (via /api/tickers)
│   ├── useMonitoring.ts       # Tangkap onerror/unhandledrejection + PerformanceObserver → monitoringStore
│   ├── useToast.ts             # Helper toast(tone, title, description?) → toastStore
│   └── useWatchlist.ts        # CRUD watchlist di Local Storage       [belum — langsung via watchStore]
├── lib/                       # Utilitas & logika inti
│   ├── binance/
│   │   ├── ws.ts              # Build URL stream, parser WS + parser REST 24hr ticker (parseTickersRest)
│   │   └── rest.ts            # Client REST Binance
│   ├── adapters/              # Abstraksi data provider (adapter pattern) — provider market cap/supply (C)
│   │   ├── types.ts           # CoinMarketAsset, MarketSource, CoinsResult
│   │   ├── coingecko.ts       # Provider #1: normalizeCoinGecko + fetch CoinGecko (timeout 6s, revalidate 300)
│   │   ├── coinpaprika.ts     # Provider #2 (fallback): COINPAPRIKA_IDS + normalize + fetch bulk /v1/tickers
│   │   ├── coinInfo.ts        # Profil koin: normalizeCoinInfo + fetch CoinGecko /coins/{id} (timeout 6s, revalidate 3600)
│   │   └── index.ts           # getCoinMarketAssets: CoinGecko → CoinPaprika (DI `fetchers` utk unit test)
│   ├── coinMeta.ts            # COIN_NAMES, LOGO_OVERRIDES, COINGECKO_IDS, getCoinMeta
│   ├── indicators.ts          # sma/ema/movingAverage/toIndicatorPoints (pure, unit-testable)
│   ├── sort.ts                # sortRows & applyRangeFilter (tabel dashboard)
│   ├── monitoring.ts          # createLogEntry/appendLog (ring buffer), errorToEntry, sanitizeLogs, captureErrorContext
│   ├── wsEndpoint.ts          # loadSavedEndpoint/saveGoodEndpoint/endpointOf (ingat endpoint WS yang berhasil)
│   ├── storage.ts             # Wrapper Local Storage (get/set/remove)
│   ├── format.ts              # Format harga, persentase, compact (K/M/B/T), convertPrice/formatCurrency
│   └── constants.ts           # Daftar symbol, URL, interval, timeframes, konstanta WS/polling
├── store/                     # Zustand stores
│   ├── marketStore.ts         # Harga real-time gabungan (dari WS)
│   ├── uiStore.ts             # Theme, currency, watchlistOpen/portfolioOpen/alertsOpen/diagnosticsOpen, status koneksi
│   ├── portfolioStore.ts      # State portofolio (persist `crypto-portfolio`)
│   ├── alertStore.ts          # State price alert (persist `crypto-alerts`)
│   ├── monitoringStore.ts     # Ring buffer log diagnostik (persist `crypto-diagnostics`)
│   ├── watchStore.ts          # State watchlist (persist `crypto-watchlist`)
│   └── toastStore.ts          # Toast umpan balik aksi (in-memory, tidak di-persist)
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

> Catatan: struktur di atas adalah **target** (tanda `[belum]` = belum diimplementasikan; `[E1]` = dibuat pada rombak gaya TradingView). Saat ada perubahan struktur, perbarui dokumen ini + catat di DECISIONS.md.

---

## 4. Alur Data

### 4.1 Real-Time (WebSocket Binance)
1. App `useBinanceWS` membuka koneksi ke `wss://stream.binance.com:9443/stream?streams=...` (mulai dari endpoint tersimpan di localStorage `binance-ws-endpoint`; connect **timeout 5s** → tutup & rotasi endpoint bila belum `onopen`; endpoint yang berhasil disimpan ulang).
2. Server Binance mengirim message JSON tiap perubahan harga (ticker / bookTicker / kline).
3. Hook mem-parsing message dan menulis ke `marketStore` (Zustand).
4. Komponen tabel/ticker subscribe ke store dan re-render (dengan throttling bila perlu — lihat NFR performa).
5. Jika koneksi putus → **auto-reconnect** (backoff 1s→15s, rotasi endpoint, tidak reset index di tiap open) + indikator status koneksi di UI.
6. **Fallback REST polling** — jika WS belum `online`, `useTickerPolling` mem-fetch `/api/tickers` tiap 5s dan mengisi `marketStore` yang sama (indikator "· REST" di `ConnectionBadge`; state `dataSource` di `uiStore`).

### 4.2 Historis & Metadata (REST)
1. Client memanggil **API Route** Next.js (`/api/klines`, `/api/coins`, `/api/tickers`).
2. API Route meneruskan ke provider (Binance/CoinGecko) dengan **cache ISR/revalidate** (`/api/tickers`: cache 5s + timeout 6s agar gagal-cepat bila provider diblokir; `/api/coins`: CoinGecko → fallback CoinPaprika, cache 300s + timeout 6s).
3. Halaman detail koin menggabungkan data historis (satu kali fetch) + update live (WS) dalam satu chart.

### 4.3 Watchlist
1. `watchStore` (Zustand) membaca/menulis array base code coin di Local Storage (key: `crypto-watchlist`).
2. Perubahan langsung tercermin di UI via store (ikon ☆/★ di tabel & detail, dan panel).
3. **Tampilan watchlist = panel sidebar drawer** (`WatchlistPanel`) yang di-toggle global — **bukan halaman `/watchlist`** (keputusan 30 Agustus 2026, E1). Data live koin favorit diambil dari `marketStore` (WS global 20 ticker), dengan grouping "Watchlist Saya / Top Gainers / Semua Koin".
4. **Batasan Fase 1:** per-device/browser, tidak tersinkron antar device.

### 4.4 Observability (monitoring lokal)
1. `useMonitoring` (dipasang sekali di `MarketDataProvider`) menangkap `window.onerror`, `unhandledrejection`, dan `PerformanceObserver` (paint, LCP, CLS).
2. Setiap catatan masuk ke `monitoringStore` sebagai **ring buffer 200 entri terakhir** (persist `crypto-diagnostics`) — tanpa pengiriman ke server (tanpa dependency).
3. `DiagnosticsPanel` (drawer; tombol gauge di Header + badge error yang belum dibaca) menampilkan, memfilter, menyalin, dan membersihkan log; membuka panel menandai log sebagai "dibaca" (`markViewed`).

### 4.5 Market Intel (Global Stats + Fear & Greed + Berita per koin)

1. **Global Market Stats** — `coins/global` dicek dulu pada `hooks/useGlobalMarket` (TanStack Query `["global-market"]`, stale 300s). Bila lewat batas, client request `GET /api/global` → handler memanggil `fetchGlobalMarket` (CoinGecko `/api/v3/global`, timeout 6s, `revalidate:300`), respons dinormalisasi `normalizeCoinGeckoGlobal` → `{ market, updatedAt }` (cache 60s ISR). `MarketOverview` merender bar statistik (Total M.Cap, Volume 24j, Dominasi BTC/ETH, Δ24j); field kosong → "—".
2. **Fear & Greed Index** — `hooks/useFearGreed` (`["fear-greed"]`, stale 1800s) → `GET /api/fear-greed` → `fetchFearGreed` (alternative.me `/fng/?limit=1`, timeout 6s, cache 300s ISR) → `normalizeFearGreed` (nilai angka, timestamp detik→ms) → `{ index, updatedAt }`. `FearGreedGauge` menampilkan skor + klasifikasi (Sangat Takut→Sangat Serakah).
3. **Berita per koin (0 request baru)** — `CoinNewsSection` memakai `useNews` yang sama di dashboard (feed RSS 4 sumber, merge + limit `NEWS_LIMIT`). Artikel **difilter client-side** oleh `filterArticlesByCoin(articles, code, name, id)` di `lib/news.ts`: membangun `coinSearchTerms` dari kode + kata nama + segmen id CoinGecko (stopwords dibuang), lalu mencocokkan title+summary secara case-insensitive dengan regex **word boundary**. Komponen `ArticleItem` (baru) dipakai bersama oleh `NewsSection` (dashboard) dan `CoinNewsSection` (halaman koin).

### 4.6 Toast (umpan balik aksi & alert)

1. **`store/toastStore.ts`** — Zustand ringan (tanpa persist) berisi `toasts: Toast[]` + `add(tone, title, description?)` (mengembalikan id unik) / `dismiss(id)` / `clear()`. Tone: `success | error | warning | info` → memetakan ke warna token up/down/warning/interactive.
2. **`components/ui/Toaster.tsx`** — mount sekali di `app/layout.tsx` (root). Wadah `fixed` kanan bawah (`aria-live="polite"`), menumpuk ke atas; tiap kartu auto-dismiss 4,2 detik + tombol tutup. Satu-satunya komponen yang memanggil store ini secara global.
3. **`hooks/useToast.ts`** — helper `toast(tone, title, description?)` berbasis `useCallback` agar stabil di komponen.
4. **Pemakai (feedback aksi):** `HoldingEditor` (simpan/hapus posisi), `AlertsPanel` (tambah alert + hasil izin notifikasi), `PortfolioPanel` (hapus posisi), `DiagnosticsPanel` (salin/bersihkan log).
5. **Alert in-app:** `hooks/usePriceAlertWatcher.ts` — selain `Notification` browser, alert yang ter-trigger juga memunculkan toast `warning` (judul "Alert {kode} tertrigger", detail arah + harga sekarang). Menutup celah saat izin notifikasi ditolak / tab tidak aktif.

### 4.7 Chart Pro (volume + tipe grafik + moving average)

1. **`lib/indicators.ts`** — helper **pure** untuk moving average: `sma(values, period)`, `ema(values, period)`, `movingAverage(values, period, kind)`, `toIndicatorPoints(values, timestamps)`, `movingAveragePoints(closes, period, kind)`. Konvensi: nilai `null` = masa pemanasan (warm-up) → titik tidak digambar. Semua di-unit-test (`tests/indicators.test.ts`).
2. **`components/coin/PriceChart.tsx`** — satu instance chart, tiga series:
   - **Harga utama** — `CandlestickSeries` / `LineSeries` / `AreaSeries` sesuai `chartType` (state lokal di `CoinDetail`; chart di-recreate saat tipe berubah).
   - **Volume** — `HistogramSeries` pada price scale terpisah (`priceScaleId: "volume"`, sumbu disembunyikan, `scaleMargins` 0.82/0) → bar volume mengisi ~18% bawah chart, warna hijau/merah mengikuti arah candle.
   - **Overlay MA** — `LineSeries` per periode aktif (default MA7 + MA25), `priceLineVisible`/`lastValueVisible`/`crosshairMarkerVisible` dimatikan agar tidak ramai. MA7 berwarna warning, MA25 interactive.
3. **Siklus hidup chart** — chart dibuat satu kali per kombinasi tema + tipe grafik (`useEffect` deps `[isDark, chartType]`); data historis & candle live diterapkan lewat handle yang disimpan di ref (`handlesRef`), sehingga **tidak** ada re-create chart saat tick streaming masuk. Perubahan historis → `setData`; perubahan live → `update()` (hanya titik terakhir). MA: `setData` saat data/aktifasi berubah, `update()` saat live bergerak.
4. **Data live digabung** — helper `mergeCandles(historical, live)` menyambung candle live ke candle terakhir (high/low = max/min, close & volume terbaru) atau menambahkannya bila sudah lewat — dipakai bersama oleh series harga, volume, dan MA agar semuanya konsisten.
5. **`components/coin/ChartToolbar.tsx`** — dua baris: (a) toggle tipe grafik (Candle/Line/Area) + chip MA (MA7/MA25, `aria-pressed`); (b) timeframe (7 interval, scroll horizontal di mobile) + jam UTC. State MA & tipe grafik **tidak di-persist** (sama seperti timeframe).

### 4.8 Profil koin ("Tentang koin")

1. **`lib/adapters/coinInfo.ts`** — `fetchCoinInfo(code)` → CoinGecko `/api/v3/coins/{id}?localization=false&tickers=false&market_data=false&community_data=false&developer_data=false&sparkline=false` (timeout 6s, `revalidate: 3600`). Normalisasi pure `normalizeCoinInfo(raw, code)` → `{ code, description, homepage, explorer, whitepaper, categories }`. Helper `firstUrl` hanya menerima http/https; `readDescription` men-strip HTML (reuse `stripHtml` dari `lib/news.ts`) & memotong 600 karakter; `readCategories` membuang entri kosong/"None".
2. **`app/api/coin-info/route.ts`** — `GET /api/coin-info?code=BTC`; validasi `VALID_CODES` (400 bila tidak dikenal), 502 bila provider gagal.
3. **`hooks/useCoinInfo.ts`** — React Query `["coin-info", code]`, stale 1 jam, retry 1.
4. **`components/coin/CoinAbout.tsx`** — card "Tentang {nama koin}" (deskripsi max 6 baris + tombol "Selengkapnya", chip kategori max 4, tautan Website/Explorer/Whitepaper dengan `rel="noopener noreferrer"`, kredit sumber CoinGecko). Skeleton shimmer saat memuat; bila gagal → komponen tidak dirender (halaman tetap bersih). Dipasang di `CoinDetail` di bawah chart, sebelum `CoinNewsSection`.

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
- **Reliability** → auto-reconnect WS (exponential backoff), fallback REST polling jika WS gagal, indikator status koneksi, dan **log error/performa lokal** (`monitoringStore`) untuk diagnosa tanpa infrastruktur.
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
| Binance/CoinGecko rate-limit / down | Caching ISR; fallback provider CoinPaprika (via lib/adapters); adapter pattern agar mudah ganti provider. |
| alternative.me / CoinGecko `/global` turun / rate-limit | Caching ISR (60s/300s) + UI menampilkan "—" tanpa crash (MarketOverview), gauge menampilkan state kosong (FearGreedGauge). |
| WS client terputus | Auto-reconnect + fallback REST polling via API Route. |
| Watchlist hilang antar device | Komunikasi sebagai batasan Fase 1; opsi akun di fase berikutnya. |

---

*Dokumen living — perbarui saat arsitektur berubah, dan selalu catat alasannya di DECISIONS.md.*