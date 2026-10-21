/**
 * Data Simulasi Realistis (Mock Data)
 * 
 * Sesuai skema 2 spreadsheet:
 * Spreadsheet 1: Kekuatan BM & Birokrasi (AM, Kode BO, Nama BO, kab_id, kabupaten, nama BM, status dinas, jabatan, IGTKI, K3S, MKKS)
 * Spreadsheet 2: Status Markas (Kode BO, Nama BO, Kode Kabupaten, Kabupaten, Status Markas)
 */

export const MOCK_SHEET_1_BM_BIROKRASI = [
  // BO-01: BO Surabaya Raya (AM: Budi Santoso)
  {
    AM: 'Budi Santoso',
    'Kode BO': 'BO-SBY',
    'Nama BO': 'BO Surabaya Raya',
    kab_id: '3578',
    kabupaten: 'Kota Surabaya',
    'nama BM': 'Ahmad Fauzi',
    status: 'Mitra Strategis',
    jabatan: 'Kepala Dinas Pendidikan Kota',
    IGTKI: 'Mitra Strategis',
    K3S: 'Akrab / Relasi Baik',
    MKKS: 'Mitra Strategis'
  },
  {
    AM: 'Budi Santoso',
    'Kode BO': 'BO-SBY',
    'Nama BO': 'BO Surabaya Raya',
    kab_id: '3515',
    kabupaten: 'Kabupaten Sidoarjo',
    'nama BM': 'Rizky Ramadhan',
    status: 'Akrab / Relasi Baik',
    jabatan: 'Sekretaris Dinas Pendidikan',
    IGTKI: 'Akrab / Relasi Baik',
    K3S: 'Komunikatif',
    MKKS: 'Akrab / Relasi Baik'
  },
  {
    AM: 'Budi Santoso',
    'Kode BO': 'BO-SBY',
    'Nama BO': 'BO Surabaya Raya',
    kab_id: '3525',
    kabupaten: 'Kabupaten Gresik',
    'nama BM': 'Dian Kusuma',
    status: 'Komunikatif',
    jabatan: 'Kabid Pembinaan SD',
    IGTKI: 'Kenal',
    K3S: 'Komunikatif',
    MKKS: 'Kenal'
  },
  {
    AM: 'Budi Santoso',
    'Kode BO': 'BO-SBY',
    'Nama BO': 'BO Surabaya Raya',
    kab_id: '3516',
    kabupaten: 'Kabupaten Mojokerto',
    'nama BM': 'Hendra Setiawan',
    status: 'Kenal',
    jabatan: 'Kasi Kurikulum Dikdas',
    IGTKI: 'Belum Kenal',
    K3S: 'Kenal',
    MKKS: 'Komunikatif'
  },

  // BO-02: BO Malang Raya (AM: Anita Wijaya)
  {
    AM: 'Anita Wijaya',
    'Kode BO': 'BO-MLG',
    'Nama BO': 'BO Malang Raya',
    kab_id: '3573',
    kabupaten: 'Kota Malang',
    'nama BM': 'Dewi Lestari',
    status: 'Mitra Strategis',
    jabatan: 'Kepala Dinas Pendidikan & Kebudayaan',
    IGTKI: 'Mitra Strategis',
    K3S: 'Mitra Strategis',
    MKKS: 'Akrab / Relasi Baik'
  },
  {
    AM: 'Anita Wijaya',
    'Kode BO': 'BO-MLG',
    'Nama BO': 'BO Malang Raya',
    kab_id: '3507',
    kabupaten: 'Kabupaten Malang',
    'nama BM': 'Agus Prabowo',
    status: 'Akrab / Relasi Baik',
    jabatan: 'Kabid Ketenagaan & PTK',
    IGTKI: 'Komunikatif',
    K3S: 'Akrab / Relasi Baik',
    MKKS: 'Komunikatif'
  },
  {
    AM: 'Anita Wijaya',
    'Kode BO': 'BO-MLG',
    'Nama BO': 'BO Malang Raya',
    kab_id: '3579',
    kabupaten: 'Kota Batu',
    'nama BM': 'Siti Nurhaliza',
    status: 'Komunikatif',
    jabatan: 'Sekretaris Dinas Pendidikan',
    IGTKI: 'Komunikatif',
    K3S: 'Kenal',
    MKKS: 'Belum Kenal'
  },
  {
    AM: 'Anita Wijaya',
    'Kode BO': 'BO-MLG',
    'Nama BO': 'BO Malang Raya',
    kab_id: '3514',
    kabupaten: 'Kabupaten Pasuruan',
    'nama BM': 'Eko Wahyudi',
    status: 'Kenal',
    jabatan: 'Kasubag Umum & Kepegawaian',
    IGTKI: 'Belum Kenal',
    K3S: 'Kenal',
    MKKS: 'Kenal'
  },

  // BO-03: BO Kediri Madiun (AM: Hendro Purnomo)
  {
    AM: 'Hendro Purnomo',
    'Kode BO': 'BO-KDR',
    'Nama BO': 'BO Kediri - Madiun',
    kab_id: '3571',
    kabupaten: 'Kota Kediri',
    'nama BM': 'Fajar Nugroho',
    status: 'Akrab / Relasi Baik',
    jabatan: 'Kepala Dinas Pendidikan',
    IGTKI: 'Akrab / Relasi Baik',
    K3S: 'Akrab / Relasi Baik',
    MKKS: 'Komunikatif'
  },
  {
    AM: 'Hendro Purnomo',
    'Kode BO': 'BO-KDR',
    'Nama BO': 'BO Kediri - Madiun',
    kab_id: '3506',
    kabupaten: 'Kabupaten Kediri',
    'nama BM': 'Bambang Irawan',
    status: 'Komunikatif',
    jabatan: 'Kabid Pembinaan SMP',
    IGTKI: 'Kenal',
    K3S: 'Komunikatif',
    MKKS: 'Komunikatif'
  },
  {
    AM: 'Hendro Purnomo',
    'Kode BO': 'BO-KDR',
    'Nama BO': 'BO Kediri - Madiun',
    kab_id: '3577',
    kabupaten: 'Kota Madiun',
    'nama BM': 'Rina Safitri',
    status: 'Mitra Strategis',
    jabatan: 'Kepala Dinas Pendidikan',
    IGTKI: 'Mitra Strategis',
    K3S: 'Mitra Strategis',
    MKKS: 'Akrab / Relasi Baik'
  },
  {
    AM: 'Hendro Purnomo',
    'Kode BO': 'BO-KDR',
    'Nama BO': 'BO Kediri - Madiun',
    kab_id: '3519',
    kabupaten: 'Kabupaten Madiun',
    'nama BM': 'Surya Dharma',
    status: 'Kenal',
    jabatan: 'Kabid Pendidikan Dasar',
    IGTKI: 'Kenal',
    K3S: 'Belum Kenal',
    MKKS: 'Kenal'
  },
  {
    AM: 'Hendro Purnomo',
    'Kode BO': 'BO-KDR',
    'Nama BO': 'BO Kediri - Madiun',
    kab_id: '3518',
    kabupaten: 'Kabupaten Nganjuk',
    'nama BM': 'Bayu Pratama',
    status: 'Belum Kenal',
    jabatan: 'Staff Pelaksana Kurikulum',
    IGTKI: 'Belum Kenal',
    K3S: 'Belum Kenal',
    MKKS: 'Belum Kenal'
  },

  // BO-04: BO Jember Banyuwangi (AM: Ratna Sari)
  {
    AM: 'Ratna Sari',
    'Kode BO': 'BO-JBR',
    'Nama BO': 'BO Tapal Kuda',
    kab_id: '3509',
    kabupaten: 'Kabupaten Jember',
    'nama BM': 'Tri Hartanto',
    status: 'Akrab / Relasi Baik',
    jabatan: 'Plt. Kepala Dinas Pendidikan',
    IGTKI: 'Komunikatif',
    K3S: 'Akrab / Relasi Baik',
    MKKS: 'Akrab / Relasi Baik'
  },
  {
    AM: 'Ratna Sari',
    'Kode BO': 'BO-JBR',
    'Nama BO': 'BO Tapal Kuda',
    kab_id: '3510',
    kabupaten: 'Kabupaten Banyuwangi',
    'nama BM': 'Maya Indah',
    status: 'Mitra Strategis',
    jabatan: 'Kepala Dinas Pendidikan',
    IGTKI: 'Mitra Strategis',
    K3S: 'Akrab / Relasi Baik',
    MKKS: 'Mitra Strategis'
  },
  {
    AM: 'Ratna Sari',
    'Kode BO': 'BO-JBR',
    'Nama BO': 'BO Tapal Kuda',
    kab_id: '3511',
    kabupaten: 'Kabupaten Bondowoso',
    'nama BM': 'Wahyu Hidayat',
    status: 'Komunikatif',
    jabatan: 'Sekretaris Disdikbud',
    IGTKI: 'Kenal',
    K3S: 'Komunikatif',
    MKKS: 'Kenal'
  },
  {
    AM: 'Ratna Sari',
    'Kode BO': 'BO-JBR',
    'Nama BO': 'BO Tapal Kuda',
    kab_id: '3512',
    kabupaten: 'Kabupaten Situbondo',
    'nama BM': '',
    status: 'Belum Kenal',
    jabatan: 'Belum Terpetakan',
    IGTKI: 'Belum Kenal',
    K3S: 'Belum Kenal',
    MKKS: 'Belum Kenal'
  },

  // BO-05: BO Surakarta & DIY (AM: Danang Prasetyo)
  {
    AM: 'Danang Prasetyo',
    'Kode BO': 'BO-SOC',
    'Nama BO': 'BO Solo Raya & DIY',
    kab_id: '3372',
    kabupaten: 'Kota Surakarta',
    'nama BM': 'Gilang Wicaksono',
    status: 'Mitra Strategis',
    jabatan: 'Kepala Dinas Pendidikan Kota Solo',
    IGTKI: 'Mitra Strategis',
    K3S: 'Mitra Strategis',
    MKKS: 'Mitra Strategis'
  },
  {
    AM: 'Danang Prasetyo',
    'Kode BO': 'BO-SOC',
    'Nama BO': 'BO Solo Raya & DIY',
    kab_id: '3471',
    kabupaten: 'Kota Yogyakarta',
    'nama BM': 'Aditya Pratama',
    status: 'Akrab / Relasi Baik',
    jabatan: 'Kepala Dinas Dikpora DIY',
    IGTKI: 'Akrab / Relasi Baik',
    K3S: 'Komunikatif',
    MKKS: 'Akrab / Relasi Baik'
  },
  {
    AM: 'Danang Prasetyo',
    'Kode BO': 'BO-SOC',
    'Nama BO': 'BO Solo Raya & DIY',
    kab_id: '3310',
    kabupaten: 'Kabupaten Klaten',
    'nama BM': 'Indah Permata',
    status: 'Komunikatif',
    jabatan: 'Kabid Dikdas Klaten',
    IGTKI: 'Komunikatif',
    K3S: 'Komunikatif',
    MKKS: 'Kenal'
  },
  {
    AM: 'Danang Prasetyo',
    'Kode BO': 'BO-SOC',
    'Nama BO': 'BO Solo Raya & DIY',
    kab_id: '3311',
    kabupaten: 'Kabupaten Sukoharjo',
    'nama BM': 'Yusuf Maulana',
    status: 'Kenal',
    jabatan: 'Kasi Kesiswaan Disdikbud',
    IGTKI: 'Kenal',
    K3S: 'Belum Kenal',
    MKKS: 'Kenal'
  }
]

