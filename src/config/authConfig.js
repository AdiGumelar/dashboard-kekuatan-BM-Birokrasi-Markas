/**
 * Konfigurasi Hak Akses & Kredensial Dashboard
 * 
 * Mendukung autentikasi:
 * 1. Administrator: Memiliki akses penuh ke seluruh AM secara nasional
 * 2. Perusahaan (PT): Memiliki akses ke wilayah provinsi di bawah naungan PT terkait
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
    regionLabel: 'Jateng-DIY',
    provinces: [
      'Jawa Tengah',
      'Daerah Istimewa Yogyakarta'
    ]
  },
  {
    code: 'PWM',
    name: 'PT. Padepokan Widya Mandala',
    pic: 'Pak Diky Mahesa',
    regionLabel: 'Jatim',
    provinces: [
      'Jawa Timur'
    ]
  },
  {
    code: 'SPB',
    name: 'PT. Sanggar Paseban Budi',
    pic: 'Pak Rulian',
    regionLabel: 'Jabar, Banten, DKI, Lampung, Sumsel, Bengkulu, Babel',
    provinces: [
      'Jawa Barat',
      'Banten',
      'Daerah Khusus Ibukota Jakarta',
      'Lampung',
      'Sumatera Selatan',
      'Bengkulu',
      'Kepulauan Bangka Belitung'
    ]
  },
  {
    code: 'PBR',
    name: 'PT. Pustaka Betang Raya',
    pic: 'Pak Guntoro',
    regionLabel: 'Kalimantan NON Kaltim-Kaltara',
    provinces: [
      'Kalimantan Barat',
      'Kalimantan Tengah',
      'Kalimantan Selatan'
    ]
  },
  {
    code: 'TCI',
    name: 'PT. Tambo Cendekia Indonesia',
    pic: 'Pak Marjono',
    regionLabel: 'Sumatera NON SPB',
    provinces: [
      'Aceh',
      'Sumatera Utara',
      'Sumatera Barat',
      'Riau',
      'Kepulauan Riau',
      'Jambi'
    ]
  },
  {
    code: 'LWM',
    name: 'PT. Lontara Widya Nusantara',
    pic: 'Pak Bambang Suryanto',
    regionLabel: 'Sulawesi All, Kaltim-Kaltara',
    provinces: [
      'Sulawesi Barat',
      'Sulawesi Selatan',
      'Sulawesi Tengah',
      'Sulawesi Tenggara',
      'Sulawesi Utara',
      'Gorontalo',
      'Kalimantan Timur',
      'Kalimantan Utara'
    ]
  },
  {
    code: 'CHR',
    name: 'PT. Cahaya Honai Raya',
    pic: 'Pak Katijo',
    regionLabel: 'Bali, NTB, NTT, Maluku, Malut, Irian',
    provinces: [
      'Bali',
      'Nusa Tenggara Barat',
      'Nusa Tenggara Timur',
      'Maluku',
      'Maluku Utara',
      'Papua',
      'Papua Barat',
      'Papua Barat Daya',
      'Papua Pegunungan',
      'Papua Selatan',
      'Papua Tengah'
    ]
  }
]

export const AUTH_CONFIG = {
  // Akun Administrator
  admin: {
    role: 'admin',
    name: 'Administrator Pusat'
  }
}
