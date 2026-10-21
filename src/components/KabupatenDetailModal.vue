<script setup>
import { onMounted, onUnmounted } from 'vue'
import {
  X,
  MapPin,
  Building2,
  User,
  Building,
  Briefcase,
  Award,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2
} from '@lucide/vue'
import { useDashboardData } from '../composables/useDashboardData'

const {
  activeKabupaten,
  selectedBo,
  closeKabupatenModal
} = useDashboardData()

function handleKeyDown(e) {
  if (e.key === 'Escape') closeKabupatenModal()
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
    v-if="activeKabupaten"
    class="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6"
  >
    <!-- Backdrop overlay -->
    <div
      @click="closeKabupatenModal"
      class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
    ></div>

    <!-- Modal Content -->
    <div class="relative bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
      <!-- Modal Header -->
      <div class="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white relative">
        <button
          @click="closeKabupatenModal"
          class="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <X class="w-4 h-4" />
        </button>

        <div class="flex items-center gap-2 mb-2">
          <span v-if="activeKabupaten.isProvinsi" class="px-2.5 py-0.5 rounded-md text-xs font-bold bg-purple-500/30 text-purple-200 border border-purple-400/30">
            Tingkat Provinsi
          </span>
          <span v-else class="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-white/15 text-white">
            KAB ID: {{ activeKabupaten.kabId }}
          </span>
          <span v-if="selectedBo" class="text-xs text-indigo-200 font-semibold">
            {{ selectedBo.namaBo }} ({{ selectedBo.kodeBo }})
          </span>
        </div>

        <h3 class="text-2xl font-extrabold tracking-tight text-white mb-1">
          {{ activeKabupaten.kabupaten }}
        </h3>
        <p class="text-xs text-slate-300 flex flex-wrap items-center gap-2">
          <span>Area Manager: <strong class="text-white">{{ selectedBo?.am || '-' }}</strong></span>
          <span class="text-slate-500">•</span>
          <span>Branch Manager: <strong class="text-white">{{ selectedBo?.namaBm || activeKabupaten.namaBm || '-' }}</strong></span>
        </p>
      </div>

      <!-- Modal Body -->
      <div class="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
        <!-- 1. Status Markas & Kepemimpinan Cabang -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Status Markas Card -->
          <div class="p-4 rounded-2xl border bg-slate-50/70 border-slate-200">
            <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Status Markas
            </span>
            <div class="flex items-center gap-2 mb-2">
              <span
                :class="['inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-2xs', activeKabupaten.statusMarkasMeta.badgeClass]"
              >
                <span :class="['w-2 h-2 rounded-full', activeKabupaten.statusMarkasMeta.indicatorClass]"></span>
                <span>{{ activeKabupaten.statusMarkasMeta.label }}</span>
              </span>
            </div>
            <p class="text-xs text-slate-600 leading-relaxed">
              {{ activeKabupaten.statusMarkasMeta.subtext }}
            </p>
          </div>

          <!-- Kepemimpinan Cabang Card -->
          <div class="p-4 rounded-2xl border bg-slate-50/70 border-slate-200">
            <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Branch Manager (Kepala BO)
            </span>
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
                <User class="w-5 h-5" />
              </div>
              <div class="min-w-0">
                <span class="text-sm font-bold text-slate-900 block truncate">
                  {{ selectedBo?.namaBm || activeKabupaten.namaBm || '-' }}
                </span>
                <span class="text-[11px] text-slate-500 block">
                  Kepala Cabang {{ selectedBo?.namaBo || '' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. Kedekatan Dinas Pendidikan -->
        <div class="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <Building class="w-5 h-5 text-indigo-600" />
              <h4 class="text-sm font-bold text-slate-800">Kedekatan Birokrasi Dinas</h4>
            </div>
            <span
              v-if="!activeKabupaten.kedekatanDinas.meta.isEmpty"
              :class="['px-3 py-1 rounded-full text-xs font-bold border', activeKabupaten.kedekatanDinas.meta.badgeClass]"
            >
              {{ activeKabupaten.kedekatanDinas.meta.label }} (Level {{ activeKabupaten.kedekatanDinas.meta.score }}/5)
            </span>
            <span
              v-else
              class="px-2.5 py-0.5 rounded-md text-xs font-semibold text-slate-400 bg-slate-100"
            >
              -
            </span>
          </div>

          <!-- Level Progress Indicator (hanya tampil jika ada data) -->
          <div v-if="!activeKabupaten.kedekatanDinas.meta.isEmpty" class="space-y-1.5 mb-4">
            <div class="flex items-center justify-between text-[11px] font-medium text-slate-500">
              <span>Tingkat Kemitraan:</span>
              <span class="font-bold text-slate-700">{{ activeKabupaten.kedekatanDinas.meta.label }}</span>
            </div>
            <div class="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex gap-1 p-0.5">
              <div
                v-for="lvl in 5"
                :key="lvl"
                class="flex-1 h-full rounded-full transition-all"
                :class="lvl <= activeKabupaten.kedekatanDinas.meta.score ? activeKabupaten.kedekatanDinas.meta.barColor : 'bg-slate-200'"
              ></div>
            </div>
          </div>

          <!-- Pejabat yang Didekati -->
          <div class="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2.5">
            <Briefcase class="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <span class="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                Jabatan Pejabat yang Didekati:
              </span>
              <span class="text-xs font-bold text-slate-800">
                {{ activeKabupaten.kedekatanDinas.jabatan || '-' }}
              </span>
            </div>
          </div>
        </div>

        <!-- 3. Kedekatan Organisasi Profesi (IGTKI, K3S, MKKS) -->
        <div>
          <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
            <Award class="w-4 h-4 text-indigo-600" />
            <span>Kedekatan Organisasi Profesi</span>
          </h4>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <!-- IGTKI -->
            <div class="p-4 rounded-2xl border bg-slate-50/60 border-slate-200 flex flex-col justify-between">
              <div>
                <span class="text-xs font-extrabold text-slate-800 block mb-2">IGTKI</span>
                <span
                  v-if="!activeKabupaten.organisasiProfesi.igtki.meta.isEmpty"
                  :class="['inline-block w-full text-center px-2 py-1 rounded-lg text-xs font-bold border', activeKabupaten.organisasiProfesi.igtki.meta.badgeClass]"
                >
                  {{ activeKabupaten.organisasiProfesi.igtki.meta.label }}
                </span>
                <span
                  v-else
                  class="inline-block w-full text-center px-2 py-1 rounded-lg text-xs font-medium text-slate-400 bg-slate-100/80 border border-slate-200/50"
                >
                  -
                </span>
              </div>
              <div v-if="!activeKabupaten.organisasiProfesi.igtki.meta.isEmpty" class="mt-3 w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all"
                  :class="activeKabupaten.organisasiProfesi.igtki.meta.barColor"
                  :style="{ width: `${(activeKabupaten.organisasiProfesi.igtki.meta.score / 5) * 100}%` }"
                ></div>
              </div>
            </div>

            <!-- K3S -->
            <div class="p-4 rounded-2xl border bg-slate-50/60 border-slate-200 flex flex-col justify-between">
              <div>
                <span class="text-xs font-extrabold text-slate-800 block mb-2">K3S</span>
                <span
                  v-if="!activeKabupaten.organisasiProfesi.k3s.meta.isEmpty"
                  :class="['inline-block w-full text-center px-2 py-1 rounded-lg text-xs font-bold border', activeKabupaten.organisasiProfesi.k3s.meta.badgeClass]"
                >
                  {{ activeKabupaten.organisasiProfesi.k3s.meta.label }}
                </span>
                <span
                  v-else
                  class="inline-block w-full text-center px-2 py-1 rounded-lg text-xs font-medium text-slate-400 bg-slate-100/80 border border-slate-200/50"
                >
                  -
                </span>
              </div>
              <div v-if="!activeKabupaten.organisasiProfesi.k3s.meta.isEmpty" class="mt-3 w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all"
                  :class="activeKabupaten.organisasiProfesi.k3s.meta.barColor"
                  :style="{ width: `${(activeKabupaten.organisasiProfesi.k3s.meta.score / 5) * 100}%` }"
                ></div>
              </div>
            </div>

            <!-- MKKS -->
            <div class="p-4 rounded-2xl border bg-slate-50/60 border-slate-200 flex flex-col justify-between">
              <div>
                <span class="text-xs font-extrabold text-slate-800 block mb-2">MKKS</span>
                <span
                  v-if="!activeKabupaten.organisasiProfesi.mkks.meta.isEmpty"
                  :class="['inline-block w-full text-center px-2 py-1 rounded-lg text-xs font-bold border', activeKabupaten.organisasiProfesi.mkks.meta.badgeClass]"
                >
                  {{ activeKabupaten.organisasiProfesi.mkks.meta.label }}
                </span>
                <span
                  v-else
                  class="inline-block w-full text-center px-2 py-1 rounded-lg text-xs font-medium text-slate-400 bg-slate-100/80 border border-slate-200/50"
                >
                  -
                </span>
              </div>
              <div v-if="!activeKabupaten.organisasiProfesi.mkks.meta.isEmpty" class="mt-3 w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all"
                  :class="activeKabupaten.organisasiProfesi.mkks.meta.barColor"
                  :style="{ width: `${(activeKabupaten.organisasiProfesi.mkks.meta.score / 5) * 100}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
        <button
          @click="closeKabupatenModal"
          class="px-5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors cursor-pointer"
        >
          Tutup
        </button>
      </div>
    </div>
  </div>
</template>

