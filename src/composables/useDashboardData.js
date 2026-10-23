import { ref, computed, watch } from 'vue'
import Papa from 'papaparse'
import { SHEETS_CONFIG } from '../config/sheetsConfig.js'
import { MOCK_SHEET_1_BM_BIROKRASI, MOCK_SHEET_2_MARKAS, MOCK_SHEET_3_PENAYANGAN } from '../data/mockData.js'
import { useAuth } from './useAuth.js'
import {
  getKedekatanMeta,
  getStatusMarkasMeta,
  getStatusPenayanganMeta,
  normalizeRow,
  normalizeRegionName
} from '../utils/dataHelpers.js'

// Reactive state singleton
const boList = ref([])
const initialBoFromUrl = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('bo') : null
const selectedBoKode = ref(initialBoFromUrl)

// Sinkronisasi navigasi popstate (tombol Back / Forward peramban)
function handlePopState() {
  if (typeof window === 'undefined') return
  const params = new URLSearchParams(window.location.search)
  const boFromUrl = params.get('bo')
  selectedBoKode.value = boFromUrl || null
  activeKabupaten.value = null
  searchQuery.value = ''
  statusMarkasFilter.value = 'all'
  statusPenayanganFilter.value = 'all'
  kedekatanFilter.value = 'all'
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

if (typeof window !== 'undefined' && !window.__dashboardPopStateInitialized) {
  window.__dashboardPopStateInitialized = true
  window.addEventListener('popstate', handlePopState)
}
const activeKabupaten = ref(null)
const isStatusPenayanganModalOpen = ref(false)
const isStatusMarkasModalOpen = ref(false)
const isTotalBoModalOpen = ref(false)
const isTotalKabupatenModalOpen = ref(false)
const isKekuatanBirokrasiModalOpen = ref(false)
const searchQuery = ref('')
const statusMarkasFilter = ref('all') // 'all' | 'wajib' | 'tidak-wajib'
const statusPenayanganFilter = ref('all') // 'all' | 'tayang' | 'proses' | 'belum'
const kedekatanFilter = ref('all') // 'all' | '1' | '2' | '3' | '4' | '5'
const amFilter = ref('all')
const provinsiFilter = ref('all')
const viewMode = ref('table') // 'card' | 'table'

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
  function parseSheetDataFromArrays(sheet1RawRows, sheet2RawRows, sheet3RawRows = []) {
    // 1. Ekstraksi Sheet 2 (Markas)
    const markasMap = new Map() // key: kodeKab
    const markasProvMap = new Map() // key: `${kodeBo}_${norm}` & `${kodeBo}_PROV`
    const markasNameMap = new Map() // key: normName
    const allSheet2Entries = []
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
      const statusMarkas = String(row[4] || '').trim()

      if (!kodeBo && !kodeKab && !kabupaten) continue

      const entry = {
        kodeBo,
        namaBo,
        kodeKab,
        kabupaten,
        statusMarkas: statusMarkas || ''
      }
      allSheet2Entries.push(entry)

      if (kodeKab) {
        markasMap.set(kodeKab, entry)
      }
      if (kabupaten) {
        const norm = normalizeRegionName(kabupaten)
        markasNameMap.set(norm, entry)
        if (!kodeKab || kabupaten.toLowerCase().startsWith('provinsi')) {
          markasProvMap.set(`${kodeBo}_${norm}`, entry)
          markasProvMap.set(`${kodeBo}_PROV`, entry)
        }
      }
    }

    // 1b. Ekstraksi Sheet 3 (Status Penayangan)
    // Kolom: Kode BO | Nama BO | Kode Kabupaten | Kabupaten | Status Markas (Penayangan) | Terakhir Diupdate
    const penayanganBoKabMap = new Map() // key: `${kodeBo}_${kodeKab}`
    const penayanganKabMap = new Map()   // key: kodeKab
    const penayanganBoNameMap = new Map() // key: `${kodeBo}_${norm}`
    const penayanganNameMap = new Map() // key: norm
    let s3HeaderFound = false

    if (Array.isArray(sheet3RawRows) && sheet3RawRows.length > 0) {
      for (const row of sheet3RawRows) {
        if (!Array.isArray(row) || row.length === 0) continue

        if (!s3HeaderFound) {
          const col0 = String(row[0] || '').trim().toLowerCase()
          const col2 = String(row[2] || '').trim().toLowerCase()
          const col4 = String(row[4] || '').trim().toLowerCase()
          if (col0.includes('kode bo') || col2.includes('kode kabupaten') || col4.includes('status')) {
            s3HeaderFound = true
          }
          continue
        }

        const kodeBo = String(row[0] || '').trim().toUpperCase()
        const namaBo = String(row[1] || '').trim()
        const kodeKab = String(row[2] || '').trim()
        const kabupaten = String(row[3] || '').trim()
        const statusPenayangan = String(row[4] || '').trim()
        const terakhirDiupdate = String(row[5] || '').trim()

        if (!kodeBo && !kodeKab && !kabupaten && !statusPenayangan) continue

        const entry = {
          kodeBo,
          namaBo,
          kodeKab,
          kabupaten,
          statusPenayangan: statusPenayangan || '',
          terakhirDiupdate: terakhirDiupdate || ''
        }

        if (kodeBo && kodeKab) {
          penayanganBoKabMap.set(`${kodeBo}_${kodeKab}`, entry)
        }
        if (kodeKab) {
          penayanganKabMap.set(kodeKab, entry)
        }
        if (kabupaten) {
          const norm = normalizeRegionName(kabupaten)
          if (kodeBo) {
            penayanganBoNameMap.set(`${kodeBo}_${norm}`, entry)
          }
          penayanganNameMap.set(norm, entry)
        }
      }
    }

    // 2. Map penampung BO
    const boMap = new Map()
    let s1HeaderFound = false
    const processedKabIds = new Set()
    const processedMarkasEntries = new Set()

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

      // Cari padanan markas dari Sheet 2 (termasuk baris provinsi yang kode kab-nya kosong)
      let markasInfo = null
      if (rawKabId && markasMap.has(rawKabId)) {
        markasInfo = markasMap.get(rawKabId)
      } else if (isProvinsi) {
        const norm = normalizeRegionName(kabupaten || provinsi)
        markasInfo = markasProvMap.get(`${kodeBo}_${norm}`) ||
                     markasProvMap.get(`${kodeBo}_PROV`) ||
                     markasNameMap.get(norm) ||
                     null
      } else if (kabupaten) {
        const norm = normalizeRegionName(kabupaten)
        markasInfo = markasNameMap.get(norm) || null
      }

      if (markasInfo) {
        processedMarkasEntries.add(markasInfo)
      }

      const rawStatusMarkas = markasInfo ? markasInfo.statusMarkas : ''

      // Cari padanan status penayangan dari Sheet 3
      let penayanganInfo = null
      if (rawKabId) {
        if (kodeBo && penayanganBoKabMap.has(`${kodeBo}_${rawKabId}`)) {
          penayanganInfo = penayanganBoKabMap.get(`${kodeBo}_${rawKabId}`)
        } else if (penayanganKabMap.has(rawKabId)) {
          penayanganInfo = penayanganKabMap.get(rawKabId)
        }
      }
      if (!penayanganInfo && (kabupaten || provinsi)) {
        const norm = normalizeRegionName(kabupaten || provinsi)
        if (kodeBo && penayanganBoNameMap.has(`${kodeBo}_${norm}`)) {
          penayanganInfo = penayanganBoNameMap.get(`${kodeBo}_${norm}`)
        } else if (penayanganNameMap.has(norm)) {
          penayanganInfo = penayanganNameMap.get(norm)
        }
      }

      const rawStatusPenayangan = penayanganInfo ? penayanganInfo.statusPenayangan : ''
      const rawTerakhirDiupdate = penayanganInfo ? penayanganInfo.terakhirDiupdate : ''

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
        statusMarkas: rawStatusMarkas,
        statusMarkasMeta: getStatusMarkasMeta(rawStatusMarkas),
        statusPenayangan: rawStatusPenayangan,
        statusPenayanganMeta: getStatusPenayanganMeta(rawStatusPenayangan),
        penayanganTerakhirDiupdate: rawTerakhirDiupdate,
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

    // 4. Tambahkan kabupaten/provinsi dari Sheet 2 jika ada yang belum tercover di Sheet 1 (Outer Join)
    for (const markasItem of allSheet2Entries) {
      if (!processedMarkasEntries.has(markasItem) && (!markasItem.kodeKab || !processedKabIds.has(markasItem.kodeKab))) {
        const kodeBo = (markasItem.kodeBo || 'BO-UNKNOWN').trim().toUpperCase()
        const namaBo = markasItem.namaBo || kodeBo
        const kodeKab = markasItem.kodeKab

        if (!boMap.has(kodeBo)) {
          boMap.set(kodeBo, {
            kodeBo,
            namaBo,
            am: '-',
            provinsi: '',
            kabupatenList: []
          })
        }

        // Cari padanan status penayangan untuk entri outer join
        let penayanganInfo = null
        if (kodeKab) {
          if (kodeBo && penayanganBoKabMap.has(`${kodeBo}_${kodeKab}`)) {
            penayanganInfo = penayanganBoKabMap.get(`${kodeBo}_${kodeKab}`)
          } else if (penayanganKabMap.has(kodeKab)) {
            penayanganInfo = penayanganKabMap.get(kodeKab)
          }
        }
        if (!penayanganInfo && markasItem.kabupaten) {
          const norm = normalizeRegionName(markasItem.kabupaten)
          if (kodeBo && penayanganBoNameMap.has(`${kodeBo}_${norm}`)) {
            penayanganInfo = penayanganBoNameMap.get(`${kodeBo}_${norm}`)
          } else if (penayanganNameMap.has(norm)) {
            penayanganInfo = penayanganNameMap.get(norm)
          }
        }

        const rawStatusPenayangan = penayanganInfo ? penayanganInfo.statusPenayangan : ''
        const rawTerakhirDiupdate = penayanganInfo ? penayanganInfo.terakhirDiupdate : ''

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
          statusPenayangan: rawStatusPenayangan,
          statusPenayanganMeta: getStatusPenayanganMeta(rawStatusPenayangan),
          penayanganTerakhirDiupdate: rawTerakhirDiupdate,
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
      const totalTidakWajib = bo.kabupatenList.filter(k => k.statusMarkasMeta.isTidakWajib).length
      const totalTayang = bo.kabupatenList.filter(k => k.statusPenayanganMeta.isTayang).length
      const totalProses = bo.kabupatenList.filter(k => k.statusPenayanganMeta.isProses).length
      const totalBelumTayang = bo.kabupatenList.filter(k => k.statusPenayanganMeta.isBelumTayang).length
      const persenTayang = total > 0 ? Math.round((totalTayang / total) * 100) : 0
      const persenProses = total > 0 ? Math.round((totalProses / total) * 100) : 0

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
        totalTayang,
        totalProses,
        totalBelumTayang,
        persenTayang,
        persenProses,
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
   * Menggabungkan raw data dari Sheet 1, Sheet 2, & Sheet 3 (dukungan format objek)
   */
  function processAndMergeData(sheet1Rows, sheet2Rows, sheet3Rows = []) {
    if (Array.isArray(sheet1Rows) && Array.isArray(sheet1Rows[0])) {
      parseSheetDataFromArrays(sheet1Rows, sheet2Rows, sheet3Rows)
      return
    }

    // Format objek standar
    const markasMap = new Map()
    const markasProvMap = new Map()
    const markasNameMap = new Map()

    for (const raw of sheet2Rows) {
      const row = normalizeRow(raw)
      const kodeKab = String(row.kodekabupaten || row.kabid || row.id || '').trim()
      const kodeBo = String(row.kodebo || '').trim().toUpperCase()
      const kabupaten = String(row.kabupaten || '').trim()
      const statusMarkas = String(row.statusmarkas || '').trim()

      if (!kodeBo && !kodeKab && !kabupaten) continue

      const entry = {
        kodeBo,
        namaBo: row.namabo || '',
        kodeKabupaten: kodeKab,
        kabupaten,
        statusMarkas
      }

      if (kodeKab) {
        markasMap.set(kodeKab, entry)
      }
      if (kabupaten) {
        const norm = normalizeRegionName(kabupaten)
        markasNameMap.set(norm, entry)
        if (!kodeKab || kabupaten.toLowerCase().startsWith('provinsi')) {
          markasProvMap.set(`${kodeBo}_${norm}`, entry)
          markasProvMap.set(`${kodeBo}_PROV`, entry)
        }
      }
    }

    // Ekstraksi Sheet 3 (Status Penayangan) dari objek
    const penayanganBoKabMap = new Map()
    const penayanganKabMap = new Map()
    const penayanganBoNameMap = new Map()
    const penayanganNameMap = new Map()

    if (Array.isArray(sheet3Rows)) {
      for (const raw of sheet3Rows) {
        const row = normalizeRow(raw)
        const kodeBo = String(row.kodebo || '').trim().toUpperCase()
        const namaBo = row.namabo || ''
        const kodeKab = String(row.kodekabupaten || row.kabid || row.id || '').trim()
        const kabupaten = String(row.kabupaten || '').trim()
        const statusPenayangan = String(row.statuspenayangan || row.statusmarkas || row.status || '').trim()
        const terakhirDiupdate = String(row.terakhirdiupdate || row.terakhirupdate || row.updatedat || '').trim()

        if (!kodeBo && !kodeKab && !kabupaten && !statusPenayangan) continue

        const entry = {
          kodeBo,
          namaBo,
          kodeKab,
          kabupaten,
          statusPenayangan,
          terakhirDiupdate
        }

        if (kodeBo && kodeKab) {
          penayanganBoKabMap.set(`${kodeBo}_${kodeKab}`, entry)
        }
        if (kodeKab) {
          penayanganKabMap.set(kodeKab, entry)
        }
        if (kabupaten) {
          const norm = normalizeRegionName(kabupaten)
          if (kodeBo) {
            penayanganBoNameMap.set(`${kodeBo}_${norm}`, entry)
          }
          penayanganNameMap.set(norm, entry)
        }
      }
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
      const isProvinsi = !kabId || kabupaten.toLowerCase().startsWith('provinsi')

      if (kabId) processedKabIds.add(kabId)

      let markasInfo = null
      if (kabId && markasMap.has(kabId)) {
        markasInfo = markasMap.get(kabId)
      } else if (isProvinsi) {
        const norm = normalizeRegionName(kabupaten || provinsi)
        markasInfo = markasProvMap.get(`${kodeBo}_${norm}`) ||
                     markasProvMap.get(`${kodeBo}_PROV`) ||
                     markasNameMap.get(norm) ||
                     null
      } else if (kabupaten) {
        const norm = normalizeRegionName(kabupaten)
        markasInfo = markasNameMap.get(norm) || null
      }

      const rawStatusMarkas = markasInfo ? markasInfo.statusMarkas : ''

      let penayanganInfo = null
      if (kabId) {
        if (kodeBo && penayanganBoKabMap.has(`${kodeBo}_${kabId}`)) {
          penayanganInfo = penayanganBoKabMap.get(`${kodeBo}_${kabId}`)
        } else if (penayanganKabMap.has(kabId)) {
          penayanganInfo = penayanganKabMap.get(kabId)
        }
      }
      if (!penayanganInfo && (kabupaten || provinsi)) {
        const norm = normalizeRegionName(kabupaten || provinsi)
        if (kodeBo && penayanganBoNameMap.has(`${kodeBo}_${norm}`)) {
          penayanganInfo = penayanganBoNameMap.get(`${kodeBo}_${norm}`)
        } else if (penayanganNameMap.has(norm)) {
          penayanganInfo = penayanganNameMap.get(norm)
        }
      }

      const rawStatusPenayangan = penayanganInfo ? penayanganInfo.statusPenayangan : ''
      const rawTerakhirDiupdate = penayanganInfo ? penayanganInfo.terakhirDiupdate : ''

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
        statusMarkas: rawStatusMarkas,
        statusMarkasMeta: getStatusMarkasMeta(rawStatusMarkas),
        statusPenayangan: rawStatusPenayangan,
        statusPenayanganMeta: getStatusPenayanganMeta(rawStatusPenayangan),
        penayanganTerakhirDiupdate: rawTerakhirDiupdate,
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
      const totalTidakWajib = bo.kabupatenList.filter(k => k.statusMarkasMeta.isTidakWajib).length
      const totalTayang = bo.kabupatenList.filter(k => k.statusPenayanganMeta.isTayang).length
      const totalProses = bo.kabupatenList.filter(k => k.statusPenayanganMeta.isProses).length
      const totalBelumTayang = bo.kabupatenList.filter(k => k.statusPenayanganMeta.isBelumTayang).length
      const persenTayang = total > 0 ? Math.round((totalTayang / total) * 100) : 0
      const persenProses = total > 0 ? Math.round((totalProses / total) * 100) : 0

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
        totalTayang,
        totalProses,
        totalBelumTayang,
        persenTayang,
        persenProses,
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
    const url3 = SHEETS_CONFIG.SPREADSHEET_3_PENAYANGAN_CSV_URL?.trim()
    const url4 = SHEETS_CONFIG.SPREADSHEET_4_AKUN_CSV_URL?.trim()

    if (!url1 || !url2) {
      processAndMergeData(MOCK_SHEET_1_BM_BIROKRASI, MOCK_SHEET_2_MARKAS, MOCK_SHEET_3_PENAYANGAN)
      isUsingMock.value = true
      lastSyncTime.value = new Date()
      isLoading.value = false
      return
    }

    try {
      // Parameter cache-buster (_t) dan cache: 'no-cache' memastikan data langsung tersinkronkan segar dari Google Sheets setiap kali website dibuka
      const cacheBuster = '_t=' + Date.now()
      const fetchUrl1 = url1.includes('?') ? (url1 + '&' + cacheBuster) : (url1 + '?' + cacheBuster)
      const fetchUrl2 = url2.includes('?') ? (url2 + '&' + cacheBuster) : (url2 + '?' + cacheBuster)
      const fetchUrl3 = url3 ? (url3.includes('?') ? (url3 + '&' + cacheBuster) : (url3 + '?' + cacheBuster)) : null
      const fetchUrl4 = url4 ? (url4.includes('?') ? (url4 + '&' + cacheBuster) : (url4 + '?' + cacheBuster)) : null

      const fetchPromises = [
        fetch(fetchUrl1, { cache: 'no-cache' }),
        fetch(fetchUrl2, { cache: 'no-cache' })
      ]

      if (fetchUrl3) {
        fetchPromises.push(
          fetch(fetchUrl3, { cache: 'no-cache' }).catch(err => {
            console.warn('Gagal memuat Sheet 3 Status Penayangan:', err)
            return null
          })
        )
      }

      if (fetchUrl4) {
        fetchPromises.push(
          fetch(fetchUrl4, { cache: 'no-cache' }).catch(err => {
            console.warn('Gagal memuat Sheet 4 Akun:', err)
            return null
          })
        )
      }

      const [res1, res2, res3, res4] = await Promise.all(fetchPromises)

      if (!res1.ok) throw new Error(`Gagal mengunduh Sheet 1: HTTP ${res1.status}`)
      if (!res2.ok) throw new Error(`Gagal mengunduh Sheet 2: HTTP ${res2.status}`)

      const text1 = await res1.text()
      const text2 = await res2.text()
      const text3 = res3 && res3.ok ? await res3.text() : ''
      const text4 = res4 && res4.ok ? await res4.text() : ''

      // Parse sebagai 2D array mentah agar aman untuk multi-tier headers
      const parsed1 = Papa.parse(text1, { skipEmptyLines: true })
      const parsed2 = Papa.parse(text2, { skipEmptyLines: true })
      const parsed3 = text3 ? Papa.parse(text3, { skipEmptyLines: true }) : { data: [] }
      const parsed4 = text4 ? Papa.parse(text4, { skipEmptyLines: true }) : { data: [] }

      if (parsed1.data.length === 0 || parsed2.data.length === 0) {
        throw new Error('Data spreadsheet kosong')
      }

      // Perbarui akun & PIN dari Sheet 4
      if (parsed4.data && parsed4.data.length > 0) {
        setAmAccountsFromRows(parsed4.data)
      }

      parseSheetDataFromArrays(parsed1.data, parsed2.data, parsed3.data)
      isUsingMock.value = false
      lastSyncTime.value = new Date()
    } catch (err) {
      console.error('Error fetching Google Sheets data:', err)
      errorMessage.value = `Gagal sinkronisasi data online (${err.message}). Menampilkan data cadangan.`
      processAndMergeData(MOCK_SHEET_1_BM_BIROKRASI, MOCK_SHEET_2_MARKAS, MOCK_SHEET_3_PENAYANGAN)
      isUsingMock.value = true
      lastSyncTime.value = new Date()
    } finally {
      isLoading.value = false
    }
  }

  const { currentUser, isAuthenticated, isAdmin, isAm, currentAmCode, sheetAmList, setAmAccountsFromRows } = useAuth()

  // Seluruh daftar unik Area Manager dari dataset dan sheet Akun (untuk dropdown modal login)
  const rawAmList = computed(() => {
    const list = new Set()
    if (sheetAmList.value && sheetAmList.value.length > 0) {
      for (const am of sheetAmList.value) list.add(am)
    }
    for (const bo of boList.value) {
      if (bo.am && bo.am !== '-') list.add(bo.am)
    }
    return Array.from(list).sort()
  })

  // Daftar BO yang dapat diakses oleh user aktif (jika role AM, hanya BO milik AM tersebut)
  const scopedBoList = computed(() => {
    if (!isAm.value || !currentAmCode.value) {
      return boList.value
    }
    const targetNorm = currentAmCode.value.replace(/\s+/g, '').toUpperCase()
    return boList.value.filter(bo => {
      const boNorm = (bo.am || '').replace(/\s+/g, '').toUpperCase()
      return boNorm === targetNorm
    })
  })

  const selectedBo = computed(() => {
    if (!selectedBoKode.value) return null
    return scopedBoList.value.find(b => b.kodeBo === selectedBoKode.value) || null
  })

  // Daftar unik Area Manager (AM) untuk dropdown filter
  const amList = computed(() => {
    if (isAm.value && currentAmCode.value) {
      return [currentAmCode.value]
    }
    return rawAmList.value
  })

  // Sinkronisasi otomatis amFilter jika login sebagai AM
  watch([isAm, currentAmCode], ([amStatus, amCode]) => {
    if (amStatus && amCode) {
      amFilter.value = amCode
      // Jika BO yang sedang dibuka tidak berada di wilayah AM aktif, reset ke overview
      if (selectedBoKode.value) {
        const exists = scopedBoList.value.some(b => b.kodeBo === selectedBoKode.value)
        if (!exists) {
          clearSelectedBo(false)
        }
      }
    } else {
      if (amFilter.value !== 'all') {
        amFilter.value = 'all'
      }
    }
  }, { immediate: true })

  // Daftar unik Provinsi (otomatis menyesuaikan jika AM dipilih atau user login sebagai AM)
  const provinsiList = computed(() => {
    const list = new Set()
    const sourceBos = (amFilter.value !== 'all' && !isAm.value)
      ? scopedBoList.value.filter(bo => bo.am === amFilter.value)
      : scopedBoList.value

    for (const bo of sourceBos) {
      if (bo.provinsi && bo.provinsi !== '-') list.add(bo.provinsi)
      if (Array.isArray(bo.kabupatenList)) {
        for (const kab of bo.kabupatenList) {
          if (kab.provinsi && kab.provinsi !== '-') list.add(kab.provinsi)
        }
      }
    }
    return Array.from(list).sort()
  })

  // Sinkronkan filter provinsi jika AM berubah
  watch(amFilter, () => {
    if (provinsiFilter.value !== 'all' && !provinsiList.value.includes(provinsiFilter.value)) {
      provinsiFilter.value = 'all'
    }
  })

  // Filter daftar BO pada overview view
  const filteredBoList = computed(() => {
    let result = scopedBoList.value

    if (amFilter.value !== 'all' && !isAm.value) {
      result = result.filter(bo => bo.am === amFilter.value)
    }

    if (provinsiFilter.value !== 'all') {
      result = result.filter(bo =>
        bo.provinsi === provinsiFilter.value ||
        (Array.isArray(bo.kabupatenList) && bo.kabupatenList.some(k => k.provinsi === provinsiFilter.value))
      )
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
          k.kabId.toLowerCase().includes(q) ||
          (k.statusPenayangan && k.statusPenayangan.toLowerCase().includes(q))
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
      list = list.filter(k => k.statusMarkasMeta.isTidakWajib)
    }

    if (statusPenayanganFilter.value === 'tayang') {
      list = list.filter(k => k.statusPenayanganMeta.isTayang)
    } else if (statusPenayanganFilter.value === 'proses') {
      list = list.filter(k => k.statusPenayanganMeta.isProses)
    } else if (statusPenayanganFilter.value === 'belum') {
      list = list.filter(k => k.statusPenayanganMeta.isBelumTayang)
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
        (k.statusPenayangan && k.statusPenayangan.toLowerCase().includes(q)) ||
        k.kedekatanDinas.jabatan.toLowerCase().includes(q)
      )
    }

    return list
  })

  // Statistik Agregat Global Dashboard (disesuaikan dengan cakupan pengguna aktif)
  const globalStats = computed(() => {
    const totalBo = scopedBoList.value.length
    let totalKab = 0
    let totalWajib = 0
    let totalTidakWajib = 0
    let totalTayang = 0
    let totalProses = 0
    let totalBelumTayang = 0
    let totalRelasiMatang = 0
    let sumScore = 0

    for (const bo of scopedBoList.value) {
      totalKab += bo.totalKabupaten
      totalWajib += bo.totalWajibMarkas
      totalTidakWajib += bo.totalTidakWajibMarkas
      totalTayang += (bo.totalTayang || 0)
      totalProses += (bo.totalProses || 0)
      totalBelumTayang += (bo.totalBelumTayang || 0)
      totalRelasiMatang += bo.totalRelasiMatang
      sumScore += (bo.avgBirokrasiScore * bo.totalKabupaten)
    }

    const persenRelasiMatang = totalKab > 0 ? Math.round((totalRelasiMatang / totalKab) * 100) : 0
    const persenTayang = totalKab > 0 ? Math.round((totalTayang / totalKab) * 100) : 0
    const persenProses = totalKab > 0 ? Math.round((totalProses / totalKab) * 100) : 0
    const avgScore = totalKab > 0 ? Number((sumScore / totalKab).toFixed(1)) : 0

    return {
      totalBo,
      totalKabupaten: totalKab,
      totalMarkasWajib: totalWajib,
      totalMarkasTidakWajib: totalTidakWajib,
      totalPenayanganTayang: totalTayang,
      totalPenayanganProses: totalProses,
      totalPenayanganBelum: totalBelumTayang,
      persenPenayanganTayang: persenTayang,
      persenPenayanganProses: persenProses,
      totalRelasiMatang,
      persenRelasiMatang,
      avgBirokrasiScore: avgScore,
      avgBirokrasiMeta: avgScore > 0 ? getKedekatanMeta(String(Math.round(avgScore))) : getKedekatanMeta('')
    }
  })

  function selectBo(kodeBo, pushToHistory = true) {
    selectedBoKode.value = kodeBo
    searchQuery.value = ''
    statusMarkasFilter.value = 'all'
    statusPenayanganFilter.value = 'all'
    kedekatanFilter.value = 'all'
    activeKabupaten.value = null

    if (pushToHistory && typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      if (url.searchParams.get('bo') !== kodeBo) {
        url.searchParams.set('bo', kodeBo)
        window.history.pushState({ bo: kodeBo }, '', url.toString())
      }
    }

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function clearSelectedBo(useHistoryBack = true) {
    selectedBoKode.value = null
    searchQuery.value = ''
    statusMarkasFilter.value = 'all'
    statusPenayanganFilter.value = 'all'
    kedekatanFilter.value = 'all'
    activeKabupaten.value = null

    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      if (url.searchParams.has('bo')) {
        if (useHistoryBack && window.history.state && window.history.state.bo) {
          window.history.back()
        } else {
          url.searchParams.delete('bo')
          window.history.pushState({}, '', url.toString())
        }
      }
    }

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function openKabupatenModal(kabupaten) {
    activeKabupaten.value = kabupaten
  }

  function closeKabupatenModal() {
    activeKabupaten.value = null
  }

  function openStatusPenayanganModal() {
    isStatusPenayanganModalOpen.value = true
  }

  function closeStatusPenayanganModal() {
    isStatusPenayanganModalOpen.value = false
  }

  // Daftar seluruh kabupaten yang memiliki data status penayangan terdata (bukan kosong / '-')
  const kabupatenPenayanganList = computed(() => {
    const list = []
    const sourceBos = filteredBoList.value

    for (const bo of sourceBos) {
      if (!Array.isArray(bo.kabupatenList)) continue
      for (const kab of bo.kabupatenList) {
        if (kab.statusPenayanganMeta && !kab.statusPenayanganMeta.isEmpty) {
          list.push({
            ...kab,
            kodeBo: bo.kodeBo,
            namaBo: bo.namaBo,
            am: bo.am
          })
        }
      }
    }
    return list.sort((a, b) => a.kabupaten.localeCompare(b.kabupaten))
  })

  function openStatusMarkasModal() {
    isStatusMarkasModalOpen.value = true
  }

  function closeStatusMarkasModal() {
    isStatusMarkasModalOpen.value = false
  }

  function openTotalBoModal() {
    isTotalBoModalOpen.value = true
  }

  function closeTotalBoModal() {
    isTotalBoModalOpen.value = false
  }

  function openTotalKabupatenModal() {
    isTotalKabupatenModalOpen.value = true
  }

  function closeTotalKabupatenModal() {
    isTotalKabupatenModalOpen.value = false
  }

  function openKekuatanBirokrasiModal() {
    isKekuatanBirokrasiModalOpen.value = true
  }

  function closeKekuatanBirokrasiModal() {
    isKekuatanBirokrasiModalOpen.value = false
  }

  // Daftar seluruh kabupaten yang memiliki data birokrasi terdata
  const kabupatenBirokrasiList = computed(() => {
    const list = []
    const sourceBos = filteredBoList.value

    for (const bo of sourceBos) {
      if (!Array.isArray(bo.kabupatenList)) continue
      for (const kab of bo.kabupatenList) {
        if (kab.avgScore > 0 || (kab.kedekatanDinas?.meta && !kab.kedekatanDinas.meta.isEmpty)) {
          list.push({
            ...kab,
            kodeBo: bo.kodeBo,
            namaBo: bo.namaBo,
            am: bo.am
          })
        }
      }
    }
    return list.sort((a, b) => {
      if (b.avgScore !== a.avgScore) {
        return b.avgScore - a.avgScore
      }
      return a.kabupaten.localeCompare(b.kabupaten)
    })
  })

  // Daftar seluruh kabupaten & kota dari seluruh BO yang terfilter
  const allKabupatenList = computed(() => {
    const list = []
    const sourceBos = filteredBoList.value

    for (const bo of sourceBos) {
      if (!Array.isArray(bo.kabupatenList)) continue
      for (const kab of bo.kabupatenList) {
        list.push({
          ...kab,
          kodeBo: bo.kodeBo,
          namaBo: bo.namaBo,
          am: bo.am
        })
      }
    }
    return list.sort((a, b) => a.kabupaten.localeCompare(b.kabupaten))
  })

  // Daftar seluruh kabupaten yang memiliki data status markas terdata (bukan kosong / '-')
  const kabupatenMarkasList = computed(() => {
    const list = []
    const sourceBos = filteredBoList.value

    for (const bo of sourceBos) {
      if (!Array.isArray(bo.kabupatenList)) continue
      for (const kab of bo.kabupatenList) {
        if (kab.statusMarkasMeta && !kab.statusMarkasMeta.isEmpty) {
          list.push({
            ...kab,
            kodeBo: bo.kodeBo,
            namaBo: bo.namaBo,
            am: bo.am
          })
        }
      }
    }
    return list.sort((a, b) => a.kabupaten.localeCompare(b.kabupaten))
  })

  return {
    rawAmList,
    scopedBoList,
    boList,
    selectedBoKode,
    selectedBo,
    activeKabupaten,
    isStatusPenayanganModalOpen,
    kabupatenPenayanganList,
    searchQuery,
    statusMarkasFilter,
    statusPenayanganFilter,
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
    closeKabupatenModal,
    isStatusPenayanganModalOpen,
    kabupatenPenayanganList,
    openStatusPenayanganModal,
    closeStatusPenayanganModal,
    isStatusMarkasModalOpen,
    kabupatenMarkasList,
    openStatusMarkasModal,
    closeStatusMarkasModal,
    isTotalBoModalOpen,
    openTotalBoModal,
    closeTotalBoModal,
    isTotalKabupatenModalOpen,
    allKabupatenList,
    openTotalKabupatenModal,
    closeTotalKabupatenModal,
    isKekuatanBirokrasiModalOpen,
    kabupatenBirokrasiList,
    openKekuatanBirokrasiModal,
    closeKekuatanBirokrasiModal

  }
}
