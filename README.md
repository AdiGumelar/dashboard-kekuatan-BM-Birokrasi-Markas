# Dashboard Kekuatan BM, Birokrasi & Status Markas

Dashboard monitoring interaktif terpadu berbasis **Vue 3 + Vite + Tailwind CSS** yang dirancang untuk memetakan dan mengevaluasi persebaran kekuatan **Branch Manager (BM)**, kepatuhan **Status Markas**, **Status Penayangan Wilayah**, serta kedekatan hubungan dinas dan kemitraan organisasi profesi guru (**IGTKI**, **K3S**, **MKKS**) di seluruh Branch Office (BO) se-Indonesia.

---

## 🔐 Sistem Hak Akses (Role-Based Access Control)

Dashboard dilengkapi sistem autentikasi bertingkat berbasis PIN yang aman. **Seluruh PIN dikelola secara dinamis langsung dari Google Spreadsheet (Sheet "Akun")** tanpa adanya PIN bawaan/hardcoded di dalam kode program:

### 1. Administrator (Pusat)
- Akses monitoring penuh ke seluruh Branch Office (BO) nasional.
- Bebas memilih filter seluruh Area Manager (AM) dan Provinsi.

### 2. Perusahaan / PT (7 Entitas Wilayah)
Menampilkan data terfokus sesuai pembagian Branch Office (BO) yang ditentukan secara dinamis pada **Sheet "PT" di Google Spreadsheet**:
1. **PCM (PT. Pawiyatan Cipta Mandala)**: 19 BO (Jateng & DIY)
2. **PWM (PT. Padepokan Widya Mandala)**: 20 BO (Jawa Timur)
3. **SPB (PT. Sanggar Paseban Budi)**: 31 BO (Jabar, Banten, DKI, Lampung, Sumsel, Bengkulu, Babel)
4. **PBR (PT. Pustaka Betang Raya)**: 19 BO (Kalimantan Non Kaltim-Kaltara)
5. **TCI (PT. Tambo Cendekia Indonesia)**: 21 BO (Sumatera Non SPB)
6. **LWN (PT. Lontara Widya Nusantara)**: 17 BO (Sulawesi All, Kaltim-Kaltara)
7. **CHR (PT. Cahaya Honai Raya)**: 19 BO (Bali, NTB, NTT, Maluku, Malut, Papua)

> *Saat login sebagai PT, banner utama, judul modal, dan filter AM secara otomatis disesuaikan dengan wilayah kerja PT terkait berdasarkan data Sheet PT.*

### 3. Area Manager (AM 01 – AM 15)
- Akses terkunci khusus pada BO dan Kabupaten di bawah naungan Area Manager tersebut.
- Filter AM terkunci secara permanen selama sesi aktif.

---

## ✨ Fitur Utama & Struktur Tampilan

### 1. Level 1: Ikhtisar Wilayah & KPI Eksekutif (`BoOverview.vue`)
- **Banner Ringkasan Pintar**: Dinamis menampilkan judul sesuai hak akses (*Seluruh BO Nasional*, *Wilayah PT*, atau *Wilayah AM*).
- **5 Kartu KPI Eksekutif Interaktif** (dilengkapi modal dialog detail):
  - **Total BO**: Jumlah kantor cabang yang terpetakan.
  - **Kabupaten & Kota**: Total cakupan wilayah operasional.
  - **Wajib Markas**: Perbandingan markas Wajib vs Tidak Wajib.
  - **Status Penayangan**: Persentase wilayah Tayang, Proses, dan Belum Tayang.
  - **Kekuatan Birokrasi**: Skor rata-rata kekuatan kemitraan kedinasan dan organisasi guru (skala 1–5).
- **Toolbar Filter Terpadu**:
  - Pencarian fleksibel berdasarkan Kode BO, Nama BO, Kabupaten, atau Nama BM.
  - Filter Area Manager (AM) dan Filter Provinsi.
- **Katalog Kartu BO**: Tampilan kartu informatif dengan indikator BM, kepatuhan markas, status penayangan, dan preview kabupaten.

### 2. Modal Dialog Interaktif KPI Level 1
- **Modal Total BO (`TotalBoModal.vue`)**: Menampilkan daftar seluruh BO terdata beserta cakupan kabupaten, status markas, dan status penayangan dengan opsi filter AM & pencarian. Klik baris langsung membuka detail BO.
- **Modal Kabupaten & Kota (`TotalKabupatenModal.vue`)**: Rekapitulasi seluruh kabupaten/kota dengan tab filter status (*Semua, Wajib Markas, Tidak Wajib, Sudah Tayang*). Klik baris langsung membuka profil kabupaten.
- **Modal Status Markas (`StatusMarkasModal.vue`)**: Analisis kepatuhan markas tiap BO dengan progress bar visual persentase kepatuhan.
- **Modal Status Penayangan (`StatusPenayanganModal.vue`)**: Rekapitulasi status penayangan tiap BO (*Tayang, Proses, Belum*) dengan indikator warna status.
- **Modal Kekuatan Birokrasi (`KekuatanBirokrasiModal.vue`)**: Rekapitulasi rata-rata kedekatan hubungan dinas dan organisasi profesi guru (IGTKI, K3S, MKKS) per BO.

