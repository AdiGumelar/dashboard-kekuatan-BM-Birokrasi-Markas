<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  Building2,
  X,
  Search,
  User,
  Sparkles,
  MapPin,
  ShieldAlert,
  Tv,
  ChevronRight,
  Filter
} from '@lucide/vue'
import { useDashboardData } from '../composables/useDashboardData'

const {
  isTotalBoModalOpen,
  closeTotalBoModal,
  filteredBoList,
  selectBo,
  amList
} = useDashboardData()

const selectedAm = ref('all')
const searchModal = ref('')

const countTotal = computed(() => filteredBoList.value.length)

const displayedList = computed(() => {
  let list = filteredBoList.value

  if (selectedAm.value !== 'all') {
    list = list.filter(b => b.am === selectedAm.value)
  }

  if (searchModal.value.trim()) {
    const q = searchModal.value.toLowerCase().trim()
    list = list.filter(b =>
      b.kodeBo.toLowerCase().includes(q) ||
      b.namaBo.toLowerCase().includes(q) ||
      (b.am && b.am.toLowerCase().includes(q)) ||
      (b.provinsi && b.provinsi.toLowerCase().includes(q))
    )
  }

  return list
})

function handleRowClick(kodeBo) {
  closeTotalBoModal()
  selectBo(kodeBo)
}

