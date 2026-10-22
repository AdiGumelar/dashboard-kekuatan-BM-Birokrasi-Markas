/**
 * Konfigurasi Sumber Data Google Spreadsheet
 * 
 * Link spreadsheet yang diberikan pengguna:
 * Dokumen: 2PACX-1vSQbpoB0pay7OlljsD-sVA9S8R4p-gGuKdBHnLQr1mhDVQj_pFBuAKePhlad6xVWhDEo9Kg5ox25dS1
 * - Sheet 1: Kekuatan Birokrasi (gid=0)
 * - Sheet 2: Markas (gid=491514176)
 * - Sheet 3: Status Penayangan (gid=1912505094)
 * - Sheet 4: Akun & PIN (gid=2084367455)
 * 
 * Mendukung konfigurasi Environment Variables Vercel (VITE_SPREADSHEET_1_URL, VITE_SPREADSHEET_2_URL, VITE_SPREADSHEET_3_URL, VITE_SPREADSHEET_4_URL)
 */

export const SHEETS_CONFIG = {
  // Spreadsheet 1: Kekuatan BM & Birokrasi (Sheet: kekuatan birokrasi)
  SPREADSHEET_1_BM_BIROKRASI_CSV_URL:
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SPREADSHEET_1_URL) ||
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vSQbpoB0pay7OlljsD-sVA9S8R4p-gGuKdBHnLQr1mhDVQj_pFBuAKePhlad6xVWhDEo9Kg5ox25dS1/pub?output=csv&gid=0',

  // Spreadsheet 2: Status Markas (Sheet: markas)
  SPREADSHEET_2_MARKAS_CSV_URL:
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SPREADSHEET_2_URL) ||
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vSQbpoB0pay7OlljsD-sVA9S8R4p-gGuKdBHnLQr1mhDVQj_pFBuAKePhlad6xVWhDEo9Kg5ox25dS1/pub?output=csv&gid=491514176',

  // Spreadsheet 3: Status Penayangan (Sheet: Status Penayangan)
  SPREADSHEET_3_PENAYANGAN_CSV_URL:
    (typeof import.meta !== 'undefined' && (import.meta.env?.VITE_SPREADSHEET_3_URL || import.meta.env?.VITE_SPREADSHEET_PENAYANGAN_URL)) ||
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vSQbpoB0pay7OlljsD-sVA9S8R4p-gGuKdBHnLQr1mhDVQj_pFBuAKePhlad6xVWhDEo9Kg5ox25dS1/pub?output=csv&gid=1912505094',

  // Spreadsheet 4: Akun & PIN AM (Sheet: Akun)
  SPREADSHEET_4_AKUN_CSV_URL:
    (typeof import.meta !== 'undefined' && (import.meta.env?.VITE_SPREADSHEET_4_URL || import.meta.env?.VITE_SPREADSHEET_AKUN_URL)) ||
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vSQbpoB0pay7OlljsD-sVA9S8R4p-gGuKdBHnLQr1mhDVQj_pFBuAKePhlad6xVWhDEo9Kg5ox25dS1/pub?output=csv&gid=2084367455',

  // Interval sinkronisasi otomatis (0 untuk nonaktif; data hanya diambil saat web dibuka atau di-refresh)
  AUTO_REFRESH_INTERVAL_MS: 0,
}
