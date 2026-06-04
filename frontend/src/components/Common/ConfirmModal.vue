<template>
  <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center" @click.self="$emit('cancel')">
    <div class="fixed inset-0 bg-black/60"></div>
    <div class="relative bg-slate-800 rounded-xl border border-slate-700 p-6 w-full max-w-sm mx-4 shadow-2xl">
      <h3 class="text-lg font-bold text-slate-100 mb-2">{{ title }}</h3>
      <p class="text-slate-400 text-sm mb-6">{{ message }}</p>
      <div class="flex justify-end space-x-3">
        <button @click="$emit('cancel')" class="px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-700 transition text-sm">Cancel</button>
        <button @click="$emit('confirm')" class="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white transition text-sm font-medium">{{ confirmText }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  visible: boolean
  title: string
  message: string
  confirmText?: string
}>();

defineEmits<{
  confirm: []
  cancel: []
}>();
</script>
