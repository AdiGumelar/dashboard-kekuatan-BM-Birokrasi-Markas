/**
 * Konfigurasi Hak Akses & Kredensial Dashboard
 * 
 * Mendukung autentikasi:
 * 1. Administrator: Memiliki akses penuh ke seluruh AM secara nasional
 * 2. Perusahaan (PT): Memiliki akses ke wilayah Branch Office (BO) sesuai pemetaan Sheet "PT" di spreadsheet
 * 3. Area Manager (AM): Hanya dapat melihat data pada wilayah AM miliknya
 * 
 * Keamanan PIN:
 * - Seluruh PIN untuk Admin, PT, dan AM bersumber murni dari Google Spreadsheet (Sheet "Akun")
 * - Tidak ada PIN default / hardcoded di sistem
 */

export const PT_LIST = [
  {
    code: 'PCM',
    name: 'PT. Pawiyatan Cipta Mandala',
    pic: 'Pak Muryanto',
    regionLabel: 'Jateng-DIY'
  },
  {
    code: 'PWM',
    name: 'PT. Padepokan Widya Mandala',
    pic: 'Pak Diky Mahesa',
    regionLabel: 'Jatim'
  },
  {
    code: 'SPB',
    name: 'PT. Sanggar Paseban Budi',
    pic: 'Pak Rulian',
    regionLabel: 'Jabar, Banten, DKI, Lampung, Sumsel, Bengkulu, Babel'
  },
  {
    code: 'PBR',
    name: 'PT. Pustaka Betang Raya',
    pic: 'Pak Guntoro',
    regionLabel: 'Kalimantan NON Kaltim-Kaltara'
  },
  {
    code: 'TCI',
    name: 'PT. Tambo Cendekia Indonesia',
    pic: 'Pak Marjono',
    regionLabel: 'Sumatera NON SPB'
  },
  {
    code: 'LWN',
    name: 'PT. Lontara Widya Nusantara',
    pic: 'Pak Bambang Suryanto',
    regionLabel: 'Sulawesi All, Kaltim-Kaltara'
  },
  {
    code: 'CHR',
    name: 'PT. Cahaya Honai Raya',
    pic: 'Pak Katijo',
    regionLabel: 'Bali, NTB, NTT, Maluku, Malut, Irian'
  }
]

export const AUTH_CONFIG = {
  // Akun Administrator
  admin: {
    role: 'admin',
    name: 'Administrator Pusat'
  }
}
