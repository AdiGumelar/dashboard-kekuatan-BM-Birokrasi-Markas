/**
 * Utilitas dan Helper Data Dashboard
 */

export const KEDEKATAN_LEVELS = [
  'Belum Kenal',
  'Kenal',
  'Komunikatif',
  'Akrab / Relasi Baik',
  'Mitra Strategis'
]

/**
 * Menghitung metadata & warna styling untuk 5 tingkatan kedekatan
 * Jika kosong ('', '-', atau null), tetap dikosongkan ('-') sesuai data asli
 */
export function getKedekatanMeta(val) {
  if (!val || typeof val !== 'string' || !val.trim() || val.trim() === '-') {
    return {
      level: 0,
      label: '-',
      score: 0,
      badgeClass: 'bg-slate-50 text-slate-400 border-slate-200/60',
      pillClass: 'bg-slate-50 text-slate-400',
      dotColor: 'bg-slate-300',
      barColor: 'bg-slate-200',
      textClass: 'text-slate-400',
      isEmpty: true
    }
  }

  const clean = val.trim().toLowerCase()

  if (clean.includes('mitra') || clean.includes('strategis') || clean === '5') {
    return {
      level: 5,
      label: 'Mitra Strategis',
      score: 5,
      badgeClass: 'bg-purple-50 text-purple-700 border-purple-200 ring-1 ring-purple-500/20',
      pillClass: 'bg-purple-100 text-purple-800',
      dotColor: 'bg-purple-500',
      barColor: 'bg-purple-600',
      textClass: 'text-purple-700',
      isEmpty: false
    }
  }

  if (clean.includes('akrab') || clean.includes('relasi baik') || clean.includes('relasibaik') || clean === '4') {
    return {
      level: 4,
      label: 'Akrab / Relasi Baik',
      score: 4,
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-500/20',
      pillClass: 'bg-emerald-100 text-emerald-800',
      dotColor: 'bg-emerald-500',
      barColor: 'bg-emerald-500',
      textClass: 'text-emerald-700',
      isEmpty: false
    }
  }

  if (clean.includes('komunikatif') || clean === '3') {
    return {
      level: 3,
      label: 'Komunikatif',
      score: 3,
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200 ring-1 ring-amber-500/20',
      pillClass: 'bg-amber-100 text-amber-800',
      dotColor: 'bg-amber-500',
      barColor: 'bg-amber-500',
      textClass: 'text-amber-700',
      isEmpty: false
    }
  }

  if ((clean.includes('kenal') && !clean.includes('belum')) || clean === '2') {
    return {
      level: 2,
      label: 'Kenal',
      score: 2,
      badgeClass: 'bg-sky-50 text-sky-700 border-sky-200 ring-1 ring-sky-500/20',
      pillClass: 'bg-sky-100 text-sky-800',
      dotColor: 'bg-sky-500',
      barColor: 'bg-sky-500',
      textClass: 'text-sky-700',
      isEmpty: false
    }
  }

  if (clean.includes('belum') || clean === '1') {
    return {
      level: 1,
      label: 'Belum Kenal',
      score: 1,
      badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
      pillClass: 'bg-slate-100 text-slate-700',
      dotColor: 'bg-slate-400',
      barColor: 'bg-slate-300',
      textClass: 'text-slate-500',
      isEmpty: false
    }
  }

  return {
    level: 0,
    label: '-',
    score: 0,
    badgeClass: 'bg-slate-50 text-slate-400 border-slate-200/60',
    pillClass: 'bg-slate-50 text-slate-400',
    dotColor: 'bg-slate-300',
    barColor: 'bg-slate-200',
    textClass: 'text-slate-400',
    isEmpty: true
  }
}

/**
 * Metadata & styling untuk 2 Status Markas: "Wajib" dan "Tidak Wajib"
 */
export function getStatusMarkasMeta(status) {
  if (!status || typeof status !== 'string' || !status.trim() || status.trim() === '-') {
    return {
      label: '-',
      isWajib: false,
      isTidakWajib: false,
      isEmpty: true,
      badgeClass: 'bg-slate-50 text-slate-400 border-slate-200/60',
      indicatorClass: 'bg-slate-300',
      textClass: 'text-slate-400',
      subtext: 'Tidak ada data di spreadsheet markas'
    }
  }

  const clean = status.trim().toLowerCase()
  const isWajib = clean.includes('wajib') && !clean.includes('tidak')
  const isTidakWajib = clean.includes('tidak')

  if (isWajib) {
    return {
      label: 'Wajib',
      isWajib: true,
      isTidakWajib: false,
      isEmpty: false,
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 ring-1 ring-rose-500/20',
      indicatorClass: 'bg-rose-500',
      textClass: 'text-rose-700',
      subtext: 'Status: Wajib Markas'
    }
  }

  if (isTidakWajib) {
    return {
      label: 'Tidak Wajib',
      isWajib: false,
      isTidakWajib: true,
      isEmpty: false,
      badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
      indicatorClass: 'bg-slate-400',
      textClass: 'text-slate-600',
      subtext: 'Status: Tidak Wajib Markas'
    }
  }

  return {
    label: status.trim(),
    isWajib: false,
    isTidakWajib: false,
    isEmpty: false,
    badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
    indicatorClass: 'bg-slate-400',
    textClass: 'text-slate-600',
    subtext: `Status: ${status.trim()}`
  }
}

