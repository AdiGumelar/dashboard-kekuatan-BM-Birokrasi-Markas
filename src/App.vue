<script setup>
import { onMounted } from "vue";
import { useDashboardData } from "./composables/useDashboardData";
import Navbar from "./components/Navbar.vue";
import BoOverview from "./components/BoOverview.vue";
import BoDetail from "./components/BoDetail.vue";
import KabupatenDetailModal from "./components/KabupatenDetailModal.vue";
import TotalBoModal from "./components/TotalBoModal.vue";
import StatusPenayanganModal from "./components/StatusPenayanganModal.vue";
import StatusMarkasModal from "./components/StatusMarkasModal.vue";
import { Building2, Sparkles, Database, FileSpreadsheet } from "@lucide/vue";

const { selectedBo, isLoading, loadData, isUsingMock } = useDashboardData();

onMounted(() => {
  // Ambil data Google Spreadsheet hanya saat pertama kali web dibuka atau saat di-refresh
  loadData();
});
</script>

<template>
  <div class="min-h-screen flex flex-col bg-slate-50 text-slate-800">
    <!-- Navbar Header -->
    <Navbar />

    <!-- Main Content Body -->
    <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <!-- Loading Skeleton / Spinner State -->
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-24 space-y-4">
        <div class="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p class="text-sm font-semibold text-slate-600">Memproses dan menggabungkan data spreadsheet...</p>
      </div>

      <!-- Main Views -->
      <div v-else>
        <transition name="fade" mode="out-in">
          <!-- View 2: BO Detail View -->
          <BoDetail v-if="selectedBo" :key="selectedBo.kodeBo" />

          <!-- View 1: Global BO Overview View -->
          <BoOverview v-else key="overview" />
        </transition>
      </div>
    </main>

    <!-- Modal Detail Kabupaten -->
    <KabupatenDetailModal />

    <!-- Modal Total BO -->
    <TotalBoModal />

    <!-- Modal Status Penayangan -->
    <StatusPenayanganModal />

    <!-- Modal Status Markas -->
    <StatusMarkasModal />

    <!-- Footer -->
    <footer class="mt-auto border-t border-slate-200/80 bg-white py-6">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div class="flex items-center space-x-2">
          <div class="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">BM</div>
          <span class="font-semibold text-slate-700">Dashboard Kekuatan BM & Status Markas</span>
          <span>&bull;</span>
          <span>Birokrasi Dinas & Organisasi Profesi (IGTKI, K3S, MKKS)</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<style>
/* Page transition */
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
</style>
