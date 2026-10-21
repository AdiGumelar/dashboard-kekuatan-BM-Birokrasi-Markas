<script setup>
import { Building2, RefreshCw, AlertCircle } from "@lucide/vue";
import { useDashboardData } from "../composables/useDashboardData";
import { formatDateTime } from "../utils/dataHelpers";

const { isLoading, isUsingMock, lastSyncTime, errorMessage, loadData, clearSelectedBo } = useDashboardData();
</script>

<template>
  <header class="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs backdrop-blur-md bg-white/95">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-18">
        <!-- Logo & Title -->
        <div class="flex items-center space-x-3.5 cursor-pointer select-none" @click="clearSelectedBo">
          <div class="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Building2 class="w-6 h-6" />
          </div>
          <div>
            <div class="flex items-center space-x-2">
              <h1 class="text-lg font-bold tracking-tight text-slate-900 leading-tight">Dashboard Kekuatan BM & Markas</h1>
            </div>
            <p class="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
              <span>Birokrasi Dinas</span>
              <span class="inline-block w-1 h-1 rounded-full bg-slate-300"></span>
              <span>Organisasi Profesi (IGTKI, K3S, MKKS)</span>
              <span class="inline-block w-1 h-1 rounded-full bg-slate-300"></span>
              <span>Status Markas</span>
            </p>
          </div>
        </div>

        <!-- Controls: Actions -->
        <div class="flex items-center space-x-3">
          <!-- Data Source Badge -->
          <div class="flex items-center px-3 py-1.5 rounded-xl border text-xs" :class="isUsingMock ? 'bg-amber-50/70 border-amber-200 text-amber-800' : 'bg-emerald-50/70 border-emerald-200 text-emerald-800'">
            <div class="w-2 h-2 rounded-full mr-2" :class="isUsingMock ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'"></div>
            <div class="leading-tight">
              <span class="font-semibold block">{{ isUsingMock ? "Mode Data Bawaan" : "Google Sheets Terhubung" }}</span>
              <span class="text-[10px] opacity-75">Update: {{ formatDateTime(lastSyncTime) }}</span>
            </div>
          </div>

          <!-- Refresh Button -->
          <button
            @click="loadData"
            :disabled="isLoading"
            title="Sinkronkan data dari Spreadsheet"
            class="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs hover:border-slate-300 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw class="w-3.5 h-3.5 text-indigo-600" :class="{ 'animate-spin': isLoading }" />
            <span class="hidden sm:inline">{{ isLoading ? "Sinkron..." : "Sinkronkan" }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Error Alert Banner (jika sinkronisasi gagal) -->
    <div v-if="errorMessage" class="bg-amber-50 border-t border-amber-200 px-4 py-2">
      <div class="max-w-7xl mx-auto flex items-center justify-between text-xs text-amber-800">
        <div class="flex items-center gap-2">
          <AlertCircle class="w-4 h-4 text-amber-600 shrink-0" />
          <span>{{ errorMessage }}</span>
        </div>
        <button @click="errorMessage = null" class="text-amber-700 hover:text-amber-900 font-bold ml-4">✕</button>
      </div>
    </div>
  </header>
</template>
