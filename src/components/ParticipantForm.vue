<script setup lang="ts">
defineProps<{
  modelValue: {
    name: string
    seatNumber: string
    notes: string
  }
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void
}>()
</script>

<template>
  <div class="space-y-4">
    <div class="form-control w-full">
      <label class="label mb-2">
        <span class="label-text">昵称</span>
      </label>
      <input 
        :value="modelValue.name"
        @input="emit('update:modelValue', { ...modelValue, name: ($event.target as HTMLInputElement).value })"
        class="input input-bordered w-full"
      >
    </div>
    <div class="form-control w-full">
      <label class="label mb-2">
        <span class="label-text">座位号</span>
      </label>
      <input 
        :value="modelValue.seatNumber"
        @input="emit('update:modelValue', { ...modelValue, seatNumber: ($event.target as HTMLInputElement).value })"
        class="input input-bordered w-full"
      >
    </div>
    <div class="form-control w-full">
      <label class="label mb-2">
        <span class="label-text">备注</span>
      </label>
      <input 
        :value="modelValue.notes"
        @input="emit('update:modelValue', { ...modelValue, notes: ($event.target as HTMLInputElement).value })"
        class="input input-bordered w-full"
      >
    </div>
  </div>
</template>
