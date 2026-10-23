<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  Sparkles,
  X,
  Search,
  Building2,
  MapPin,
  Briefcase,
  Award,
  ChevronRight
} from '@lucide/vue'
import { useDashboardData } from '../composables/useDashboardData'
import { getKedekatanMeta } from '../utils/dataHelpers'

const {
  isKekuatanBirokrasiModalOpen,
  closeKekuatanBirokrasiModal,
  kabupatenBirokrasiList,
  openKabupatenModal,
  globalStats
} = useDashboardData()

const activeTab = ref('all') // 'all' | 'mitra' | 'akrab' | 'komunikatif' | 'evaluasi'
const searchModal = ref('')

function getScoreMeta(score) {
  if (!score || score <= 0) return getKedekatanMeta('')
  const rounded = Math.min(5, Math.max(1, Math.round(score)))
  return getKedekatanMeta(String(rounded))
}

const countTotal = computed(() => kabupatenBirokrasiList.value.length)
const countMitra = computed(() => kabupatenBirokrasiList.value.filter(k => Math.round(k.avgScore) === 5).length)
const countAkrab = computed(() => kabupatenBirokrasiList.value.filter(k => Math.round(k.avgScore) === 4).length)
const countKomunikatif = computed(() => kabupatenBirokrasiList.value.filter(k => Math.round(k.avgScore) === 3).length)
const countEvaluasi = computed(() => kabupatenBirokrasiList.value.filter(k => Math.round(k.avgScore) <= 2 && k.avgScore > 0).length)

const displayedList = computed(() => {
  let list = kabupatenBirokrasiList.value

  if (activeTab.value === 'mitra') {
    list = list.filter(k => Math.round(k.avgScore) === 5)
  } else if (activeTab.value === 'akrab') {
    list = list.filter(k => Math.round(k.avgScore) === 4)
  } else if (activeTab.value === 'komunikatif') {
    list = list.filter(k => Math.round(k.avgScore) === 3)
  } else if (activeTab.value === 'evaluasi') {
    list = list.filter(k => Math.round(k.avgScore) <= 2 && k.avgScore > 0)
  }

  if (searchModal.value.trim()) {
    const q = searchModal.value.toLowerCase().trim()
    list = list.filter(k =>
      k.kabupaten.toLowerCase().includes(q) ||
      k.namaBo.toLowerCase().includes(q) ||
      k.kodeBo.toLowerCase().includes(q) ||
      (k.am && k.am.toLowerCase().includes(q)) ||
      (k.provinsi && k.provinsi.toLowerCase().includes(q)) ||
      (k.kedekatanDinas?.jabatan && k.kedekatanDinas.jabatan.toLowerCase().includes(q)) ||
      (k.kedekatanDinas?.status && k.kedekatanDinas.status.toLowerCase().includes(q))
    )
  }

  return list
})

function handleRowClick(item) {
  closeKekuatanBirokrasiModal()
  openKabupatenModal(item)
}

