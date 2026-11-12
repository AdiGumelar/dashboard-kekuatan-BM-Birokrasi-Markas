import { ref, computed } from 'vue'
import Papa from 'papaparse'
import { AUTH_CONFIG, PT_LIST } from '../config/authConfig.js'
import { SHEETS_CONFIG } from '../config/sheetsConfig.js'

const STORAGE_KEY = 'bm_markas_auth_session'

// State disimpan secara reaktif di level modul (singleton)
const currentUser = ref(null)
const amAccountsMap = ref(new Map()) // normKey -> { am: string, pin: string }
const ptAccountsMap = ref(new Map()) // ptCode -> { pt: Object, pin: string }
const dynamicAdminPin = ref(null)
const isAccountsLoaded = ref(false)
let loadAccountsPromise = null

// Cari objek PT yang cocok dari nama atau kode di sheet
function findPtByRowName(col0) {
  if (!col0) return null
  const norm = String(col0).replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
  for (const pt of PT_LIST) {
    const ptNormName = pt.name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
    const ptCode = pt.code.toUpperCase()
    if (
      norm === ptCode ||
      norm === ptNormName ||
      norm.includes(ptCode) ||
      norm.includes(ptNormName) ||
      ptNormName.includes(norm) ||
      (ptCode === 'LWN' && (norm === 'LWM' || norm.includes('LWM')))
    ) {
      return pt
    }
  }
  return null
}

// Inisialisasi membaca sesi tersimpan di browser
function loadSession() {
  if (typeof window === 'undefined') return
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && (parsed.role === 'admin' || parsed.role === 'pt' || parsed.role === 'am')) {
        currentUser.value = parsed
      }
    }
  } catch (err) {
    console.warn('Gagal membaca sesi autentikasi:', err)
  }
}
loadSession()

/**
 * Mengisi daftar akun AM, PT, & Admin langsung dari baris 2D array Sheet "Akun"
 * PIN MURNI dari spreadsheet (tanpa fallback default)
 */
function setAmAccountsFromRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) return

  let headerFound = false
  const newAmMap = new Map()
  const newPtMap = new Map()

  for (const row of rows) {
    if (!Array.isArray(row) || row.length === 0) continue

    const col0 = String(row[0] || '').trim()
    const col1 = String(row[1] || '').trim()

    if (!headerFound) {
      const c0 = col0.toLowerCase()
      const c1 = col1.toLowerCase()
      if ((c0.includes('user') || c0.includes('am') || c0.includes('akun') || c0.includes('nama')) && c1.includes('pin')) {
        headerFound = true
        continue
      }
    }

    if (!col0 || !col1) continue

    const normKey = col0.replace(/\s+/g, '').toUpperCase()

    // Abaikan jika baris merupakan label header
    if (normKey === 'USER' || normKey === 'USERNAME' || normKey === 'AM' || normKey === 'AKUN') {
      continue
    }

    // 1. Cek jika terdapat baris kredensial Admin khusus di sheet
    if (normKey.includes('ADMIN') || normKey.includes('PUSAT')) {
      dynamicAdminPin.value = col1
      continue
    }

    // 2. Cek jika baris merupakan entitas PT
    const matchedPt = findPtByRowName(col0)
    if (matchedPt) {
      newPtMap.set(matchedPt.code, {
        pt: matchedPt,
        pin: col1
      })
      continue
    }

    // 3. Sisanya adalah akun Area Manager (AM)
    newAmMap.set(normKey, {
      am: col0,
      pin: col1
    })
  }

  if (newAmMap.size > 0) {
    amAccountsMap.value = newAmMap
  }
  if (newPtMap.size > 0) {
    ptAccountsMap.value = newPtMap
  }

  isAccountsLoaded.value = true
}

/**
 * Mengunduh data sheet Akun langsung dari Google Sheets URL
 */
async function loadAccountsFromSheet() {
  const url = SHEETS_CONFIG.SPREADSHEET_4_AKUN_CSV_URL?.trim()
  if (!url) return Promise.resolve()

  if (loadAccountsPromise) return loadAccountsPromise

  loadAccountsPromise = (async () => {
    try {
      const cacheBuster = '_t=' + Date.now()
      const fetchUrl = url.includes('?') ? (url + '&' + cacheBuster) : (url + '?' + cacheBuster)
      const res = await fetch(fetchUrl, { cache: 'no-cache' })
      if (!res.ok) return
      const text = await res.text()
      const parsed = Papa.parse(text, { skipEmptyLines: true })
      if (parsed.data && parsed.data.length > 0) {
        setAmAccountsFromRows(parsed.data)
      }
    } catch (err) {
      console.warn('Gagal memuat Sheet Akun online:', err)
    } finally {
      loadAccountsPromise = null
    }
  })()

  return loadAccountsPromise
}

// Unduh sheet Akun saat di browser
if (typeof window !== 'undefined') {
  loadAccountsFromSheet()
}

