import { ref, computed } from 'vue'
import Papa from 'papaparse'
import { SHEETS_CONFIG } from '../config/sheetsConfig.js'
import { MOCK_SHEET_1_BM_BIROKRASI, MOCK_SHEET_2_MARKAS } from '../data/mockData.js'
import {
  getKedekatanMeta,
  getStatusMarkasMeta,
  normalizeRow
} from '../utils/dataHelpers.js'

// Reactive state singleton
const boList = ref([])
const selectedBoKode = ref(null)
const activeKabupaten = ref(null)
const searchQuery = ref('')
const statusMarkasFilter = ref('all') // 'all' | 'wajib' | 'tidak-wajib'
const kedekatanFilter = ref('all') // 'all' | '1' | '2' | '3' | '4' | '5'
const amFilter = ref('all')
const provinsiFilter = ref('all')
const viewMode = ref('card') // 'card' | 'table'

const isLoading = ref(false)
const isUsingMock = ref(false)
const lastSyncTime = ref(null)
const errorMessage = ref(null)

// Pagination for BO Overview (to keep performance ultra fast for 140+ BOs)
const displayedBoCount = ref(24)

export function useDashboardData() {
  /**
   * Parser khusus untuk format array mentah (CSV multi-tier header)
   */
  function parseSheetDataFromArrays(sheet1RawRows, sheet2RawRows) {
    // 1. Ekstraksi Sheet 2 (Markas)
    const markasMap = new Map()
    let s2HeaderFound = false

    for (const row of sheet2RawRows) {
      if (!Array.isArray(row) || row.length === 0) continue

      if (!s2HeaderFound) {
        const col0 = String(row[0] || '').trim().toLowerCase()
        const col2 = String(row[2] || '').trim().toLowerCase()
        if (col0.includes('kode bo') || col2.includes('kode kabupaten')) {
          s2HeaderFound = true
        }
        continue
      }

      const kodeBo = String(row[0] || '').trim().toUpperCase()
      const namaBo = String(row[1] || '').trim()
      const kodeKab = String(row[2] || '').trim()
      const kabupaten = String(row[3] || '').trim()
      const statusMarkas = String(row[4] || 'Tidak Wajib').trim()

      if (!kodeBo && !kodeKab) continue

      if (kodeKab) {
        markasMap.set(kodeKab, {
          kodeBo,
          namaBo,
          kodeKab,
          kabupaten,
          statusMarkas: statusMarkas || 'Tidak Wajib'
        })
      }
    }

    // 2. Map penampung BO
    const boMap = new Map()
    let s1HeaderFound = false
    const processedKabIds = new Set()

    // 3. Ekstraksi Sheet 1 (BM & Birokrasi)
    for (const row of sheet1RawRows) {
      if (!Array.isArray(row) || row.length === 0) continue

      if (!s1HeaderFound) {
        const col0 = String(row[0] || '').trim().toUpperCase()
        if (col0 === 'AM') {
          s1HeaderFound = true
        }
        continue
      }

      // Lewati subheader (misal baris yang berisi 'Status', 'Jabatan', 'IGTKI')
      const col7 = String(row[7] || '').trim().toLowerCase()
      if (col7 === 'status') continue

      const am = String(row[0] || '-').trim()
      const rawKodeBo = String(row[1] || '').trim().toUpperCase()
      const rawNamaBo = String(row[2] || '').trim()
      const provinsi = String(row[3] || '').trim()
      const rawKabId = String(row[4] || '').trim()
      const kabupaten = String(row[5] || '').trim()
      const namaBm = String(row[6] || '').trim()
      const statusDinas = String(row[7] || '').trim()
      const jabatanDinas = String(row[8] || '').trim()
      const igtki = String(row[9] || '').trim()
      const k3s = String(row[10] || '').trim()
      const mkks = String(row[11] || '').trim()

      if (!rawKodeBo && !kabupaten) continue

      const kodeBo = rawKodeBo || 'BO-UNKNOWN'
      const namaBo = rawNamaBo || kodeBo
      const isProvinsi = !rawKabId || kabupaten.toLowerCase().startsWith('provinsi')
      const kabId = rawKabId || `PROV-${kodeBo}`

      if (rawKabId) processedKabIds.add(rawKabId)

      // Cari padanan markas dari Sheet 2
      const markasInfo = markasMap.get(kabId) || {
        statusMarkas: isProvinsi ? 'Tidak Wajib' : 'Tidak Wajib'
      }

      const dinasMeta = getKedekatanMeta(statusDinas)
      const igtkiMeta = getKedekatanMeta(igtki)
      const k3sMeta = getKedekatanMeta(k3s)
      const mkksMeta = getKedekatanMeta(mkks)

      // Rata-rata skor birokrasi (hanya dari yang memiliki data / tidak kosong)
      const validScores = [dinasMeta.score, igtkiMeta.score, k3sMeta.score, mkksMeta.score].filter(s => s > 0)
      const avgScore = validScores.length > 0 ? Number((validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(2)) : 0

      const kabupatenItem = {
        kabId,
        kabupaten: kabupaten || (isProvinsi ? `Provinsi ${provinsi}` : `Kabupaten ${kabId}`),
        provinsi,
        isProvinsi,
        namaBm,
        hasBm: Boolean(namaBm && namaBm !== '-' && namaBm.length > 1),
        statusMarkas: markasInfo.statusMarkas,
        statusMarkasMeta: getStatusMarkasMeta(markasInfo.statusMarkas),
        kedekatanDinas: {
          status: statusDinas,
          jabatan: jabatanDinas,
          meta: dinasMeta
        },
        organisasiProfesi: {
          igtki: { status: igtki, meta: igtkiMeta },
          k3s: { status: k3s, meta: k3sMeta },
          mkks: { status: mkks, meta: mkksMeta }
        },
        avgScore
      }

      if (!boMap.has(kodeBo)) {
        boMap.set(kodeBo, {
          kodeBo,
          namaBo,
          am,
          namaBm: namaBm || '-',
          provinsi,
          kabupatenList: []
        })
      }

      const boEntry = boMap.get(kodeBo)
      if (boEntry.am === '-' && am !== '-') boEntry.am = am
      if (boEntry.namaBo === kodeBo && namaBo !== kodeBo) boEntry.namaBo = namaBo
      if ((!boEntry.namaBm || boEntry.namaBm === '-') && namaBm) boEntry.namaBm = namaBm
      if (!boEntry.provinsi && provinsi) boEntry.provinsi = provinsi

      boEntry.kabupatenList.push(kabupatenItem)
    }

    // 4. Tambahkan kabupaten dari Sheet 2 jika ada yang belum tercover di Sheet 1 (Outer Join)
    for (const [kodeKab, markasItem] of markasMap.entries()) {
      if (!processedKabIds.has(kodeKab)) {
        const kodeBo = (markasItem.kodeBo || 'BO-UNKNOWN').trim().toUpperCase()
        const namaBo = markasItem.namaBo || kodeBo

        if (!boMap.has(kodeBo)) {
          boMap.set(kodeBo, {
            kodeBo,
            namaBo,
            am: '-',
            provinsi: '',
            kabupatenList: []
          })
        }

        const boEntry = boMap.get(kodeBo)
        boEntry.kabupatenList.push({
          kabId: kodeKab,
          kabupaten: markasItem.kabupaten || 'Kabupaten ' + kodeKab,
          provinsi: boEntry.provinsi || '',
          isProvinsi: false,
          namaBm: '',
          hasBm: false,
          statusMarkas: markasItem.statusMarkas,
          statusMarkasMeta: getStatusMarkasMeta(markasItem.statusMarkas),
          kedekatanDinas: {
            status: '',
            jabatan: '',
            meta: getKedekatanMeta('')
          },
          organisasiProfesi: {
            igtki: { status: '', meta: getKedekatanMeta('') },
            k3s: { status: '', meta: getKedekatanMeta('') },
            mkks: { status: '', meta: getKedekatanMeta('') }
          },
          avgScore: 0
        })
      }
    }

    // 5. Agregasi KPI per BO
    const aggregatedBos = Array.from(boMap.values()).map(bo => {
      const total = bo.kabupatenList.length
      const totalWajib = bo.kabupatenList.filter(k => k.statusMarkasMeta.isWajib).length
      const totalTidakWajib = total - totalWajib
      // Relasi matang = kedekatan dinas Akrab / Relasi Baik (score 4) atau Mitra Strategis (score 5)
      const totalRelasiMatang = bo.kabupatenList.filter(k => k.kedekatanDinas.meta.score >= 4).length
      const persenRelasiMatang = total > 0 ? Math.round((totalRelasiMatang / total) * 100) : 0

      const validKabScores = bo.kabupatenList.filter(k => k.avgScore > 0).map(k => k.avgScore)
      const avgScore = validKabScores.length > 0
        ? Number((validKabScores.reduce((a, b) => a + b, 0) / validKabScores.length).toFixed(1))
        : 0

      const avgScoreInt = Math.min(5, Math.max(1, Math.round(avgScore)))
      const kedekatanSummaryMeta = avgScore > 0 ? getKedekatanMeta(String(avgScoreInt)) : getKedekatanMeta('')

      return {
        ...bo,
        totalKabupaten: total,
        totalWajibMarkas: totalWajib,
        totalTidakWajibMarkas: totalTidakWajib,
        totalRelasiMatang,
        persenRelasiMatang,
        avgBirokrasiScore: avgScore,
        avgBirokrasiMeta: kedekatanSummaryMeta
      }
    })

    // Urutkan berdasarkan Kode BO
    aggregatedBos.sort((a, b) => a.kodeBo.localeCompare(b.kodeBo))

    boList.value = aggregatedBos
  }

  /**
   * Menggabungkan raw data dari Sheet 1 & Sheet 2 (dukungan format objek bawaan)
   */
  function processAndMergeData(sheet1Rows, sheet2Rows) {
    if (Array.isArray(sheet1Rows) && Array.isArray(sheet1Rows[0])) {
      parseSheetDataFromArrays(sheet1Rows, sheet2Rows)
      return
    }

    // Format objek standar
    const markasMap = new Map()
    for (const raw of sheet2Rows) {
      const row = normalizeRow(raw)
      const kodeKab = row.kodekabupaten || row.kabid || row.id || ''
      if (!kodeKab) continue

      markasMap.set(String(kodeKab).trim(), {
        kodeBo: row.kodebo || '',
        namaBo: row.namabo || '',
        kodeKabupaten: String(kodeKab).trim(),
        kabupaten: row.kabupaten || '',
        statusMarkas: row.statusmarkas || 'Tidak Wajib'
      })
    }

    const boMap = new Map()
    const processedKabIds = new Set()

    for (const raw of sheet1Rows) {
      const row = normalizeRow(raw)
      const kodeBo = (row.kodebo || 'BO-UNKNOWN').trim().toUpperCase()
      const namaBo = row.namabo || kodeBo
      const am = row.am || '-'
      const provinsi = row.provinsi || ''
      const kabId = String(row.kabid || row.kodekabupaten || '').trim()
      const kabupaten = row.kabupaten || 'Kabupaten ' + kabId
      const namaBm = row.namabm || ''

      if (kabId) processedKabIds.add(kabId)

      const markasInfo = markasMap.get(kabId) || {
        statusMarkas: 'Tidak Wajib'
      }

      const statusDinas = row.status || row.statusdinas || ''
      const jabatanDinas = row.jabatan || ''
      const statusIgtki = row.igtki || ''
      const statusK3s = row.k3s || ''
      const statusMkks = row.mkks || ''

      const dinasMeta = getKedekatanMeta(statusDinas)
      const igtkiMeta = getKedekatanMeta(statusIgtki)
      const k3sMeta = getKedekatanMeta(statusK3s)
      const mkksMeta = getKedekatanMeta(statusMkks)

      const validScores = [dinasMeta.score, igtkiMeta.score, k3sMeta.score, mkksMeta.score].filter(s => s > 0)
      const avgScore = validScores.length > 0 ? Number((validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(2)) : 0

      const kabupatenItem = {
        kabId,
        kabupaten,
        provinsi,
        isProvinsi: !kabId || kabupaten.toLowerCase().startsWith('provinsi'),
        namaBm: namaBm.trim(),
        hasBm: Boolean(namaBm && namaBm.trim() !== '-' && namaBm.trim().length > 1),
        statusMarkas: markasInfo.statusMarkas,
        statusMarkasMeta: getStatusMarkasMeta(markasInfo.statusMarkas),
        kedekatanDinas: {
          status: statusDinas,
          jabatan: jabatanDinas,
          meta: dinasMeta
        },
        organisasiProfesi: {
          igtki: { status: statusIgtki, meta: igtkiMeta },
          k3s: { status: statusK3s, meta: k3sMeta },
          mkks: { status: statusMkks, meta: mkksMeta }
        },
        avgScore
      }

      if (!boMap.has(kodeBo)) {
        boMap.set(kodeBo, {
          kodeBo,
          namaBo,
          am,
          namaBm: namaBm || '-',
          provinsi,
          kabupatenList: []
        })
      }

      const boEntry = boMap.get(kodeBo)
      if (boEntry.am === '-' && am !== '-') boEntry.am = am
      if (boEntry.namaBo === kodeBo && namaBo !== kodeBo) boEntry.namaBo = namaBo
      if ((!boEntry.namaBm || boEntry.namaBm === '-') && namaBm) boEntry.namaBm = namaBm
      if (!boEntry.provinsi && provinsi) boEntry.provinsi = provinsi

      boEntry.kabupatenList.push(kabupatenItem)
    }

    // Hitung ringkasan & KPI tiap BO
    const aggregatedBos = Array.from(boMap.values()).map(bo => {
      const total = bo.kabupatenList.length
      const totalWajib = bo.kabupatenList.filter(k => k.statusMarkasMeta.isWajib).length
      const totalTidakWajib = total - totalWajib
      const totalRelasiMatang = bo.kabupatenList.filter(k => k.kedekatanDinas.meta.score >= 4).length
      const persenRelasiMatang = total > 0 ? Math.round((totalRelasiMatang / total) * 100) : 0

      const validKabScores = bo.kabupatenList.filter(k => k.avgScore > 0).map(k => k.avgScore)
      const avgScore = validKabScores.length > 0
        ? Number((validKabScores.reduce((a, b) => a + b, 0) / validKabScores.length).toFixed(1))
        : 0

      const avgScoreInt = Math.min(5, Math.max(1, Math.round(avgScore)))
      const kedekatanSummaryMeta = avgScore > 0 ? getKedekatanMeta(String(avgScoreInt)) : getKedekatanMeta('')

      return {
        ...bo,
        totalKabupaten: total,
        totalWajibMarkas: totalWajib,
        totalTidakWajibMarkas: totalTidakWajib,
        totalRelasiMatang,
        persenRelasiMatang,
        avgBirokrasiScore: avgScore,
        avgBirokrasiMeta: kedekatanSummaryMeta
      }
    })

    aggregatedBos.sort((a, b) => a.kodeBo.localeCompare(b.kodeBo))
    boList.value = aggregatedBos
  }

  /**
   * Mengambil data dari Google Sheets URL atau fallback ke Mock Data
   */
  async function loadData() {
    isLoading.value = true
    errorMessage.value = null

    const url1 = SHEETS_CONFIG.SPREADSHEET_1_BM_BIROKRASI_CSV_URL?.trim()
    const url2 = SHEETS_CONFIG.SPREADSHEET_2_MARKAS_CSV_URL?.trim()

    if (!url1 || !url2) {
      processAndMergeData(MOCK_SHEET_1_BM_BIROKRASI, MOCK_SHEET_2_MARKAS)
      isUsingMock.value = true
      lastSyncTime.value = new Date()
      isLoading.value = false
      return
    }

    try {
      // Parameter cache-buster (_t) dan cache: 'no-cache' memastikan data langsung tersinkronkan segar dari Google Sheets setiap kali website dibuka
      const cacheBuster = '_t=' + Date.now();
      const fetchUrl1 = url1.includes('?') ? (url1 + '&' + cacheBuster) : (url1 + '?' + cacheBuster);
      const fetchUrl2 = url2.includes('?') ? (url2 + '&' + cacheBuster) : (url2 + '?' + cacheBuster);

      const [res1, res2] = await Promise.all([
        fetch(fetchUrl1, { cache: 'no-cache' }),
        fetch(fetchUrl2, { cache: 'no-cache' })
      ])

      if (!res1.ok) throw new Error(`Gagal mengunduh Sheet 1: HTTP ${res1.status}`)
      if (!res2.ok) throw new Error(`Gagal mengunduh Sheet 2: HTTP ${res2.status}`)

      const text1 = await res1.text()
      const text2 = await res2.text()

      // Parse sebagai 2D array mentah agar aman untuk multi-tier headers
      const parsed1 = Papa.parse(text1, { skipEmptyLines: true })
      const parsed2 = Papa.parse(text2, { skipEmptyLines: true })

      if (parsed1.data.length === 0 || parsed2.data.length === 0) {
        throw new Error('Data spreadsheet kosong')
      }

      parseSheetDataFromArrays(parsed1.data, parsed2.data)
      isUsingMock.value = false
      lastSyncTime.value = new Date()
    } catch (err) {
      console.error('Error fetching Google Sheets data:', err)
      errorMessage.value = `Gagal sinkronisasi data online (${err.message}). Menampilkan data cadangan.`
      processAndMergeData(MOCK_SHEET_1_BM_BIROKRASI, MOCK_SHEET_2_MARKAS)
      isUsingMock.value = true
      lastSyncTime.value = new Date()
    } finally {
      isLoading.value = false
    }
  }

  const selectedBo = computed(() => {
    if (!selectedBoKode.value) return null
    return boList.value.find(b => b.kodeBo === selectedBoKode.value) || null
  })

  // Daftar unik Area Manager (AM)
  const amList = computed(() => {
    const list = new Set()
    for (const bo of boList.value) {
      if (bo.am && bo.am !== '-') list.add(bo.am)
    }
    return Array.from(list).sort()
  })

  // Daftar unik Provinsi
  const provinsiList = computed(() => {
    const list = new Set()
    for (const bo of boList.value) {
      if (bo.provinsi && bo.provinsi !== '-') list.add(bo.provinsi)
    }
    return Array.from(list).sort()
  })

  // Filter daftar BO pada overview view
  const filteredBoList = computed(() => {
    let result = boList.value

    if (amFilter.value !== 'all') {
      result = result.filter(bo => bo.am === amFilter.value)
    }

    if (provinsiFilter.value !== 'all') {
      result = result.filter(bo => bo.provinsi === provinsiFilter.value)
    }

    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase().trim()
      result = result.filter(bo => {
        const matchBo =
          bo.namaBo.toLowerCase().includes(q) ||
          bo.kodeBo.toLowerCase().includes(q) ||
          bo.am.toLowerCase().includes(q) ||
          bo.provinsi.toLowerCase().includes(q)

        const matchKab = bo.kabupatenList.some(k =>
          k.kabupaten.toLowerCase().includes(q) ||
          k.namaBm.toLowerCase().includes(q) ||
          k.kabId.toLowerCase().includes(q)
        )
        return matchBo || matchKab
      })
    }

    return result
  })

  // Daftar BO yang tampil sesuai pagination / load more
  const paginatedBoList = computed(() => {
    // Jika ada pencarian atau filter aktif, tampilkan semua hasil filter
    if (searchQuery.value.trim() || amFilter.value !== 'all' || provinsiFilter.value !== 'all') {
      return filteredBoList.value
    }
    return filteredBoList.value.slice(0, displayedBoCount.value)
  })

  const hasMoreBo = computed(() => {
    if (searchQuery.value.trim() || amFilter.value !== 'all' || provinsiFilter.value !== 'all') {
      return false
    }
    return displayedBoCount.value < filteredBoList.value.length
  })

  function loadMoreBo() {
    displayedBoCount.value += 24
  }

  // Filter daftar kabupaten di dalam BO terpilih
  const filteredKabupatenList = computed(() => {
    if (!selectedBo.value) return []

    let list = selectedBo.value.kabupatenList

    if (statusMarkasFilter.value === 'wajib') {
      list = list.filter(k => k.statusMarkasMeta.isWajib)
    } else if (statusMarkasFilter.value === 'tidak-wajib') {
      list = list.filter(k => !k.statusMarkasMeta.isWajib)
    }

    if (kedekatanFilter.value !== 'all') {
      const targetLevel = Number(kedekatanFilter.value)
      list = list.filter(k => {
        return (
          k.kedekatanDinas.meta.level === targetLevel ||
          k.organisasiProfesi.igtki.meta.level === targetLevel ||
          k.organisasiProfesi.k3s.meta.level === targetLevel ||
          k.organisasiProfesi.mkks.meta.level === targetLevel
        )
      })
    }

    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase().trim()
      list = list.filter(k =>
        k.kabupaten.toLowerCase().includes(q) ||
        k.namaBm.toLowerCase().includes(q) ||
        k.kabId.toLowerCase().includes(q) ||
        k.kedekatanDinas.jabatan.toLowerCase().includes(q)
      )
    }

    return list
  })

  // Statistik Agregat Global Dashboard
  const globalStats = computed(() => {
    const totalBo = boList.value.length
    let totalKab = 0
    let totalWajib = 0
    let totalTidakWajib = 0
    let totalRelasiMatang = 0
    let sumScore = 0

    for (const bo of boList.value) {
      totalKab += bo.totalKabupaten
      totalWajib += bo.totalWajibMarkas
      totalTidakWajib += bo.totalTidakWajibMarkas
      totalRelasiMatang += bo.totalRelasiMatang
      sumScore += (bo.avgBirokrasiScore * bo.totalKabupaten)
    }

    const persenRelasiMatang = totalKab > 0 ? Math.round((totalRelasiMatang / totalKab) * 100) : 0
    const avgScore = totalKab > 0 ? Number((sumScore / totalKab).toFixed(1)) : 0

    return {
      totalBo,
      totalKabupaten: totalKab,
      totalMarkasWajib: totalWajib,
      totalMarkasTidakWajib: totalTidakWajib,
      totalRelasiMatang,
      persenRelasiMatang,
      avgBirokrasiScore: avgScore,
      avgBirokrasiMeta: avgScore > 0 ? getKedekatanMeta(String(Math.round(avgScore))) : getKedekatanMeta('')
    }
  })

  function selectBo(kodeBo) {
    selectedBoKode.value = kodeBo
    searchQuery.value = ''
    statusMarkasFilter.value = 'all'
    kedekatanFilter.value = 'all'
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function clearSelectedBo() {
    selectedBoKode.value = null
    searchQuery.value = ''
    statusMarkasFilter.value = 'all'
    kedekatanFilter.value = 'all'
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function openKabupatenModal(kabupaten) {
    activeKabupaten.value = kabupaten
  }

  function closeKabupatenModal() {
    activeKabupaten.value = null
  }

  return {
    boList,
    selectedBoKode,
    selectedBo,
    activeKabupaten,
    searchQuery,
    statusMarkasFilter,
    kedekatanFilter,
    amFilter,
    provinsiFilter,
    viewMode,
    isLoading,
    isUsingMock,
    lastSyncTime,
    errorMessage,
    amList,
    provinsiList,
    filteredBoList,
    paginatedBoList,
    hasMoreBo,
    loadMoreBo,
    filteredKabupatenList,
    globalStats,
    loadData,
    selectBo,
    clearSelectedBo,
    openKabupatenModal,
    closeKabupatenModal
  }
}
