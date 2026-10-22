/**
 * Konfigurasi Hak Akses & Kredensial Dashboard
 * 
 * Mendukung autentikasi:
 * 1. Administrator: Memiliki akses penuh ke seluruh AM secara nasional
 * 2. Area Manager (AM): Hanya dapat melihat data pada wilayah AM miliknya
 * 
 * Pengaturan PIN default:
 * - Admin PIN default: 'admin123' (dapat diubah via VITE_ADMIN_PIN di .env)
 * - AM PIN default: 'am123' (dapat diubah via VITE_AM_DEFAULT_PIN di .env)
 * - amCustomPins: Pemetaan PIN khusus per kode AM tertentu jika ingin PIN berbeda-beda
 */

export const AUTH_CONFIG = {
  // Akun Administrator
  admin: {
    role: 'admin',
    name: 'Administrator Pusat',
    pin: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADMIN_PIN) || '552129'
  },

  // PIN default untuk Area Manager
  defaultAmPin: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_AM_DEFAULT_PIN) || 'am123',

  // Fallback PIN bawaan dari sheet Akun (di-update otomatis secara dinamis langsung dari spreadsheet online)
  amCustomPins: {
    'AM 01': '482915',
    'AM 02': '730164',
    'AM 03': '195820',
    'AM 04': '864203',
    'AM 05': '351978',
    'AM 06': '629407',
    'AM 07': '908135',
    'AM 08': '247691',
    'AM 09': '513824',
    'AM 10': '376509',
    'AM 11': '820471',
    'AM 12': '149362',
    'AM 13': '605283',
    'AM 14': '938741',
    'AM 15': '472159'
  }
}

