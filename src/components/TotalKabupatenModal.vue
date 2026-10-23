<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  MapPin,
  X,
  Search,
  Building2,
  Sparkles,
  ShieldAlert,
  Tv,
  ChevronRight
} from '@lucide/vue'
import { useDashboardData } from '../composables/useDashboardData'

const {
  isTotalKabupatenModalOpen,
  closeTotalKabupatenModal,
  allKabupatenList,
  openKabupatenModal,
  globalStats
} = useDashboardData()

const activeTab = ref('all') // 'all' | 'wajib' | 'tidak-wajib' | 'tayang'
const searchModal = ref('')

const countTotal = computed(() => allKabupatenList.value.length)
const countWajib = computed(() => allKabupatenList.value.filter(k => k.statusMarkasMeta?.isWajib).length)
const countTidakWajib = computed(() => allKabupatenList.value.filter(k => k.statusMarkasMeta?.isTidakWajib).length)
const countTayang = computed(() => allKabupatenList.value.filter(k => k.statusPenayanganMeta?.isTayang).length)

const displayedList = computed(() => {
  let list = allKabupatenList.value

  if (activeTab.value === 'wajib') {
    list = list.filter(k => k.statusMarkasMeta?.isWajib)
  } else if (activeTab.value === 'tidak-wajib') {
    list = list.filter(k => k.statusMarkasMeta?.isTidakWajib)
  } else if (activeTab.value === 'tayang') {
    list = list.filter(k => k.statusPenayanganMeta?.isTayang)
  }

  if (searchModal.value.trim()) {
    const q = searchModal.value.toLowerCase().trim()
    list = list.filter(k =>
      k.kabupaten.toLowerCase().includes(q) ||
      k.namaBo.toLowerCase().includes(q) ||
      k.kodeBo.toLowerCase().includes(q) ||
      (k.am && k.am.toLowerCase().includes(q)) ||
      (k.provinsi && k.provinsi.toLowerCase().includes(q)) ||
      (k.kabId && String(k.kabId).toLowerCase().includes(q))
    )
  }

  return list
})

function handleRowClick(item) {
  closeTotalKabupatenModal()
  openKabupatenModal(item)
}

