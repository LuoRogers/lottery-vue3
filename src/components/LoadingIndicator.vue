<template>
  <div 
    v-if="isLoading" 
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  >
    <div class="loading loading-spinner loading-lg text-primary"></div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  isLoading: boolean
}>()
</script>