function handleKeyDown(e) {
  if (e.key === 'Escape' && isKekuatanBirokrasiModalOpen.value) {
    closeKekuatanBirokrasiModal()
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
    v-if="isKekuatanBirokrasiModalOpen"
    class="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-6"
  >
    <!-- Backdrop overlay -->
    <div
      @click="closeKekuatanBirokrasiModal"
      class="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity animate-fade-in"
    ></div>

    <!-- Modal Card Container -->
    <div class="relative bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-5xl w-full overflow-hidden z-10 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
      <!-- Modal Header -->
      <div class="relative bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 flex items-start justify-between gap-4 shrink-0">
        <div class="flex items-center space-x-3.5">
          <div class="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center shadow-lg shadow-purple-500/10 shrink-0">
            <Sparkles class="w-6 h-6" />
          </div>
          <div>
            <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-semibold text-purple-200 mb-1 border border-white/10">
              <Sparkles class="w-3 h-3 text-purple-300" />
              <span>Rekapitulasi Kekuatan Birokrasi</span>
            </div>
            <h3 class="text-lg sm:text-xl font-extrabold tracking-tight text-white leading-tight">
              Daftar Kekuatan Birokrasi Wilayah
            </h3>
            <p class="text-xs text-slate-300 mt-0.5">
              Rata-rata Nasional: <strong class="text-purple-300">{{ globalStats.avgBirokrasiScore }} / 5</strong> ({{ globalStats.avgBirokrasiMeta.label }}) &bull; Menampilkan {{ countTotal }} wilayah terdata.
            </p>
          </div>
        </div>

        <button
          @click="closeKekuatanBirokrasiModal"
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
            @click="activeTab = 'mitra'"
            :class="[
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap',
              activeTab === 'mitra'
                ? 'bg-purple-600 text-white shadow-2xs font-bold'
                : 'text-purple-700 hover:bg-purple-50'
            ]"
          >
            <span class="w-1.5 h-1.5 rounded-full" :class="activeTab === 'mitra' ? 'bg-white' : 'bg-purple-500'"></span>
            <span>Mitra Strategis ({{ countMitra }})</span>
          </button>

          <button
            type="button"
            @click="activeTab = 'akrab'"
            :class="[
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap',
              activeTab === 'akrab'
                ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                : 'text-emerald-700 hover:bg-emerald-50'
            ]"
          >
            <span class="w-1.5 h-1.5 rounded-full" :class="activeTab === 'akrab' ? 'bg-white' : 'bg-emerald-500'"></span>
            <span>Relasi Baik ({{ countAkrab }})</span>
          </button>

          <button
            type="button"
            @click="activeTab = 'komunikatif'"
            :class="[
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap',
              activeTab === 'komunikatif'
                ? 'bg-amber-500 text-white shadow-2xs font-bold'
                : 'text-amber-800 hover:bg-amber-50'
            ]"
          >
            <span class="w-1.5 h-1.5 rounded-full" :class="activeTab === 'komunikatif' ? 'bg-white' : 'bg-amber-500'"></span>
            <span>Komunikatif ({{ countKomunikatif }})</span>
          </button>

          <button
            type="button"
            @click="activeTab = 'evaluasi'"
            :class="[
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap',
              activeTab === 'evaluasi'
                ? 'bg-rose-600 text-white shadow-2xs font-bold'
                : 'text-rose-700 hover:bg-rose-50'
            ]"
          >
            <span class="w-1.5 h-1.5 rounded-full" :class="activeTab === 'evaluasi' ? 'bg-white' : 'bg-rose-500'"></span>
            <span>Perlu Ditingkatkan ({{ countEvaluasi }})</span>
          </button>
        </div>

        <!-- Search Input -->
        <div class="relative w-full sm:w-64">
          <Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            v-model="searchModal"
            type="text"
            placeholder="Cari wilayah, BO, jabatan dinas..."
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
                <th class="py-3 px-4">Branch Office (BO)</th>
                <th class="py-3 px-4">Skor & Predikat</th>
                <th class="py-3 px-4">Kedinasan (Dinas)</th>
                <th class="py-3 px-4">Kemitraan Organisasi</th>
                <th class="py-3 px-4 w-10 text-center"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr
                v-for="(item, index) in displayedList"
                :key="item.kabId + '_' + item.kodeBo"
                @click="handleRowClick(item)"
                class="hover:bg-purple-50/40 transition-colors group cursor-pointer"
                title="Klik untuk membuka detail kabupaten ini"
              >
                <!-- No -->
                <td class="py-3 px-4 text-center font-mono text-slate-400">
                  {{ index + 1 }}
                </td>

                <!-- Kabupaten / Kota & Provinsi -->
                <td class="py-3 px-4 font-semibold text-slate-900">
                  <div class="leading-tight">
                    <span class="text-xs font-bold block group-hover:text-purple-700 transition-colors">
                      {{ item.kabupaten }}
                    </span>
                    <span class="text-[11px] font-normal text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin class="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{{ item.provinsi || '-' }}</span>
                    </span>
                  </div>
                </td>

                <!-- BO & AM -->
                <td class="py-3 px-4 text-slate-700">
                  <div class="leading-tight">
                    <span class="font-bold text-slate-800 block text-[11px]">{{ item.namaBo }}</span>
                    <span class="text-[10px] text-slate-400 block font-mono">{{ item.kodeBo }} &bull; {{ item.am }}</span>
                  </div>
                </td>

                <!-- Skor & Predikat -->
                <td class="py-3 px-4">
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-extrabold font-mono text-purple-700 shrink-0">
                      {{ item.avgScore.toFixed(1) }}
                    </span>
                    <span :class="['px-2 py-0.5 rounded-full text-[10px] font-bold border shadow-2xs whitespace-nowrap', getScoreMeta(item.avgScore).badgeClass]">
                      {{ getScoreMeta(item.avgScore).label }}
                    </span>
                  </div>
                </td>

                <!-- Kedinasan (Dinas & Jabatan) -->
                <td class="py-3 px-4">
                  <div class="leading-tight">
                    <span
                      v-if="!item.kedekatanDinas.meta.isEmpty"
                      :class="['inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border shadow-2xs', item.kedekatanDinas.meta.badgeClass]"
                    >
                      <span :class="['w-1.5 h-1.5 rounded-full', item.kedekatanDinas.meta.indicatorClass]"></span>
                      <span>{{ item.kedekatanDinas.meta.label }}</span>
                    </span>
                    <span v-else class="text-slate-300 text-xs font-mono">-</span>

                    <div v-if="item.kedekatanDinas.jabatan && item.kedekatanDinas.jabatan !== '-'" class="text-[10px] text-slate-500 mt-1 flex items-center gap-1 font-medium">
                      <Briefcase class="w-3 h-3 text-slate-400 shrink-0" />
                      <span class="truncate max-w-[160px]" :title="item.kedekatanDinas.jabatan">{{ item.kedekatanDinas.jabatan }}</span>
                    </div>
                  </div>
                </td>

                <!-- Kemitraan Organisasi (IGTKI, K3S, MKKS) -->
                <td class="py-3 px-4">
                  <div class="flex items-center gap-1 flex-wrap">
                    <!-- IGTKI -->
                    <span
                      v-if="!item.organisasiProfesi.igtki.meta.isEmpty"
                      :class="['inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold border', item.organisasiProfesi.igtki.meta.badgeClass]"
                      :title="`IGTKI: ${item.organisasiProfesi.igtki.meta.label}`"
                    >
                      <span class="font-bold opacity-75">IGTKI:</span>
                      <span>{{ item.organisasiProfesi.igtki.meta.label }}</span>
                    </span>
                    <span v-else class="text-[10px] text-slate-300 font-mono">IGTKI: -</span>

                    <!-- K3S -->
                    <span
                      v-if="!item.organisasiProfesi.k3s.meta.isEmpty"
                      :class="['inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold border', item.organisasiProfesi.k3s.meta.badgeClass]"
                      :title="`K3S: ${item.organisasiProfesi.k3s.meta.label}`"
                    >
                      <span class="font-bold opacity-75">K3S:</span>
                      <span>{{ item.organisasiProfesi.k3s.meta.label }}</span>
                    </span>
                    <span v-else class="text-[10px] text-slate-300 font-mono">K3S: -</span>

                    <!-- MKKS -->
                    <span
                      v-if="!item.organisasiProfesi.mkks.meta.isEmpty"
                      :class="['inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold border', item.organisasiProfesi.mkks.meta.badgeClass]"
                      :title="`MKKS: ${item.organisasiProfesi.mkks.meta.label}`"
                    >
                      <span class="font-bold opacity-75">MKKS:</span>
                      <span>{{ item.organisasiProfesi.mkks.meta.label }}</span>
                    </span>
                    <span v-else class="text-[10px] text-slate-300 font-mono">MKKS: -</span>
                  </div>
                </td>

                <!-- Chevron Arrow -->
                <td class="py-3 px-4 text-center text-slate-300 group-hover:text-purple-600 transition-colors">
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
        <span>Menampilkan <strong class="text-slate-800">{{ displayedList.length }}</strong> dari <strong class="text-slate-800">{{ countTotal }}</strong> wilayah terdata</span>
        <button
          @click="closeKekuatanBirokrasiModal"
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

