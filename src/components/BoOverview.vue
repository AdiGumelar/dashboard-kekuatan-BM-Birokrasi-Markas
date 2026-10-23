<script setup>
import { computed } from "vue";
import {
  Building2,
  MapPin,
  Users,
  ShieldAlert,
  ShieldCheck,
  Award,
  ChevronRight,
  Filter,
  Search,
  Sparkles,
  Compass,
  ArrowDown,
  Tv
} from "@lucide/vue";
import { useDashboardData } from "../composables/useDashboardData";
import { useAuth } from "../composables/useAuth";
import StatCard from "./StatCard.vue";

const {
  filteredBoList,
  paginatedBoList,
  hasMoreBo,
  loadMoreBo,
  globalStats,
  amList,
  amFilter,
  provinsiList,
  provinsiFilter,
  searchQuery,
  selectBo,
  openStatusPenayanganModal,
  openStatusMarkasModal,
  openTotalBoModal,
  openTotalKabupatenModal
} = useDashboardData();

const { isAdmin, isAm, currentAmCode } = useAuth();
</script>

<template>
  <div class="space-y-8">
    <!-- Top Summary Banner -->
    <div class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl">
      <div class="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div class="relative z-10 max-w-3xl">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-indigo-200 mb-3 border border-white/10">
          <Sparkles class="w-3.5 h-3.5 text-indigo-300" />
          <span>{{ isAm ? `Sistem Monitoring Wilayah ${currentAmCode}` : 'Sistem Monitoring Kekuatan Wilayah Terintegrasi' }}</span>
        </div>
        <h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
          {{ isAm ? `Wilayah Area Manager (${currentAmCode})` : 'Seluruh Branch Office (BO)' }}
        </h2>
        <p class="text-slate-300 text-sm sm:text-base leading-relaxed">
          {{ isAm
            ? `Menampilkan persebaran kekuatan Branch Manager (BM), status kepatuhan markas, status penayangan wilayah, hubungan kedinasan, serta kemitraan organisasi guru di wilayah ${currentAmCode}.`
            : 'Menampilkan persebaran kekuatan Branch Manager (BM), status kepatuhan markas, status penayangan wilayah, hubungan kedinasan, serta kemitraan organisasi guru (IGTKI, K3S, MKKS) secara terpadu di seluruh Indonesia.' }}
        </p>
      </div>
    </div>

    <!-- Executive KPI Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
      <StatCard
        title="Total BO"
        :value="globalStats.totalBo"
        subtitle="Kantor Cabang Wilayah"
        badge-text="Terpetakan"
        badge-class="bg-indigo-50 text-indigo-700"
        icon-bg-class="bg-indigo-50 text-indigo-600"
        class="cursor-pointer hover:border-indigo-300 hover:ring-2 hover:ring-indigo-200/60 transition-all select-none"
        @click="openTotalBoModal"
      >
        <template #icon>
          <Building2 class="w-6 h-6" />
        </template>
      </StatCard>

      <StatCard
        title="Kabupaten & Kota"
        :value="globalStats.totalKabupaten"
        subtitle="Cakupan Operasional"
        :badge-text="`${globalStats.totalBo} BO`"
        badge-class="bg-sky-50 text-sky-700"
        icon-bg-class="bg-sky-50 text-sky-600"
        class="cursor-pointer hover:border-sky-300 hover:ring-2 hover:ring-sky-200/60 transition-all select-none"
        @click="openTotalKabupatenModal"
      >
        <template #icon>
          <MapPin class="w-6 h-6" />
        </template>
      </StatCard>

      <StatCard
        title="Wajib Markas"
        :value="globalStats.totalMarkasWajib"
        :subtitle="`${globalStats.totalMarkasTidakWajib} Tidak Wajib`"
        icon-bg-class="bg-rose-50 text-rose-600"
        class="cursor-pointer hover:border-rose-300 hover:ring-2 hover:ring-rose-200/60 transition-all select-none"
        @click="openStatusMarkasModal"
      >
        <template #icon>
          <ShieldAlert class="w-6 h-6" />
        </template>
      </StatCard>

      <StatCard
        title="Status Penayangan"
        :value="globalStats.totalPenayanganTayang"
        :subtitle="`${globalStats.totalPenayanganProses} Proses · ${globalStats.totalPenayanganBelum} Belum`"
        :badge-text="`${globalStats.persenPenayanganTayang}% Tayang`"
        badge-class="bg-emerald-50 text-emerald-700"
        icon-bg-class="bg-emerald-50 text-emerald-600"
