<script setup>
import {
  MapPin,
  User,
  Building,
  Briefcase,
  ChevronRight,
  ShieldAlert,
  ShieldCheck
} from '@lucide/vue'
import { useDashboardData } from '../composables/useDashboardData'

defineProps({
  kabupatenList: {
    type: Array,
    required: true
  }
})

const { openKabupatenModal } = useDashboardData()
</script>

<template>
  <div class="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse text-xs">
        <thead>
          <tr class="bg-slate-50/90 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
            <th class="py-3.5 px-4">Kode & Kabupaten</th>
            <th class="py-3.5 px-4">Nama BM</th>
            <th class="py-3.5 px-4">Status Markas</th>
            <th class="py-3.5 px-4">Status Penayangan</th>
            <th class="py-3.5 px-4">Kedekatan Dinas (Jabatan)</th>
            <th class="py-3.5 px-3 text-center">IGTKI</th>
            <th class="py-3.5 px-3 text-center">K3S</th>
            <th class="py-3.5 px-3 text-center">MKKS</th>
            <th class="py-3.5 px-4 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr
            v-for="kab in kabupatenList"
            :key="kab.kabId"
            @click="openKabupatenModal(kab)"
            class="hover:bg-indigo-50/40 transition-colors cursor-pointer group"
          >
            <!-- Kabupaten -->
            <td class="py-3.5 px-4">
              <div class="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors text-sm">
                {{ kab.kabupaten }}
              </div>
              <div v-if="kab.isProvinsi" class="text-[11px] font-semibold text-purple-600 mt-0.5">
                Tingkat Provinsi
              </div>
              <div v-else class="text-[11px] font-mono text-slate-400 mt-0.5">
                ID: {{ kab.kabId }}
              </div>
            </td>

            <!-- BM -->
            <td class="py-3.5 px-4">
              <div v-if="kab.hasBm" class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0">
                  <User class="w-3.5 h-3.5" />
                </div>
                <span class="font-semibold text-slate-800">{{ kab.namaBm }}</span>
              </div>
              <span v-else class="text-slate-400 font-medium">
                -
              </span>
            </td>

            <!-- Status Markas -->
            <td class="py-3.5 px-4">
              <span
                v-if="!kab.statusMarkasMeta.isEmpty"
                :class="['inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold border text-[11px]', kab.statusMarkasMeta.badgeClass]"
              >
                <span :class="['w-1.5 h-1.5 rounded-full', kab.statusMarkasMeta.indicatorClass]"></span>
                <span>{{ kab.statusMarkasMeta.label }}</span>
              </span>
              <span v-else class="text-slate-300 font-mono text-xs">-</span>
            </td>

            <!-- Status Penayangan -->
            <td class="py-3.5 px-4">
              <div class="space-y-0.5">
                <span
                  v-if="!kab.statusPenayanganMeta.isEmpty"
                  :class="['inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold border text-[11px]', kab.statusPenayanganMeta.badgeClass]"
                  :title="kab.penayanganTerakhirDiupdate ? `Terakhir Diupdate: ${kab.penayanganTerakhirDiupdate}` : ''"
                >
                  <span :class="['w-1.5 h-1.5 rounded-full', kab.statusPenayanganMeta.indicatorClass]"></span>
                  <span>{{ kab.statusPenayanganMeta.label }}</span>
                </span>
                <span v-else class="text-slate-300 font-mono text-xs">-</span>
                <div
                  v-if="kab.penayanganTerakhirDiupdate"
                  class="text-[10px] text-slate-400 font-mono"
                  :title="`Terakhir Diupdate: ${kab.penayanganTerakhirDiupdate}`"
                >
                  {{ kab.penayanganTerakhirDiupdate }}
                </div>
              </div>
            </td>

            <!-- Kedekatan Dinas -->
            <td class="py-3.5 px-4">
              <div class="space-y-1">
                <span
                  v-if="!kab.kedekatanDinas.meta.isEmpty"
                  :class="['inline-block px-2 py-0.5 rounded-md font-bold text-[11px] border', kab.kedekatanDinas.meta.badgeClass]"
                >
                  {{ kab.kedekatanDinas.meta.label }}
                </span>
                <span v-else class="text-slate-400 font-medium text-xs block">
                  -
                </span>
                <div class="text-[11px] text-slate-500 truncate max-w-xs" :title="kab.kedekatanDinas.jabatan">
                  {{ kab.kedekatanDinas.jabatan || '-' }}
                </div>
              </div>
            </td>

            <!-- IGTKI -->
            <td class="py-3.5 px-3 text-center">
              <span
                v-if="!kab.organisasiProfesi.igtki.meta.isEmpty"
                :class="['inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold border', kab.organisasiProfesi.igtki.meta.badgeClass]"
              >
                {{ kab.organisasiProfesi.igtki.meta.label }}
              </span>
              <span v-else class="text-slate-400 font-medium text-xs">
                -
              </span>
            </td>

            <!-- K3S -->
            <td class="py-3.5 px-3 text-center">
              <span
                v-if="!kab.organisasiProfesi.k3s.meta.isEmpty"
                :class="['inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold border', kab.organisasiProfesi.k3s.meta.badgeClass]"
              >
                {{ kab.organisasiProfesi.k3s.meta.label }}
              </span>
              <span v-else class="text-slate-400 font-medium text-xs">
                -
              </span>
            </td>

            <!-- MKKS -->
            <td class="py-3.5 px-3 text-center">
              <span
                v-if="!kab.organisasiProfesi.mkks.meta.isEmpty"
                :class="['inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold border', kab.organisasiProfesi.mkks.meta.badgeClass]"
              >
                {{ kab.organisasiProfesi.mkks.meta.label }}
              </span>
              <span v-else class="text-slate-400 font-medium text-xs">
                -
              </span>
            </td>

            <!-- Action -->
            <td class="py-3.5 px-4 text-right">
              <button
                class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-indigo-600 group-hover:text-white text-slate-500 transition-colors cursor-pointer"
                title="Lihat Detail"
              >
                <ChevronRight class="w-4 h-4" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
