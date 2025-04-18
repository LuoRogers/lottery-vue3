<script setup lang="ts">
defineProps<{
  modelValue: {
    name: string
    quantity: number
    image: string
    description: string
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
        <span class="label-text">奖品名称</span>
      </label>
      <input 
        :value="modelValue.name"
        @input="emit('update:modelValue', { ...modelValue, name: ($event.target as HTMLInputElement).value })"
        class="input input-bordered w-full"
        placeholder="奖品名称"
      >
    </div>
    <div class="form-control w-full">
      <label class="label mb-2">
        <span class="label-text">奖品数量</span>
      </label>
      <input 
        :value="modelValue.quantity"
        @input="emit('update:modelValue', { ...modelValue, quantity: Number(($event.target as HTMLInputElement).value) })"
        type="number" 
        min="1" 
        class="input input-bordered w-full"
        placeholder="数量"
      >
    </div>
    <div class="form-control w-full">
      <label class="label mb-2">
        <span class="label-text">奖品图片URL</span>
      </label>
      <input 
        :value="modelValue.image"
        @input="emit('update:modelValue', { ...modelValue, image: ($event.target as HTMLInputElement).value })"
        class="input input-bordered w-full"
        placeholder="图片URL"
      >
    </div>
    <div class="form-control w-full">
      <label class="label mb-2">
        <span class="label-text">奖品描述</span>
      </label>
      <input 
        :value="modelValue.description"
        @input="emit('update:modelValue', { ...modelValue, description: ($event.target as HTMLInputElement).value })"
        class="input input-bordered w-full"
        placeholder="描述"
      >
    </div>
  </div>
</template>
