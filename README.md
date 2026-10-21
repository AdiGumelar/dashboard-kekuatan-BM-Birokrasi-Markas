# Dashboard Kekuatan BM, Birokrasi & Status Markas

Dashboard interaktif berbasis **Vue 3 + Vite + Tailwind CSS** untuk memvisualisasikan data kekuatan **Branch Manager (BM)**, kedekatan birokrasi kedinasan, kedekatan organisasi profesi guru (IGTKI, K3S, MKKS), serta kepatuhan status markas di seluruh Branch Office (BO).

---

## ✨ Fitur Utama

1. **Level 1 (Ikhtisar Seluruh BO):**
   - KPI eksekutif (Total BO, Total Kabupaten, Markas Wajib vs Tidak Wajib, Keterisian BM, Rata-rata Skor Kemitraan Birokrasi).
   - Katalog kartu BO yang modern & responsif: Menampilkan Area Manager (AM), jumlah kabupaten, progress keterisian BM, breakdown status markas, dan preview daftar kabupaten.
   - Filter Area Manager (AM) & pencarian cepat.

2. **Level 2 (Detail BO & Kabupaten):**
   - Breadcrumbs & navigasi kembali yang mulus.
   - Ringkasan statistik spesifik untuk BO terpilih.
   - Toolbar filter: Filter status markas (**Wajib** / **Tidak Wajib**), filter 5 level kedekatan, serta pencarian kabupaten/BM.
   - Mode Tampilan Ganda: **Mode Kartu (Card View)** visual interaktif dan **Mode Tabel (Table View)** komprehensif.

3. **Detail Kabupaten (Modal Profile):**
   - Klik kartu/baris kabupaten untuk melihat evaluasi mendalam mengenai status markas, penugasan BM, hubungan kedinasan, dan status kemitraan dengan IGTKI, K3S, dan MKKS.

4. **Multi-Sheet Auto-Join Engine:**
   - Menggabungkan data dari 2 spreadsheet secara otomatis berdasarkan relasi `kab_id` $\equiv$ `Kode Kabupaten`.
   - Disertai data *mock* cadangan realistis saat URL spreadsheet belum diatur.

---

## ⚙️ Cara Menghubungkan Google Sheets

Sesuai kebutuhan, link spreadsheet tidak diekspos di UI melainkan dikonfigurasikan langsung di dalam file kode:

1. Buka file [`src/config/sheetsConfig.js`](file:///src/config/sheetsConfig.js).
2. Publikasikan spreadsheet Anda sebagai CSV:
   - Di Google Sheets, klik **File > Bagikan (Share) > Publikasikan ke web (Publish to web)**.
   - Pilih Sheet yang sesuai.
   - Pilih format **Nilai yang dipisahkan koma (.csv)**.
   - Klik **Publikasikan** dan salin URL yang diberikan.
3. Masukkan URL ke dalam konfigurasi:
   ```javascript
   export const SHEETS_CONFIG = {
     // Spreadsheet 1: Kekuatan BM & Birokrasi
     SPREADSHEET_1_BM_BIROKRASI_CSV_URL: 'https://docs.google.com/spreadsheets/d/e/.../pub?output=csv',

     // Spreadsheet 2: Status Markas
     SPREADSHEET_2_MARKAS_CSV_URL: 'https://docs.google.com/spreadsheets/d/e/.../pub?output=csv',

     AUTO_REFRESH_INTERVAL_MS: 5 * 60 * 1000,
   }
   ```
4. Jika salah satu URL dibiarkan kosong (`''`), dashboard akan otomatis menggunakan data contoh (mock data) bawaan.

---

## 🚀 Menjalankan Project

### 1. Mode Development
```bash
npm run dev
```

### 2. Build untuk Production
```bash
npm run build
```

### 3. Preview Hasil Build
```bash
npm run preview
```