export function useAuth() {
  const isAuthenticated = computed(() => !!currentUser.value)
  const isAdmin = computed(() => currentUser.value?.role === 'admin')
  const isPt = computed(() => currentUser.value?.role === 'pt')
  const isAm = computed(() => currentUser.value?.role === 'am')
  const currentPtCode = computed(() => currentUser.value?.ptCode || null)
  const currentPtInfo = computed(() => {
    const code = currentPtCode.value === 'LWM' ? 'LWN' : currentPtCode.value
    return PT_LIST.find(p => p.code === code) || null
  })
  const currentAmCode = computed(() => currentUser.value?.amCode || null)

  // Daftar nama AM yang terdaftar di sheet Akun
  const sheetAmList = computed(() => {
    const list = []
    for (const entry of amAccountsMap.value.values()) {
      list.push(entry.am)
    }
    return list.sort()
  })

  async function loginAdmin(inputPin) {
    if (!inputPin || typeof inputPin !== 'string') {
      return { success: false, message: 'Masukkan PIN / Password Administrator' }
    }

    if (!isAccountsLoaded.value) {
      await loadAccountsFromSheet()
    }

    if (!dynamicAdminPin.value) {
      return {
        success: false,
        message: 'Akun Administrator belum termuat atau belum terdaftar di spreadsheet Akun'
      }
    }

    const expectedPin = String(dynamicAdminPin.value).trim()
    if (inputPin.trim() === expectedPin) {
      const user = {
        role: 'admin',
        amCode: null,
        ptCode: null,
        name: AUTH_CONFIG.admin?.name || 'Administrator Pusat',
        loginAt: new Date().toISOString()
      }
      currentUser.value = user
      saveSession(user)
      return { success: true }
    }

    return { success: false, message: 'PIN Administrator salah' }
  }

  async function loginPt(ptCode, inputPin) {
    if (!ptCode) {
      return { success: false, message: 'Silakan pilih Perusahaan (PT)' }
    }
    if (!inputPin || typeof inputPin !== 'string') {
      return { success: false, message: 'Masukkan PIN Perusahaan (PT)' }
    }

    if (!isAccountsLoaded.value) {
      await loadAccountsFromSheet()
    }

    let cleanPt = String(ptCode).trim().toUpperCase()
    if (cleanPt === 'LWM') cleanPt = 'LWN'
    const ptItem = PT_LIST.find(p => p.code.toUpperCase() === cleanPt || p.name.toUpperCase() === cleanPt)
    if (!ptItem) {
      return { success: false, message: 'Data Perusahaan tidak ditemukan' }
    }

    // Cek dari sheet Akun Google Spreadsheet (tanpa default fallback)
    const ptAccount = ptAccountsMap.value.get(ptItem.code)
    const expectedPin = ptAccount?.pin ? String(ptAccount.pin).trim() : null

    if (!expectedPin) {
      return {
        success: false,
        message: `Akun ${ptItem.code} belum memiliki PIN di spreadsheet Akun`
      }
    }

    if (inputPin.trim() === expectedPin) {
      const user = {
        role: 'pt',
        ptCode: ptItem.code,
        amCode: null,
        name: `${ptItem.code} - ${ptItem.name}`,
        loginAt: new Date().toISOString()
      }
      currentUser.value = user
      saveSession(user)
      return { success: true }
    }

    return { success: false, message: `PIN untuk ${ptItem.name || ptItem.code} salah` }
  }

  async function loginAm(amCode, inputPin) {
    if (!amCode) {
      return { success: false, message: 'Silakan pilih Area Manager (AM)' }
    }
    if (!inputPin || typeof inputPin !== 'string') {
      return { success: false, message: 'Masukkan PIN Wilayah AM' }
    }

    if (!isAccountsLoaded.value) {
      await loadAccountsFromSheet()
    }

    const cleanAm = String(amCode).trim()
    const normKey = cleanAm.replace(/\s+/g, '').toUpperCase()

    // Cek dari sheet Akun Google Spreadsheet (tanpa default fallback)
    const amAccount = amAccountsMap.value.get(normKey)
    const expectedPin = amAccount?.pin ? String(amAccount.pin).trim() : null

    if (!expectedPin) {
      return {
        success: false,
        message: `Akun ${cleanAm} belum memiliki PIN di spreadsheet Akun`
      }
    }

    if (inputPin.trim() === expectedPin) {
      const user = {
        role: 'am',
        amCode: cleanAm,
        ptCode: null,
        name: `Area Manager (${cleanAm})`,
        loginAt: new Date().toISOString()
      }
      currentUser.value = user
      saveSession(user)
      return { success: true }
    }

    return { success: false, message: `PIN untuk ${cleanAm} salah` }
  }

  function logout() {
    currentUser.value = null
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEY)
      } catch (err) {
        console.warn('Gagal menghapus sesi auth:', err)
      }
    }
  }

  function saveSession(user) {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
      } catch (err) {
        console.warn('Gagal menyimpan sesi auth:', err)
      }
    }
  }

  return {
    currentUser,
    isAuthenticated,
    isAdmin,
    isPt,
    isAm,
    currentPtCode,
    currentPtInfo,
    currentAmCode,
    sheetAmList,
    amAccountsMap,
    ptAccountsMap,
    PT_LIST,
    isAccountsLoaded,
    loadAccountsFromSheet,
    setAmAccountsFromRows,
    loginAdmin,
    loginPt,
    loginAm,
    logout
  }
}
