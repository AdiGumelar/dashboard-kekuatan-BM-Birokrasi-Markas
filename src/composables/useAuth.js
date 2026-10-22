import { ref, computed } from 'vue'
import Papa from 'papaparse'
import { AUTH_CONFIG } from '../config/authConfig.js'
import { SHEETS_CONFIG } from '../config/sheetsConfig.js'

const STORAGE_KEY = 'bm_markas_auth_session'

// State disimpan secara reaktif di level modul (singleton)
const currentUser = ref(null)
const amAccountsMap = ref(new Map()) // normKey -> { am: string, pin: string }
const dynamicAdminPin = ref(null)
const isAccountsLoaded = ref(false)

// Isi akun fallback awal dari authConfig
function seedFallbackAccounts() {
  if (AUTH_CONFIG.amCustomPins) {
    for (const [am, pin] of Object.entries(AUTH_CONFIG.amCustomPins)) {
      const normKey = am.replace(/\s+/g, '').toUpperCase()
      amAccountsMap.value.set(normKey, { am, pin: String(pin).trim() })
    }
  }
}
seedFallbackAccounts()

// Inisialisasi membaca sesi tersimpan di browser
function loadSession() {
  if (typeof window === 'undefined') return
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && (parsed.role === 'admin' || parsed.role === 'am')) {
        currentUser.value = parsed
      }
    }
  } catch (err) {
    console.warn('Gagal membaca sesi autentikasi:', err)
  }
}
loadSession()

/**
 * Mengisi daftar akun AM langsung dari baris 2D array Sheet "Akun"
 */
function setAmAccountsFromRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) return

  let headerFound = false
  const newMap = new Map()

  for (const row of rows) {
    if (!Array.isArray(row) || row.length === 0) continue

    const col0 = String(row[0] || '').trim()
    const col1 = String(row[1] || '').trim()

    if (!headerFound) {
      if (col0.toLowerCase().includes('am') && col1.toLowerCase().includes('pin')) {
        headerFound = true
        continue
      }
    }

    if (!col0 || !col1) continue

    const normKey = col0.replace(/\s+/g, '').toUpperCase()

    // Cek jika terdapat baris kredensial Admin khusus di sheet
    if (normKey.includes('ADMIN') || normKey.includes('PUSAT')) {
      dynamicAdminPin.value = col1
      continue
    }

    newMap.set(normKey, {
      am: col0,
      pin: col1
    })
  }

  if (newMap.size > 0) {
    amAccountsMap.value = newMap
    isAccountsLoaded.value = true
  }
}

/**
 * Mengunduh data sheet Akun langsung dari Google Sheets URL
 */
async function loadAccountsFromSheet() {
  const url = SHEETS_CONFIG.SPREADSHEET_4_AKUN_CSV_URL?.trim()
  if (!url) return

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
    console.warn('Gagal memuat Sheet Akun online, menggunakan data cadangan:', err)
  }
}

// Unduh sheet Akun saat di browser
if (typeof window !== 'undefined') {
  loadAccountsFromSheet()
}

export function useAuth() {
  const isAuthenticated = computed(() => !!currentUser.value)
  const isAdmin = computed(() => currentUser.value?.role === 'admin')
  const isAm = computed(() => currentUser.value?.role === 'am')
  const currentAmCode = computed(() => currentUser.value?.amCode || null)

  // Daftar nama AM yang terdaftar di sheet Akun
  const sheetAmList = computed(() => {
    const list = []
    for (const entry of amAccountsMap.value.values()) {
      list.push(entry.am)
    }
    return list.sort()
  })

  function loginAdmin(inputPin) {
    if (!inputPin || typeof inputPin !== 'string') {
      return { success: false, message: 'Masukkan PIN / Password Administrator' }
    }

    const expectedPin = String(dynamicAdminPin.value || AUTH_CONFIG.admin?.pin || 'admin123').trim()
    if (inputPin.trim() === expectedPin) {
      const user = {
        role: 'admin',
        amCode: null,
        name: AUTH_CONFIG.admin?.name || 'Administrator Pusat',
        loginAt: new Date().toISOString()
      }
      currentUser.value = user
      saveSession(user)
      return { success: true }
    }

    return { success: false, message: 'PIN Administrator salah' }
  }

  function loginAm(amCode, inputPin) {
    if (!amCode) {
      return { success: false, message: 'Silakan pilih Area Manager (AM)' }
    }
    if (!inputPin || typeof inputPin !== 'string') {
      return { success: false, message: 'Masukkan PIN Wilayah AM' }
    }

    const cleanAm = String(amCode).trim()
    const normKey = cleanAm.replace(/\s+/g, '').toUpperCase()

    // 1. Cek dari sheet Akun Google Spreadsheet
    let expectedPin = null
    if (amAccountsMap.value.has(normKey)) {
      expectedPin = String(amAccountsMap.value.get(normKey).pin || '').trim()
    }

    // 2. Fallback ke customPins jika belum termuat dari internet
    if (!expectedPin && AUTH_CONFIG.amCustomPins) {
      for (const [key, pin] of Object.entries(AUTH_CONFIG.amCustomPins)) {
        if (key.replace(/\s+/g, '').toUpperCase() === normKey) {
          expectedPin = String(pin).trim()
          break
        }
      }
    }

    // 3. Fallback default
    if (!expectedPin) {
      expectedPin = String(AUTH_CONFIG.defaultAmPin || '').trim()
    }

    if (expectedPin && inputPin.trim() === expectedPin) {
      const user = {
        role: 'am',
        amCode: cleanAm,
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
    isAm,
    currentAmCode,
    sheetAmList,
    amAccountsMap,
    isAccountsLoaded,
    loadAccountsFromSheet,
    setAmAccountsFromRows,
    loginAdmin,
    loginAm,
    logout
  }
}