function handleKeyDown(e) {
  if (e.key === 'Escape' && isTotalKabupatenModalOpen.value) {
    closeTotalKabupatenModal()
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
    v-if="isTotalKabupatenModalOpen"
    class="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-6"
  >
    <!-- Backdrop overlay -->
    <div
      @click="closeTotalKabupatenModal"
      class="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity animate-fade-in"
    ></div>

    <!-- Modal Card Container -->
    <div class="relative bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-5xl w-full overflow-hidden z-10 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
      <!-- Modal Header -->
      <div class="relative bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 flex items-start justify-between gap-4 shrink-0">
        <div class="flex items-center space-x-3.5">
          <div class="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-300 border border-sky-500/30 flex items-center justify-center shadow-lg shadow-sky-500/10 shrink-0">
            <MapPin class="w-6 h-6" />
          </div>
          <div>
            <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-semibold text-sky-200 mb-1 border border-white/10">
              <Sparkles class="w-3 h-3 text-sky-300" />
              <span>Rekapitulasi Wilayah Cakupan</span>
            </div>
            <h3 class="text-lg sm:text-xl font-extrabold tracking-tight text-white leading-tight">
              Daftar Seluruh Kabupaten & Kota
            </h3>
            <p class="text-xs text-slate-300 mt-0.5">
              Menampilkan {{ countTotal }} kabupaten/kota yang tersebar di {{ globalStats.totalBo }} Branch Office.
            </p>
          </div>
        </div>

        <button
          @click="closeTotalKabupatenModal"
          title="Tutup dialog (Esc)"
          class="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Toolbar: Tabs & Search -->
      <div class="p-4 sm:p-5 border-b border-slate-200/80 bg-slate-50/70 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
        <!-- Quick Filter Tabs -->
        <div class="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-xl text-xs font-semibold overflow-x-auto">
          <button
            type="button"
            @click="activeTab = 'all'"
            :class="[
              'px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap',
              activeTab === 'all'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            ]"
          >
            Semua ({{ countTotal }})
          </button>

          <button
            type="button"
            @click="activeTab = 'wajib'"
            :class="[
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap',
              activeTab === 'wajib'
                ? 'bg-rose-600 text-white shadow-2xs font-bold'
                : 'text-rose-700 hover:bg-rose-50'
            ]"
          >
            <span class="w-1.5 h-1.5 rounded-full" :class="activeTab === 'wajib' ? 'bg-white' : 'bg-rose-500'"></span>
            <span>Wajib Markas ({{ countWajib }})</span>
          </button>

          <button
            type="button"
            @click="activeTab = 'tidak-wajib'"
            :class="[
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap',
              activeTab === 'tidak-wajib'
                ? 'bg-slate-700 text-white shadow-2xs font-bold'
                : 'text-slate-700 hover:bg-slate-200/70'
            ]"
          >
            <span class="w-1.5 h-1.5 rounded-full" :class="activeTab === 'tidak-wajib' ? 'bg-white' : 'bg-slate-400'"></span>
            <span>Tidak Wajib ({{ countTidakWajib }})</span>
          </button>

          <button
            type="button"
            @click="activeTab = 'tayang'"
            :class="[
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap',
              activeTab === 'tayang'
                ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                : 'text-emerald-700 hover:bg-emerald-50'
            ]"
          >
            <span class="w-1.5 h-1.5 rounded-full" :class="activeTab === 'tayang' ? 'bg-white' : 'bg-emerald-500'"></span>
            <span>Sudah Tayang ({{ countTayang }})</span>
          </button>
        </div>

        <!-- Search Input -->
        <div class="relative w-full sm:w-64">
          <Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            v-model="searchModal"
            type="text"
            placeholder="Cari kabupaten, BO, AM..."
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
                <th class="py-3 px-4">Kabupaten / Kota</th>
                <th class="py-3 px-4">Provinsi</th>
                <th class="py-3 px-4">Branch Office (BO)</th>
                <th class="py-3 px-4 text-center">Status Markas</th>
                <th class="py-3 px-4 text-center">Status Penayangan</th>
                <th class="py-3 px-4 w-10 text-center"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr
                v-for="(item, index) in displayedList"
                :key="item.kabId + '_' + item.kodeBo"
                @click="handleRowClick(item)"
                class="hover:bg-sky-50/50 transition-colors group cursor-pointer"
                title="Klik untuk membuka detail kabupaten ini"
              >
                <!-- No -->
                <td class="py-3 px-4 text-center font-mono text-slate-400">
                  {{ index + 1 }}
                </td>

                <!-- Kabupaten / Kota -->
                <td class="py-3 px-4 font-semibold text-slate-900">
                  <div class="leading-tight">
                    <span class="text-xs font-bold block group-hover:text-indigo-600 transition-colors">
                      {{ item.kabupaten }}
                    </span>
                    <span v-if="item.isProvinsi" class="text-[10px] font-semibold text-purple-600 mt-0.5 block">
                      Tingkat Provinsi
                    </span>
                    <span v-else-if="item.kabId" class="text-[10px] font-mono text-slate-400 mt-0.5 block">
                      ID: {{ item.kabId }}
                    </span>
                  </div>
                </td>

                <!-- Provinsi -->
                <td class="py-3 px-4 text-slate-600">
                  <span class="inline-flex items-center gap-1 text-[11px]">
                    <MapPin class="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{{ item.provinsi || '-' }}</span>
                  </span>
                </td>

                <!-- BO & AM -->
                <td class="py-3 px-4 text-slate-700">
                  <div class="leading-tight">
                    <span class="font-bold text-slate-800 block text-[11px]">{{ item.namaBo }}</span>
                    <span class="text-[10px] text-slate-400 block font-mono">{{ item.kodeBo }} &bull; {{ item.am }}</span>
                  </div>
                </td>

                <!-- Status Markas Badge -->
                <td class="py-3 px-4 text-center">
                  <span
                    v-if="item.statusMarkasMeta && !item.statusMarkasMeta.isEmpty"
                    :class="[
                      'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold border text-[11px] shadow-2xs',
                      item.statusMarkasMeta.badgeClass
                    ]"
                  >
                    <span :class="['w-1.5 h-1.5 rounded-full', item.statusMarkasMeta.indicatorClass]"></span>
                    <span>{{ item.statusMarkasMeta.label }}</span>
                  </span>
                  <span v-else class="text-slate-300 font-mono text-xs">-</span>
                </td>

                <!-- Status Penayangan Badge -->
                <td class="py-3 px-4 text-center">
                  <span
                    v-if="item.statusPenayanganMeta && !item.statusPenayanganMeta.isEmpty"
                    :class="[
                      'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold border text-[11px] shadow-2xs',
                      item.statusPenayanganMeta.badgeClass
                    ]"
                  >
                    <span :class="['w-1.5 h-1.5 rounded-full', item.statusPenayanganMeta.indicatorClass]"></span>
                    <span>{{ item.statusPenayanganMeta.label }}</span>
                  </span>
                  <span v-else class="text-slate-300 font-mono text-xs">-</span>
                </td>

                <!-- Chevron Arrow -->
                <td class="py-3 px-4 text-center text-slate-300 group-hover:text-indigo-600 transition-colors">
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
          <p class="text-sm font-bold text-slate-700">Tidak ada wilayah yang cocok</p>
          <p class="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Tidak ditemukan kabupaten yang cocok dengan filter atau kata kunci pencarian Anda.
          </p>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="p-4 border-t border-slate-200/80 bg-slate-50 flex items-center justify-between text-xs text-slate-500 shrink-0">
        <span>Menampilkan <strong class="text-slate-800">{{ displayedList.length }}</strong> dari <strong class="text-slate-800">{{ countTotal }}</strong> wilayah cakupan</span>
        <button
          @click="closeTotalKabupatenModal"
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
