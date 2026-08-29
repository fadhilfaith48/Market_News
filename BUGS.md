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

## BUG-001 — Hydration mismatch pada atribut className `<html>` (dev Turbopack)
- **Tanggal ditemukan:** 29 Agustus 2026
- **Prioritas:** High
- **Status:** Fixed — dihilangkan dengan melepas `next/font/google` (Geist) → system font stack (lihat DECISIONS.md)
- **Langkah reproduce:** Buka `http://localhost:3000` saat dev (Turbopack) → console error "A tree hydrated but some attributes of the server rendered HTML didn't match".
- **Dampak:** Error di console dev; markup `<html>` tidak 100% sinkron antara server & client.
- **Solusi:** Hapus class modul font (`geist_*`) dari `<html>` di `layout.tsx`; pakai system font di `globals.css`.
- **Verifikasi:** `<html lang="id" class="h-full antialiased">` dan `grep "geist"` di HTML = 0; build & lint lolos.

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
- **Status:** In Progress — auto-reconnect sudah diimplementasikan di `hooks/useBinanceWS.ts` (backoff 1s→30s), **belum diuji** pada simulasi putus koneksi nyata
- **Dampak:** Data real-time berhenti update jika koneksi ke Binance WS terputus (jaringan tidak stabil, firewall, proxy).
- **Solusi:** Implementasi `useBinanceWS` dengan auto-reconnect (exponential backoff), indikator status koneksi di UI (online/reconnecting/offline), dan fallback ke REST polling via API Route.
- **Todo pengujian:** Matikan internet/koneksi saat dev → pastikan status "Menyambung ulang…" lalu kembali "Live"; cek tidak ada multiple reconnect berjalan bersamaan.

## Known Issue 3 — Rate limit / downtime API pihak ketiga (Binance/CoinGecko)
- **ID:** KI-003
- **Prioritas:** High
- **Status:** In Progress — sebagian tertangani
- **Dampak:** Jika provider rate-limit atau down, data real-time/historis terhenti atau gagal fetch.
- **Solusi:** Caching ISR/revalidate pada API Route; fallback provider (CoinCap sebagai backup CoinGecko); adapter pattern agar mudah beralih; tampilkan timestamp "last updated" + sumber data.
- **Update 29/08/2026:** Terbukti jaringan user memblokir `stream.binance.com` & `api.binance.com` (WS → ERROR, REST → GAGAL). Endpoint `data-stream.binance.vision` jalan → fallback multi-endpoint WS sudah diimplementasikan. REST Binance ke depan via API Route (serverless), bukan dari client.

## Known Issue 4 — Batasan Vercel Hobby plan
- **ID:** KI-004
- **Prioritas:** Low
- **Status:** Known-Limit
- **Dampak:** Batas 10 detik eksekusi / 100 GB bandwidth / 100.000 request perbulan; penggunaan hanya untuk non-komersial. Jika dimonetisasi harus upgrade ke Pro ($20/bulan).
- **Solusi:** Jaga cache API Route agar request ke external API minimal; pantau penggunaan di dashboard Vercel.

## Known Issue 5 — Rendering chart saat data streaming berfrekuensi tinggi
- **ID:** KI-005
- **Prioritas:** Medium
- **Status:** Open (belum diimplementasikan)
- **Dampak:** Potensi lag/jank pada chart & tabel jika update WS masuk terlalu banyak sekaligus.
- **Solusi:** Throttle/batch update store (mis. update maks N kali per detik), memoization komponen, dan manfaatkan API incremental TradingView Lightweight Charts.

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