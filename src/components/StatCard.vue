<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  badgeText: {
    type: String,
    default: ''
  },
  badgeClass: {
    type: String,
    default: 'bg-slate-100 text-slate-700'
  },
  iconBgClass: {
    type: String,
    default: 'bg-indigo-50 text-indigo-600'
  }
})
</script>

<template>
  <div class="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition-all duration-200 group">
    <div class="flex items-start justify-between">
      <div class="space-y-1">
        <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">{{ title }}</p>
        <p class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{{ value }}</p>
      </div>
      <div :class="['w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105', iconBgClass]">
        <slot name="icon" />
      </div>
    </div>

    <div v-if="subtitle || badgeText" class="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
      <span class="text-slate-500 font-medium truncate">{{ subtitle }}</span>
      <span v-if="badgeText" :class="['px-2 py-0.5 rounded-full font-semibold shrink-0 text-[11px]', badgeClass]">
        {{ badgeText }}
      </span>
    </div>
  </div>
</template>