function handleKeyDown(e) {
  if (e.key === 'Escape' && isTotalBoModalOpen.value) {
    closeTotalBoModal()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <div
    v-if="isTotalBoModalOpen"
    class="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-6"
  >
    <!-- Backdrop overlay -->
    <div
      @click="closeTotalBoModal"
      class="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity animate-fade-in"
    ></div>

    <!-- Modal Card Container -->
    <div class="relative bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full overflow-hidden z-10 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
      <!-- Modal Header -->
      <div class="relative bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 flex items-start justify-between gap-4 shrink-0">
        <div class="flex items-center space-x-3.5">
          <div class="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center shadow-lg shadow-indigo-500/10 shrink-0">
            <Building2 class="w-6 h-6" />
          </div>
          <div>
            <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-semibold text-indigo-200 mb-1 border border-white/10">
              <Sparkles class="w-3 h-3 text-indigo-300" />
              <span>Rekapitulasi Branch Office</span>
            </div>
            <h3 class="text-lg sm:text-xl font-extrabold tracking-tight text-white leading-tight">
              Daftar Seluruh Branch Office (BO)
            </h3>
            <p class="text-xs text-slate-300 mt-0.5">
              Menampilkan {{ countTotal }} kantor cabang wilayah terdata beserta cakupan operasionalnya.
            </p>
          </div>
        </div>

        <button
          @click="closeTotalBoModal"
          title="Tutup dialog (Esc)"
          class="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Toolbar: AM Filter & Search -->
      <div class="p-4 sm:p-5 border-b border-slate-200/80 bg-slate-50/70 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
        <!-- AM Dropdown Filter -->
        <div class="flex items-center gap-2">
          <Filter class="w-4 h-4 text-slate-400 shrink-0" />
          <span class="text-xs font-semibold text-slate-600">Area Manager:</span>
          <select
            v-model="selectedAm"
            class="text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-hidden cursor-pointer"
          >
            <option value="all">Semua AM ({{ countTotal }})</option>
            <option v-for="am in amList" :key="am" :value="am">{{ am }}</option>
          </select>
        </div>

        <!-- Search Input -->
        <div class="relative w-full sm:w-64">
          <Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            v-model="searchModal"
            type="text"
            placeholder="Cari kode BO, nama BO, AM..."
            class="w-full pl-9 pr-3 py-1.5 text-xs bg-white text-slate-800 placeholder-slate-400 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-hidden transition-all shadow-2xs"
          />
        </div>
      </div>

      <!-- Table Body (Scrollable) -->
      <div class="flex-1 overflow-y-auto">
        <div v-if="displayedList.length > 0">
          <table class="w-full text-left border-collapse text-xs">
            <thead class="sticky top-0 bg-slate-100/95 backdrop-blur-xs text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200 z-10 shadow-2xs">
              <tr>
                <th class="py-3 px-4 w-12 text-center">No</th>
                <th class="py-3 px-4 w-24">Kode BO</th>
                <th class="py-3 px-4">Nama Branch Office</th>
                <th class="py-3 px-4">Area Manager (AM)</th>
                <th class="py-3 px-4 text-center">Cakupan Wilayah</th>
                <th class="py-3 px-4 text-center">Wajib Markas</th>
                <th class="py-3 px-4 text-center">Penayangan</th>
                <th class="py-3 px-4 w-10 text-center"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr
                v-for="(bo, index) in displayedList"
                :key="bo.kodeBo"
                @click="handleRowClick(bo.kodeBo)"
                class="hover:bg-indigo-50/50 transition-colors group cursor-pointer"
                title="Klik untuk membuka detail BO ini"
              >
                <!-- No -->
                <td class="py-3.5 px-4 text-center font-mono text-slate-400">
                  {{ index + 1 }}
                </td>

                <!-- Kode BO -->
                <td class="py-3.5 px-4 font-mono font-bold">
                  <span class="inline-flex items-center px-2 py-0.5 rounded-lg text-xs bg-indigo-50 text-indigo-700 border border-indigo-100/80 group-hover:bg-indigo-100 transition-colors">
                    {{ bo.kodeBo }}
                  </span>
                </td>

                <!-- Nama BO & Provinsi -->
                <td class="py-3.5 px-4 font-semibold text-slate-900">
                  <div class="leading-tight">
                    <span class="text-xs font-bold block group-hover:text-indigo-600 transition-colors">
                      {{ bo.namaBo }}
                    </span>
                    <span v-if="bo.provinsi" class="text-[11px] font-normal text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin class="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{{ bo.provinsi }}</span>
                    </span>
                  </div>
                </td>

                <!-- Area Manager (AM) -->
                <td class="py-3.5 px-4 text-slate-700">
                  <div class="flex items-center gap-1.5">
                    <User class="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span class="font-medium text-xs text-slate-800">{{ bo.am || '-' }}</span>
                  </div>
                </td>

                <!-- Cakupan Wilayah (Total Kabupaten) -->
                <td class="py-3.5 px-4 text-center">
                  <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-100 font-bold text-[11px]">
                    <span>{{ bo.totalKabupaten }} Kab/Kota</span>
                  </span>
                </td>

                <!-- Wajib Markas -->
                <td class="py-3.5 px-4 text-center">
                  <span
                    :class="[
                      'inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[11px] border',
                      bo.totalWajibMarkas > 0
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-slate-50 text-slate-500 border-slate-200'
                    ]"
                  >
                    <ShieldAlert class="w-3 h-3 shrink-0" />
                    <span>{{ bo.totalWajibMarkas }} Wajib</span>
                  </span>
                </td>

                <!-- Penayangan -->
                <td class="py-3.5 px-4 text-center">
                  <span
                    :class="[
                      'inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[11px] border',
                      bo.totalTayang > 0
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-50 text-slate-500 border-slate-200'
                    ]"
                  >
                    <Tv class="w-3 h-3 shrink-0" />
                    <span>{{ bo.totalTayang }} Tayang</span>
                  </span>
                </td>

                <!-- Arrow Action Indicator -->
                <td class="py-3.5 px-4 text-center text-slate-300 group-hover:text-indigo-600 transition-colors">
                  <ChevronRight class="w-4 h-4 ml-auto" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-16 px-4">
          <div class="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Search class="w-6 h-6" />
          </div>
          <p class="text-sm font-bold text-slate-700">Tidak ada BO yang cocok</p>
          <p class="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Tidak ditemukan Branch Office yang cocok dengan filter AM atau kata kunci pencarian Anda.
          </p>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="p-4 border-t border-slate-200/80 bg-slate-50 flex items-center justify-between text-xs text-slate-500 shrink-0">
        <span>Menampilkan <strong class="text-slate-800">{{ displayedList.length }}</strong> dari <strong class="text-slate-800">{{ countTotal }}</strong> BO</span>
        <button
          @click="closeTotalBoModal"
          class="px-4 py-1.5 font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer shadow-2xs"
        >
          Tutup
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
}

.animate-fade-in {
  animation: fadeIn 0.15s ease-out forwards;
}
</style>