export const MOCK_SHEET_2_MARKAS = [
  // BO-01: BO Surabaya Raya
  {
    'Kode BO': 'BO-SBY',
    'Nama BO': 'BO Surabaya Raya',
    'Kode Kabupaten': '3578',
    Kabupaten: 'Kota Surabaya',
    'Status Markas': 'Wajib'
  },
  {
    'Kode BO': 'BO-SBY',
    'Nama BO': 'BO Surabaya Raya',
    'Kode Kabupaten': '3515',
    Kabupaten: 'Kabupaten Sidoarjo',
    'Status Markas': 'Wajib'
  },
  {
    'Kode BO': 'BO-SBY',
    'Nama BO': 'BO Surabaya Raya',
    'Kode Kabupaten': '3525',
    Kabupaten: 'Kabupaten Gresik',
    'Status Markas': 'Tidak Wajib'
  },
  {
    'Kode BO': 'BO-SBY',
    'Nama BO': 'BO Surabaya Raya',
    'Kode Kabupaten': '3516',
    Kabupaten: 'Kabupaten Mojokerto',
    'Status Markas': 'Tidak Wajib'
  },

  // BO-02: BO Malang Raya
  {
    'Kode BO': 'BO-MLG',
    'Nama BO': 'BO Malang Raya',
    'Kode Kabupaten': '3573',
    Kabupaten: 'Kota Malang',
    'Status Markas': 'Wajib'
  },
  {
    'Kode BO': 'BO-MLG',
    'Nama BO': 'BO Malang Raya',
    'Kode Kabupaten': '3507',
    Kabupaten: 'Kabupaten Malang',
    'Status Markas': 'Wajib'
  },
  {
    'Kode BO': 'BO-MLG',
    'Nama BO': 'BO Malang Raya',
    'Kode Kabupaten': '3579',
    Kabupaten: 'Kota Batu',
    'Status Markas': 'Tidak Wajib'
  },
  {
    'Kode BO': 'BO-MLG',
    'Nama BO': 'BO Malang Raya',
    'Kode Kabupaten': '3514',
    Kabupaten: 'Kabupaten Pasuruan',
    'Status Markas': 'Tidak Wajib'
  },

  // BO-03: BO Kediri Madiun
  {
    'Kode BO': 'BO-KDR',
    'Nama BO': 'BO Kediri - Madiun',
    'Kode Kabupaten': '3571',
    Kabupaten: 'Kota Kediri',
    'Status Markas': 'Wajib'
  },
  {
    'Kode BO': 'BO-KDR',
    'Nama BO': 'BO Kediri - Madiun',
    'Kode Kabupaten': '3506',
    Kabupaten: 'Kabupaten Kediri',
    'Status Markas': 'Tidak Wajib'
  },
  {
    'Kode BO': 'BO-KDR',
    'Nama BO': 'BO Kediri - Madiun',
    'Kode Kabupaten': '3577',
    Kabupaten: 'Kota Madiun',
    'Status Markas': 'Wajib'
  },
  {
    'Kode BO': 'BO-KDR',
    'Nama BO': 'BO Kediri - Madiun',
    'Kode Kabupaten': '3519',
    Kabupaten: 'Kabupaten Madiun',
    'Status Markas': 'Tidak Wajib'
  },
  {
    'Kode BO': 'BO-KDR',
    'Nama BO': 'BO Kediri - Madiun',
    'Kode Kabupaten': '3518',
    Kabupaten: 'Kabupaten Nganjuk',
    'Status Markas': 'Tidak Wajib'
  },

  // BO-04: BO Tapal Kuda
  {
    'Kode BO': 'BO-JBR',
    'Nama BO': 'BO Tapal Kuda',
    'Kode Kabupaten': '3509',
    Kabupaten: 'Kabupaten Jember',
    'Status Markas': 'Wajib'
  },
  {
    'Kode BO': 'BO-JBR',
    'Nama BO': 'BO Tapal Kuda',
    'Kode Kabupaten': '3510',
    Kabupaten: 'Kabupaten Banyuwangi',
    'Status Markas': 'Wajib'
  },
  {
    'Kode BO': 'BO-JBR',
    'Nama BO': 'BO Tapal Kuda',
    'Kode Kabupaten': '3511',
    Kabupaten: 'Kabupaten Bondowoso',
    'Status Markas': 'Tidak Wajib'
  },
  {
    'Kode BO': 'BO-JBR',
    'Nama BO': 'BO Tapal Kuda',
    'Kode Kabupaten': '3512',
    Kabupaten: 'Kabupaten Situbondo',
    'Status Markas': 'Tidak Wajib'
  },

  // BO-05: BO Solo Raya & DIY
  {
    'Kode BO': 'BO-SOC',
    'Nama BO': 'BO Solo Raya & DIY',
    'Kode Kabupaten': '3372',
    Kabupaten: 'Kota Surakarta',
    'Status Markas': 'Wajib'
  },
  {
    'Kode BO': 'BO-SOC',
    'Nama BO': 'BO Solo Raya & DIY',
    'Kode Kabupaten': '3471',
    Kabupaten: 'Kota Yogyakarta',
    'Status Markas': 'Wajib'
  },
  {
    'Kode BO': 'BO-SOC',
    'Nama BO': 'BO Solo Raya & DIY',
    'Kode Kabupaten': '3310',
    Kabupaten: 'Kabupaten Klaten',
    'Status Markas': 'Tidak Wajib'
  },
  {
    'Kode BO': 'BO-SOC',
    'Nama BO': 'BO Solo Raya & DIY',
    'Kode Kabupaten': '3311',
    Kabupaten: 'Kabupaten Sukoharjo',
    'Status Markas': 'Tidak Wajib'
  }
]

