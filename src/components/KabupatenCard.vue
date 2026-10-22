<script setup>
import {
  MapPin,
  User,
  ShieldAlert,
  ShieldCheck,
  Briefcase,
  Award,
  ChevronRight,
  School,
  Building
} from '@lucide/vue'
import { useDashboardData } from '../composables/useDashboardData'

const props = defineProps({
  kabupaten: {
    type: Object,
    required: true
  }
})

const { openKabupatenModal } = useDashboardData()
</script>

<template>
  <div
    @click="openKabupatenModal(kabupaten)"
    class="bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-300 p-5 shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between group cursor-pointer relative"
  >
    <div>
      <!-- Top Row: Kab ID & Status Badges -->
      <div class="flex items-center justify-between gap-2 mb-3">
        <span
          v-if="kabupaten.isProvinsi"
          class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200"
        >
          <Building class="w-3 h-3 text-purple-500" />
          <span>Tingkat Provinsi</span>
        </span>
        <span
          v-else
          class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200/80"
        >
          <MapPin class="w-3 h-3 text-slate-400" />
          <span>{{ kabupaten.kabId }}</span>
        </span>

        <!-- Badges Container: Status Markas & Status Penayangan -->
        <div class="flex items-center gap-1.5 flex-wrap justify-end">
          <!-- Status Markas Badge -->
          <span
            v-if="!kabupaten.statusMarkasMeta.isEmpty"
            :class="['inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border shadow-2xs', kabupaten.statusMarkasMeta.badgeClass]"
          >
            <span :class="['w-1.5 h-1.5 rounded-full', kabupaten.statusMarkasMeta.indicatorClass]"></span>
            <span>Markas: {{ kabupaten.statusMarkasMeta.label }}</span>
          </span>
          <span
            v-else
            class="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-mono text-slate-400 bg-slate-50 border border-slate-200/60"
          >
            Markas: -
          </span>

          <!-- Status Penayangan Badge -->
          <span
            v-if="!kabupaten.statusPenayanganMeta.isEmpty"
            :class="['inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border shadow-2xs', kabupaten.statusPenayanganMeta.badgeClass]"
            :title="kabupaten.penayanganTerakhirDiupdate ? `Terakhir Diupdate: ${kabupaten.penayanganTerakhirDiupdate}` : ''"
          >
            <span :class="['w-1.5 h-1.5 rounded-full', kabupaten.statusPenayanganMeta.indicatorClass]"></span>
            <span>{{ kabupaten.statusPenayanganMeta.label }}</span>
          </span>
        </div>
      </div>

      <!-- Kabupaten Name -->
      <h4 class="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight mb-4">
        {{ kabupaten.kabupaten }}
      </h4>

      <!-- Kedekatan Dinas Section -->
      <div class="space-y-1.5 p-3 rounded-xl border border-slate-100 bg-white mb-4">
        <div class="flex items-center justify-between text-xs mb-1">
          <span class="text-slate-500 font-semibold flex items-center gap-1">
            <Building class="w-3.5 h-3.5 text-slate-400" />
            <span>Kedekatan Dinas:</span>
          </span>
          <span
            v-if="!kabupaten.kedekatanDinas.meta.isEmpty"
            :class="['px-2 py-0.5 rounded-md text-[11px] font-bold border', kabupaten.kedekatanDinas.meta.badgeClass]"
          >
            {{ kabupaten.kedekatanDinas.meta.label }}
          </span>
          <span v-else class="text-xs font-semibold text-slate-400 px-1">
            -
          </span>
        </div>
        <div class="flex items-center gap-1.5 text-xs text-slate-600">
          <Briefcase class="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span class="truncate font-medium text-[11px]" :title="kabupaten.kedekatanDinas.jabatan">
            {{ kabupaten.kedekatanDinas.jabatan || '-' }}
          </span>
        </div>
      </div>

      <!-- Kedekatan Organisasi Profesi (IGTKI, K3S, MKKS) -->
      <div>
        <span class="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-2">
          Kedekatan Organisasi Profesi:
        </span>
        <div class="grid grid-cols-3 gap-1.5 text-center">
          <!-- IGTKI -->
          <div
            class="p-2 rounded-lg border bg-slate-50/50"
            :class="kabupaten.organisasiProfesi.igtki.meta.isEmpty ? 'border-slate-100 text-slate-400' : (kabupaten.organisasiProfesi.igtki.meta.borderClass || 'border-slate-200/80')"
          >
            <span class="text-[10px] font-bold text-slate-600 block">IGTKI</span>
            <span :class="['inline-block w-full text-[10px] font-semibold mt-0.5 truncate', kabupaten.organisasiProfesi.igtki.meta.textClass]">
              {{ kabupaten.organisasiProfesi.igtki.meta.label }}
            </span>
          </div>

          <!-- K3S -->
          <div
            class="p-2 rounded-lg border bg-slate-50/50"
            :class="kabupaten.organisasiProfesi.k3s.meta.isEmpty ? 'border-slate-100 text-slate-400' : (kabupaten.organisasiProfesi.k3s.meta.borderClass || 'border-slate-200/80')"
          >
            <span class="text-[10px] font-bold text-slate-600 block">K3S</span>
            <span :class="['inline-block w-full text-[10px] font-semibold mt-0.5 truncate', kabupaten.organisasiProfesi.k3s.meta.textClass]">
              {{ kabupaten.organisasiProfesi.k3s.meta.label }}
            </span>
          </div>

          <!-- MKKS -->
          <div
            class="p-2 rounded-lg border bg-slate-50/50"
            :class="kabupaten.organisasiProfesi.mkks.meta.isEmpty ? 'border-slate-100 text-slate-400' : (kabupaten.organisasiProfesi.mkks.meta.borderClass || 'border-slate-200/80')"
          >
            <span class="text-[10px] font-bold text-slate-600 block">MKKS</span>
            <span :class="['inline-block w-full text-[10px] font-semibold mt-0.5 truncate', kabupaten.organisasiProfesi.mkks.meta.textClass]">
              {{ kabupaten.organisasiProfesi.mkks.meta.label }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Action -->
    <div class="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
      <span v-if="kabupaten.namaBm" class="text-[11px] text-slate-400 font-medium truncate max-w-[170px]" :title="`Branch Manager: ${kabupaten.namaBm}`">
        BM: <strong class="text-slate-600 font-semibold">{{ kabupaten.namaBm }}</strong>
      </span>
      <span v-else class="text-[11px] text-slate-400"></span>

      <span class="inline-flex items-center gap-1 text-indigo-600 font-semibold group-hover:text-indigo-700 shrink-0">
        <span>Detail</span>
        <ChevronRight class="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </div>
  </div>
</template>
