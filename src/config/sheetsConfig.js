/**
 * Konfigurasi Sumber Data Google Spreadsheet
 * 
 * Link spreadsheet yang diberikan pengguna:
 * Dokumen: 2PACX-1vSQbpoB0pay7OlljsD-sVA9S8R4p-gGuKdBHnLQr1mhDVQj_pFBuAKePhlad6xVWhDEo9Kg5ox25dS1
 * - Sheet 1: Kekuatan Birokrasi (gid=0)
 * - Sheet 2: Markas (gid=491514176)
 */

export const SHEETS_CONFIG = {
  // Spreadsheet 1: Kekuatan BM & Birokrasi (Sheet: kekuatan birokrasi)
  SPREADSHEET_1_BM_BIROKRASI_CSV_URL: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSQbpoB0pay7OlljsD-sVA9S8R4p-gGuKdBHnLQr1mhDVQj_pFBuAKePhlad6xVWhDEo9Kg5ox25dS1/pub?output=csv&gid=0',

  // Spreadsheet 2: Status Markas (Sheet: markas)
  SPREADSHEET_2_MARKAS_CSV_URL: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSQbpoB0pay7OlljsD-sVA9S8R4p-gGuKdBHnLQr1mhDVQj_pFBuAKePhlad6xVWhDEo9Kg5ox25dS1/pub?output=csv&gid=491514176',

  // Interval sinkronisasi otomatis (dalam milidetik, default: 5 menit; 0 untuk nonaktif)
  AUTO_REFRESH_INTERVAL_MS: 5 * 60 * 1000,
}