/**
 * Metadata & styling untuk Status Penayangan:
 * - Sudah Tayang / Tayang: HIJAU
 * - Proses: KUNING
 * - Belum Tayang: MERAH
 */
export function getStatusPenayanganMeta(status) {
  if (!status || typeof status !== 'string' || !status.trim() || status.trim() === '-') {
    return {
      label: '-',
      isEmpty: true,
      isTayang: false,
      isBelumTayang: false,
      isProses: false,
      badgeClass: 'bg-slate-50 text-slate-400 border-slate-200/60',
      indicatorClass: 'bg-slate-300',
      textClass: 'text-slate-400',
      subtext: 'Belum ada data penayangan'
    }
  }

  const clean = status.trim().toLowerCase()
  const rawLabel = status.trim()

  // 1. Status Hijau: Sudah Tayang / Tayang
  if (
    (clean.includes('tayang') && !clean.includes('belum') && !clean.includes('tidak') && !clean.includes('proses')) ||
    clean === 'sudah' ||
    clean === 'aktif' ||
    clean === 'selesai' ||
    clean === 'live'
  ) {
    return {
      label: rawLabel,
      isEmpty: false,
      isTayang: true,
      isBelumTayang: false,
      isProses: false,
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-500/20',
      indicatorClass: 'bg-emerald-500',
      textClass: 'text-emerald-700',
      subtext: `Status: ${rawLabel}`
    }
  }

  // 2. Status Kuning: Proses
  if (
    clean.includes('proses') ||
    clean.includes('process') ||
    clean.includes('progress') ||
    clean.includes('draft') ||
    clean.includes('antri') ||
    clean.includes('review') ||
    clean.includes('jadwal')
  ) {
    return {
      label: rawLabel,
      isEmpty: false,
      isTayang: false,
      isBelumTayang: false,
      isProses: true,
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-300 ring-1 ring-amber-500/20',
      indicatorClass: 'bg-amber-500',
      textClass: 'text-amber-700',
      subtext: `Status: ${rawLabel}`
    }
  }

  // 3. Status Merah: Belum Tayang
  if (
    clean.includes('belum') ||
    clean.includes('tidak') ||
    clean.includes('non') ||
    clean.includes('off')
  ) {
    return {
      label: rawLabel,
      isEmpty: false,
      isTayang: false,
      isBelumTayang: true,
      isProses: false,
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 ring-1 ring-rose-500/20',
      indicatorClass: 'bg-rose-500',
      textClass: 'text-rose-700',
      subtext: `Status: ${rawLabel}`
    }
  }

  // 4. Default fleksibel jika teks kustom lainnya
  return {
    label: rawLabel,
    isEmpty: false,
    isTayang: false,
    isBelumTayang: false,
    isProses: true,
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-300 ring-1 ring-amber-500/20',
    indicatorClass: 'bg-amber-500',
    textClass: 'text-amber-700',
    subtext: `Status: ${rawLabel}`
  }
}

/**
 * Normalisasi objek baris CSV untuk menangani variasi penamaan kolom
 */
export function normalizeRow(row) {
  const normalized = {}
  for (const [rawKey, rawVal] of Object.entries(row)) {
    const key = rawKey.trim().toLowerCase().replace(/[\s_-]+/g, '')
    const val = typeof rawVal === 'string' ? rawVal.trim() : rawVal
    normalized[key] = val
  }
  return normalized
}

/**
 * Format tanggal dan waktu ke bahasa Indonesia
 */
export function formatDateTime(date) {
  if (!date) return '-'
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

/**
 * Normalisasi nama wilayah (Provinsi/Kabupaten/Kota) untuk pencocokan toleran variasi ejaan
 */
export function normalizeRegionName(name) {
  return String(name || '').trim().toLowerCase()
    .replace(/^provinsi\s+/i, '')
    .replace(/^kab\.\s+/i, '')
    .replace(/^kabupaten\s+/i, '')
    .replace(/^kota\s+/i, '')
    .replace(/[^a-z0-9]/g, '')
}
