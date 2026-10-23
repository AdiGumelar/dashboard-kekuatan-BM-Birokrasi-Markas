<script setup>
import { ref, computed } from 'vue'
import {
  Building2,
  Users,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  Sparkles
} from '@lucide/vue'
import { useAuth } from '../composables/useAuth'

const props = defineProps({
  amList: {
    type: Array,
    default: () => []
  }
})

const { loginAdmin, loginAm } = useAuth()

const activeTab = ref('am') // 'am' | 'admin'
const selectedAm = ref('')
const pinInput = ref('')
const showPassword = ref(false)
const errorMessage = ref('')
const isSubmitting = ref(false)

// Set default selected AM jika list tersedia
if (props.amList && props.amList.length > 0) {
  selectedAm.value = props.amList[0]
}

function handleTabChange(tab) {
  activeTab.value = tab
  pinInput.value = ''
  errorMessage.value = ''
}

function handleLogin() {
  errorMessage.value = ''
  isSubmitting.value = true

  try {
    let result
    if (activeTab.value === 'am') {
      result = loginAm(selectedAm.value, pinInput.value)
    } else {
      result = loginAdmin(pinInput.value)
    }

    if (!result.success) {
      errorMessage.value = result.message || 'Kredensial tidak valid'
    }
  } catch (err) {
    errorMessage.value = 'Terjadi kesalahan saat verifikasi: ' + err.message
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in">
    <div class="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transition-all">
      <!-- Card Header -->
      <div class="relative bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-7 sm:p-8 overflow-hidden text-center">
        <!-- Glow accent -->
        <div class="absolute -right-8 -bottom-8 w-40 h-40 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none"></div>
        <div class="absolute -left-8 -top-8 w-40 h-40 bg-sky-500/20 rounded-full blur-2xl pointer-events-none"></div>

        <div class="relative z-10 flex flex-col items-center">
          <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-sky-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 mb-3.5">
            <Building2 class="w-7 h-7" />
          </div>
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-semibold text-indigo-200 mb-2 border border-white/10">
            <Sparkles class="w-3 h-3 text-indigo-300" />
            <span>Portal Akses Wilayah & Markas</span>
          </div>
          <h2 class="text-xl sm:text-2xl font-extrabold tracking-tight text-white leading-tight">
            Dashboard BM & Markas
          </h2>
          <p class="text-xs sm:text-sm text-slate-300 mt-1 max-w-xs leading-relaxed">
            Silakan masuk sesuai hak akses Anda untuk melihat data dan metrik wilayah.
          </p>
        </div>
      </div>

      <!-- Tab Switcher -->
      <div class="px-6 pt-6">
        <div class="grid grid-cols-2 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80 text-xs font-bold text-slate-600">
          <button
            type="button"
            @click="handleTabChange('am')"
            :class="[
              'flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl transition-all cursor-pointer',
              activeTab === 'am'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'hover:text-slate-900 hover:bg-slate-200/50'
            ]"
          >
            <Users class="w-4 h-4" />
            <span>Area Manager (AM)</span>
          </button>

          <button
            type="button"
            @click="handleTabChange('admin')"
            :class="[
              'flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl transition-all cursor-pointer',
              activeTab === 'admin'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'hover:text-slate-900 hover:bg-slate-200/50'
            ]"
          >
            <ShieldCheck class="w-4 h-4" />
            <span>Pusat</span>
          </button>
        </div>
      </div>

      <!-- Form Body -->
      <form @submit.prevent="handleLogin" class="p-6 sm:p-7 space-y-4">
        <!-- Error Alert -->
        <div v-if="errorMessage" class="flex items-center gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
          <AlertCircle class="w-4 h-4 shrink-0 text-rose-600" />
          <span>{{ errorMessage }}</span>
        </div>

        <!-- Field: Tab Area Manager -->
        <div v-if="activeTab === 'am'" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1.5">
              Pilih Area Manager:
            </label>
            <select
              v-model="selectedAm"
              class="w-full px-3.5 py-2.5 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 cursor-pointer transition-all"
            >
              <option v-if="props.amList.length === 0" value="">Memuat daftar AM...</option>
              <option v-for="am in props.amList" :key="am" :value="am">
                {{ am }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1.5">
              PIN Akses Wilayah:
            </label>
            <div class="relative">
              <input
                v-model="pinInput"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Masukkan PIN AM..."
                class="w-full pl-3.5 pr-10 py-2.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all font-mono"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <EyeOff v-if="showPassword" class="w-4 h-4" />
                <Eye v-else class="w-4 h-4" />
              </button>
            </div>
            <p class="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
              <span>🔒 Masukkan PIN 6-digit yang sesuai</span>
            </p>
          </div>
        </div>

        <!-- Field: Tab Admin -->
        <div v-else class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1.5">
              PIN / Password Administrator:
            </label>
            <div class="relative">
              <input
                v-model="pinInput"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Masukkan PIN Admin..."
                class="w-full pl-3.5 pr-10 py-2.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all font-mono"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <EyeOff v-if="showPassword" class="w-4 h-4" />
                <Eye v-else class="w-4 h-4" />
              </button>
            </div>
            <p class="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
              <span>🔒 Masukkan PIN Administrator yang sesuai</span>
            </p>
          </div>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="isSubmitting"
          class="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] shadow-md shadow-indigo-500/25 transition-all cursor-pointer disabled:opacity-50"
        >
          <span>{{ activeTab === 'am' ? `Masuk sebagai ${selectedAm || 'AM'}` : 'Masuk sebagai Administrator' }}</span>
          <ArrowRight class="w-4 h-4" />
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.97); }
  to { opacity: 1; transform: scale(1); }
}

.animate-fade-in {
  animation: fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>

