<script setup>
import {
  ArrowLeft,
  Building2,
  MapPin,
  Users,
  ShieldAlert,
  ShieldCheck,
  Award,
  Search,
  Filter,
  LayoutGrid,
  Table as TableIcon
} from '@lucide/vue'
import { useDashboardData } from '../composables/useDashboardData'
import KabupatenCard from './KabupatenCard.vue'
import KabupatenTable from './KabupatenTable.vue'

const {
  selectedBo,
  clearSelectedBo,
  filteredKabupatenList,
  searchQuery,
  statusMarkasFilter,
  kedekatanFilter,
  viewMode
} = useDashboardData()
</script>

<template>
  <div v-if="selectedBo" class="space-y-6">
    <!-- Breadcrumb & Back Navigation -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <button
        @click="clearSelectedBo"
        class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all cursor-pointer group"
      >
        <ArrowLeft class="w-4 h-4 text-indigo-600 group-hover:-translate-x-0.5 transition-transform" />
        <span>Kembali ke Daftar BO</span>
      </button>

      <!-- Breadcrumbs Path -->
      <nav class="flex items-center space-x-2 text-xs font-medium text-slate-500">
        <span @click="clearSelectedBo" class="hover:text-indigo-600 cursor-pointer">Daftar BO</span>
        <span>/</span>
        <span class="text-slate-800 font-bold truncate max-w-xs">{{ selectedBo.namaBo }}</span>
      </nav>
    </div>

    <!-- BO Detail Hero Banner -->
    <div class="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
      <div class="absolute -right-8 -top-8 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div class="relative z-10">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div class="flex flex-wrap items-center gap-2.5 mb-2">
              <span class="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-white/15 text-white tracking-wider border border-white/10">
                {{ selectedBo.kodeBo }}
              </span>
              <span class="text-xs font-semibold text-indigo-200">
                AM: <strong class="text-white">{{ selectedBo.am }}</strong>
              </span>
              <span v-if="selectedBo.namaBm && selectedBo.namaBm !== '-'" class="text-xs font-semibold text-indigo-200 border-l border-white/20 pl-2.5">
                Branch Manager: <strong class="text-white">{{ selectedBo.namaBm }}</strong>
              </span>
            </div>
            <h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
              {{ selectedBo.namaBo }}
            </h2>
            <p class="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Memantau {{ selectedBo.totalKabupaten }} wilayah operasional. Tinjau kewajiban status markas, hubungan kedinasan, dan kemitraan organisasi guru (IGTKI, K3S, MKKS) di bawah naungan BO ini.
            </p>
          </div>

          <!-- Quick Metrics in Hero -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 shrink-0">
            <div class="text-center px-2">
              <span class="text-[11px] text-slate-300 block">Total Wilayah</span>
              <span class="text-xl font-extrabold text-white">{{ selectedBo.totalKabupaten }}</span>
            </div>
            <div class="text-center px-2 border-l border-white/10">
              <span class="text-[11px] text-rose-300 font-semibold block">Wajib Markas</span>
              <span class="text-xl font-extrabold text-rose-300">{{ selectedBo.totalWajibMarkas }}</span>
            </div>
            <div class="text-center px-2 border-l border-white/10">
              <span class="text-[11px] text-slate-300 font-semibold block">Tidak Wajib</span>
              <span class="text-xl font-extrabold text-white">{{ selectedBo.totalTidakWajibMarkas }}</span>
            </div>
            <div class="text-center px-2 border-l border-white/10">
              <span class="text-[11px] text-indigo-300 block">Kekuatan Birokrasi</span>
              <span class="text-base font-extrabold text-white block mt-0.5">{{ selectedBo.avgBirokrasiScore }} / 5</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filter & View Toolbar -->
    <div class="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-4 md:space-y-0 md:flex md:items-center md:justify-between gap-4">
      <div class="flex flex-wrap items-center gap-3">
        <!-- Search within BO -->
        <div class="relative w-full sm:w-64">
          <Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari kabupaten atau BM..."
            class="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-800 placeholder-slate-400 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-hidden transition-all"
          />
        </div>

        <!-- Filter Status Markas -->
        <div class="flex items-center gap-1.5 text-xs">
          <span class="text-slate-500 font-medium">Markas:</span>
          <select
            v-model="statusMarkasFilter"
            class="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:bg-white focus:outline-hidden focus:border-indigo-400 cursor-pointer"
          >
            <option value="all">Semua Status</option>
            <option value="wajib">Hanya Wajib</option>
            <option value="tidak-wajib">Hanya Tidak Wajib</option>
          </select>
        </div>

        <!-- Filter Kedekatan -->
        <div class="flex items-center gap-1.5 text-xs">
          <span class="text-slate-500 font-medium">Kedekatan:</span>
          <select
            v-model="kedekatanFilter"
            class="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:bg-white focus:outline-hidden focus:border-indigo-400 cursor-pointer"
          >
            <option value="all">Semua Tingkat</option>
            <option value="5">Level 5 - Mitra Strategis</option>
            <option value="4">Level 4 - Akrab / Relasi Baik</option>
            <option value="3">Level 3 - Komunikatif</option>
            <option value="2">Level 2 - Kenal</option>
            <option value="1">Level 1 - Belum Kenal</option>
          </select>
        </div>
      </div>

      <!-- Right Controls: View Switcher & Reset -->
      <div class="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
        <span class="text-xs text-slate-500">
          <strong>{{ filteredKabupatenList.length }}</strong> kabupaten
        </span>

        <!-- Reset Button -->
        <button
          v-if="statusMarkasFilter !== 'all' || kedekatanFilter !== 'all' || searchQuery"
          @click="statusMarkasFilter = 'all'; kedekatanFilter = 'all'; searchQuery = ''"
          class="text-xs text-indigo-600 hover:text-indigo-700 font-semibold underline underline-offset-2 cursor-pointer"
        >
          Reset
        </button>

        <!-- View Mode Switcher -->
        <div class="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
          <button
            @click="viewMode = 'card'"
            :class="[
              'p-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1',
              viewMode === 'card' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
            ]"
            title="Tampilan Kartu"
          >
            <LayoutGrid class="w-4 h-4" />
            <span class="hidden sm:inline">Kartu</span>
          </button>
          <button
            @click="viewMode = 'table'"
            :class="[
              'p-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1',
              viewMode === 'table' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
            ]"
            title="Tampilan Tabel"
          >
            <TableIcon class="w-4 h-4" />
            <span class="hidden sm:inline">Tabel</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Kabupaten Content -->
    <div v-if="filteredKabupatenList.length > 0">
      <!-- Card View -->
      <div v-if="viewMode === 'card'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <KabupatenCard
          v-for="kab in filteredKabupatenList"
          :key="kab.kabId"
          :kabupaten="kab"
        />
      </div>

      <!-- Table View -->
      <div v-else>
        <KabupatenTable :kabupaten-list="filteredKabupatenList" />
      </div>
    </div>

    <!-- Empty State for Filter -->
    <div v-else class="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
      <div class="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400 mb-3">
        <Search class="w-7 h-7" />
      </div>
      <h3 class="text-base font-bold text-slate-800 mb-1">Kabupaten tidak ditemukan</h3>
      <p class="text-xs text-slate-500 max-w-sm mx-auto mb-4">
        Tidak ada kabupaten di bawah BO ini yang cocok dengan filter atau kata kunci yang Anda masukkan.
      </p>
      <button
        @click="statusMarkasFilter = 'all'; kedekatanFilter = 'all'; searchQuery = ''"
        class="px-4 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors cursor-pointer"
      >
        Reset Filter & Pencarian
      </button>
    </div>
  </div>
</template>