class="cursor-pointer hover:border-emerald-300 hover:ring-2 hover:ring-emerald-200/60 hover:-translate-y-0.5 active:scale-[0.99] transition-all select-none"
        @click="openStatusPenayanganModal"
      >
        <template #icon>
          <Tv class="w-6 h-6" />
        </template>
      </StatCard>

      <StatCard
        title="Kekuatan Birokrasi"
        :value="globalStats.avgBirokrasiScore + ' / 5'"
        :subtitle="globalStats.avgBirokrasiMeta.label"
        badge-text="Rata-rata Nasional"
        :badge-class="globalStats.avgBirokrasiMeta.badgeClass"
        icon-bg-class="bg-purple-50 text-purple-600"
      >
        <template #icon>
          <Sparkles class="w-6 h-6" />
        </template>
      </StatCard>
    </div>

    <!-- Filters & Search Toolbar -->
    <div class="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
      <div class="flex flex-wrap items-center gap-3 flex-1">
        <!-- Search Input sejajar dengan filter -->
        <div class="relative w-full sm:w-64">
          <Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari BO, Kabupaten, atau BM..."
            class="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-800 placeholder-slate-400 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-hidden transition-all"
          />
        </div>

        <!-- Filter Area Manager (Terkunci untuk role AM) -->
        <div v-if="isAm" class="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-bold text-emerald-800">
          <Filter class="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>AM: {{ currentAmCode }} (Terkunci)</span>
        </div>

        <!-- Filter Area Manager (Bebas untuk Administrator) -->
        <div v-else class="flex items-center gap-2">
          <Filter class="w-4 h-4 text-slate-400 shrink-0" />
          <span class="text-xs font-semibold text-slate-600">AM:</span>
          <select
            v-model="amFilter"
            class="text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 cursor-pointer"
          >
            <option value="all">Semua AM ({{ amList.length }})</option>
            <option v-for="am in amList" :key="am" :value="am">{{ am }}</option>
          </select>
        </div>

        <!-- Filter Provinsi -->
        <div class="flex items-center gap-2" v-if="provinsiList.length > 0">
          <Compass class="w-4 h-4 text-slate-400 shrink-0" />
          <span class="text-xs font-semibold text-slate-600">Provinsi:</span>
          <select
            v-model="provinsiFilter"
            class="text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 cursor-pointer max-w-xs truncate"
          >
            <option value="all">Semua Provinsi ({{ provinsiList.length }})</option>
            <option v-for="prov in provinsiList" :key="prov" :value="prov">{{ prov }}</option>
          </select>
        </div>
      </div>

      <!-- Quick count / reset -->
      <div class="flex items-center justify-between lg:justify-end gap-3 text-xs text-slate-500 shrink-0">
        <span>Menampilkan <strong class="text-slate-800">{{ paginatedBoList.length }}</strong> dari <strong class="text-slate-800">{{ filteredBoList.length }}</strong> BO</span>
        <button
          v-if="(isAdmin && amFilter !== 'all') || provinsiFilter !== 'all' || searchQuery"
          @click="
            if (isAdmin) amFilter = 'all';
            provinsiFilter = 'all';
            searchQuery = '';
          "
          class="text-indigo-600 hover:text-indigo-700 font-semibold underline underline-offset-2 cursor-pointer"
        >
          Reset Filter
        </button>
      </div>
    </div>

    <!-- BO Cards Grid -->
    <div v-if="paginatedBoList.length > 0" class="space-y-8">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="bo in paginatedBoList"
          :key="bo.kodeBo"
          @click="selectBo(bo.kodeBo)"
          class="bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-300 p-6 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between group relative overflow-hidden"
        >
          <!-- Accent top border stripe -->
          <div class="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 to-sky-500 opacity-80 group-hover:opacity-100 transition-opacity"></div>

          <div>
            <!-- Card Header: Code & Leadership (AM + BM) -->
            <div class="flex items-start justify-between gap-3 mb-2.5">
              <span class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100/80 font-mono tracking-wider">
                {{ bo.kodeBo }}
              </span>
              <div class="text-right space-y-0.5">
                <div class="text-xs text-slate-600">
                  <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">AM: </span>
                  <strong class="text-slate-700 font-bold">{{ bo.am }}</strong>
                </div>
                <div v-if="bo.namaBm && bo.namaBm !== '-'" class="text-xs text-slate-600">
                  <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">BM: </span>
                  <strong class="text-indigo-700 font-bold">{{ bo.namaBm }}</strong>
                </div>
              </div>
            </div>

            <!-- BO Name & Province -->
            <div class="mb-4">
              <h3 class="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">
                {{ bo.namaBo }}
              </h3>
              <p v-if="bo.provinsi" class="text-xs text-slate-400 font-medium mt-0.5">
                {{ bo.provinsi }}
              </p>
            </div>

            <!-- Mini Metrics Strip: Sebaran Wilayah & Markas -->
            <div class="grid grid-cols-3 gap-2 p-3 bg-slate-50/80 rounded-xl border border-slate-100 mb-5">
              <div class="text-center">
                <span class="text-[11px] text-slate-500 block">Total Wilayah</span>
                <span class="text-base font-extrabold text-slate-800">{{ bo.totalKabupaten }}</span>
              </div>
              <div class="text-center border-x border-slate-200/60">
                <span class="text-[11px] text-rose-600 font-semibold block">Wajib Markas</span>
                <span class="text-base font-extrabold text-rose-700">{{ bo.totalWajibMarkas }}</span>
              </div>
              <div class="text-center">
                <span class="text-[11px] text-slate-500 font-semibold block">Tidak Wajib</span>
                <span class="text-base font-extrabold text-slate-700">{{ bo.totalTidakWajibMarkas }}</span>
              </div>
            </div>

            <!-- Progress Bars / Highlights -->
            <div class="space-y-3 mb-5 text-xs">
              <!-- Relasi Dinas Matang Bar -->
              <div>
                <div class="flex items-center justify-between text-slate-600 font-medium mb-1">
                  <span>Relasi Dinas (Akrab/Mitra)</span>
                  <span class="font-bold text-slate-800">{{ bo.totalRelasiMatang }} / {{ bo.totalKabupaten }} ({{ bo.persenRelasiMatang }}%)</span>
                </div>
                <div class="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div class="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500" :style="{ width: `${bo.persenRelasiMatang}%` }"></div>
                </div>
              </div>

              <!-- Birokrasi Score -->
              <div class="flex items-center justify-between pt-1">
                <span class="text-slate-500">Kekuatan Birokrasi:</span>
                <span :class="['px-2 py-0.5 rounded-md text-[11px] font-semibold border', bo.avgBirokrasiMeta.badgeClass]">
                  {{ bo.avgBirokrasiMeta.label }}
                </span>
              </div>
            </div>

            <!-- Kabupaten Preview Chips -->
            <div>
              <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2"> Daftar Wilayah di BO ini: </span>
              <div class="flex flex-wrap gap-1.5">
                <span v-for="kab in bo.kabupatenList.slice(0, 4)" :key="kab.kabId" class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/70">
                  {{ kab.kabupaten }}
                </span>
                <span v-if="bo.kabupatenList.length > 4" class="inline-flex items-center px-1.5 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700"> +{{ bo.kabupatenList.length - 4 }} lainnya </span>
              </div>
            </div>
          </div>

          <!-- Footer Action Button -->
          <div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-indigo-600 font-semibold text-xs group-hover:text-indigo-700">
            <span>Buka Detail Kabupaten</span>
            <div class="w-7 h-7 rounded-full bg-indigo-50 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center transition-all">
              <ChevronRight class="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </div>
          </div>
        </div>
      </div>

      <!-- Load More Button -->
      <div v-if="hasMoreBo" class="text-center pt-4">
        <button @click="loadMoreBo" class="inline-flex items-center gap-2 px-6 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 shadow-xs hover:shadow-md transition-all cursor-pointer">
          <ArrowDown class="w-4 h-4 text-indigo-600" />
          <span>Tampilkan Lebih Banyak (Masih ada {{ filteredBoList.length - paginatedBoList.length }} BO)</span>
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
      <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400 mb-4">
        <Search class="w-8 h-8" />
      </div>
      <h3 class="text-lg font-bold text-slate-800 mb-1">Tidak ada BO yang sesuai kriteria</h3>
      <p class="text-sm text-slate-500 max-w-md mx-auto mb-5">Coba ubah kata kunci pencarian atau reset filter Area Manager / Provinsi untuk melihat kembali data.</p>
      <button
        @click="
          amFilter = 'all';
          provinsiFilter = 'all';
          searchQuery = '';
        "
        class="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors cursor-pointer"
      >
        Tampilkan Semua BO
      </button>
    </div>
  </div>
</template>