### 3. Level 2: Detail Branch Office (`BoDetail.vue`)
- **Navigasi & Breadcrumbs**: Memudahkan kembali ke ikhtisar utama kapan saja.
- **Statistik Khusus BO**: Ringkasan performa BO terpilih (Total Kabupaten, Kepatuhan Markas, Status Penayangan, dan Rata-rata Skor Birokrasi).
- **Mode Tampilan Ganda**:
  - **Card View**: Tampilan kartu visual interaktif untuk setiap kabupaten.
  - **Table View**: Tampilan tabel ringkas dan komprehensif.
- **Filter Wilayah Kabupaten**: Filter status markas, filter level birokrasi, dan pencarian instan.

### 4. Detail Profil Kabupaten (`KabupatenModal.vue`)
Modal evaluasi mendalam untuk masing-masing kabupaten/kota, mencakup:
- Informasi Branch Manager (BM) penanggung jawab.
- Status Kepatuhan Markas beserta catatan operasional.
- Status Penayangan Wilayah (*Tayang / Proses / Belum*).
- Skor & Status Kedekatan Dinas Pendidikan.
- Kemitraan Organisasi Profesi Guru: **IGTKI** (TK/PAUD), **K3S** (SD), dan **MKKS** (SMP/SMA).

---

## 📊 Multi-Sheet Integration Engine

Sistem mengintegrasikan **5 sheet Google Spreadsheet** yang dihubungkan secara otomatis melalui parser `papaparse`:

| Sheet | Nama Sheet | GID | Fungsi Utama |
|---|---|---|---|
| **Sheet 1** | Kekuatan BM & Birokrasi | `0` | Data master BO, Kabupaten, BM, Hubungan Kedinasan, IGTKI, K3S, MKKS |
| **Sheet 2** | Markas | `491514176` | Status Kepatuhan Markas (Wajib / Tidak Wajib) per Kabupaten |
| **Sheet 3** | Status Penayangan | `1912505094` | Status Penayangan Wilayah (Tayang / Proses / Belum) per Kabupaten |
| **Sheet 4** | Akun | `2084367455` | Data autentikasi dinamis (Header: `USER, PIN`) untuk Admin, PT, dan AM |
| **Sheet 5** | PT | `6647711` | Pemetaan dan pembagian wilayah Branch Office (BO) per Perusahaan (PT) |

---

## ⚙️ Konfigurasi Spreadsheet

URL publikasi Google Spreadsheet diatur pada file [`src/config/sheetsConfig.js`](file:///src/config/sheetsConfig.js):

```javascript
export const SHEETS_CONFIG = {
  // Spreadsheet 1: Kekuatan BM & Birokrasi
  SPREADSHEET_1_BM_BIROKRASI_CSV_URL: 'https://docs.google.com/spreadsheets/d/e/.../pub?output=csv&gid=0',

  // Spreadsheet 2: Status Markas
  SPREADSHEET_2_MARKAS_CSV_URL: 'https://docs.google.com/spreadsheets/d/e/.../pub?output=csv&gid=491514176',

  // Spreadsheet 3: Status Penayangan
  SPREADSHEET_3_PENAYANGAN_CSV_URL: 'https://docs.google.com/spreadsheets/d/e/.../pub?output=csv&gid=1912505094',

  // Spreadsheet 4: Akun & PIN
  SPREADSHEET_4_AKUN_CSV_URL: 'https://docs.google.com/spreadsheets/d/e/.../pub?output=csv&gid=2084367455',

  // Spreadsheet 5: Pembagian BO per PT (Sheet: PT)
  SPREADSHEET_5_PT_CSV_URL: 'https://docs.google.com/spreadsheets/d/e/.../pub?output=csv&gid=6647711'
}
```

> **Catatan:**
> - Jika URL spreadsheet tidak dapat dijangkau atau luring, dashboard menyediakan data *mock fallback* agar visualisasi tetap dapat dievaluasi.
> - Format kolom pada Sheet Akun menggunakan header: `USER` dan `PIN`.

---

## 🛠️ Tech Stack

- **Framework**: [Vue 3](https://vuejs.org/) (Composition API, `<script setup>`)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide Vue Next](https://lucide.dev/)
- **CSV Parser**: [Papa Parse](https://www.papaparse.com/)

---

## 🚀 Panduan Menjalankan Project

### 1. Instalasi Dependensi
```bash
npm install
```

### 2. Menjalankan di Mode Development
```bash
npm run dev
```
Aplikasi akan aktif di `http://localhost:5173`.

### 3. Membangun untuk Production (Build)
```bash
npm run build
```
File hasil kompilasi yang siap dideploy akan berada di direktori `dist/`.

### 4. Preview Hasil Build Lokal
```bash
npm run preview
```
