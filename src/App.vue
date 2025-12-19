<template>
  <div class="min-h-screen bg-base-100">
    <LoadingIndicator :isLoading="loadingStore.isLoading" />
    <div class="drawer lg:drawer-open">
      <!-- 添加抽屉控制checkbox -->
      <input id="drawer-toggle" type="checkbox" class="drawer-toggle" />
      <label for="drawer-toggle" class="btn btn-ghost lg:hidden p-3 fixed top-0 left-0">
        <Icon icon="mdi:menu" class="h-5 w-5" />
      </label>
      <div class="drawer-content flex flex-col">
        <!-- Main content -->
        <main class="flex-1 px-6 py-4 transition-all duration-300">
          <RouterView />
        </main>
      </div>

      <!-- Sidebar -->
      <div class="drawer-side">
        <label for="drawer-toggle" class="drawer-overlay backdrop-blur-sm"></label>
        <div class="menu p-6 w-80 h-full bg-gradient-to-b from-base-200 to-base-300 text-base-content shadow-2xl transition-all duration-300 ease-in-out transform hover:shadow-xl">
          <div class="flex justify-between items-center mb-8 px-2 py-2 rounded-lg bg-base-100/50 backdrop-blur-sm shadow-md">
            <h1 class="text-2xl font-bold text-primary tracking-wide">抽奖系统</h1>
            <div class="flex gap-2">
              <button @click="toggleTheme" class="btn btn-sm btn-ghost hover:bg-base-300 rounded-full p-2 transition-transform hover:scale-105">
                <Icon icon="mdi:theme-light-dark" class="h-5 w-5" />
              </button>
            </div>
          </div>

          <ul class="space-y-2">
            <li>
              <RouterLink
                to="/draw"
                active-class="active"
                class="flex items-center gap-3 p-3 rounded-lg transition-all duration-300 hover:bg-primary/20 hover:text-primary hover:translate-x-1"
              >
                <Icon icon="mdi:draw" class="h-5 w-5 transition-transform group-hover:scale-110" />
                <span class="font-medium">抽奖</span>
              </RouterLink>
            </li>
            <li>
              <RouterLink
                to="/participants"
                active-class="active"
                class="flex items-center gap-3 p-3 rounded-lg transition-all duration-300 hover:bg-primary/20 hover:text-primary hover:translate-x-1"
              >
                <Icon icon="mdi:account-group" class="h-5 w-5 transition-transform group-hover:scale-110" />
                <span class="font-medium">参与者管理</span>
              </RouterLink>
            </li>
            <li>
              <RouterLink
                to="/prizes"
                active-class="active"
                class="flex items-center gap-3 p-3 rounded-lg transition-all duration-300 hover:bg-primary/20 hover:text-primary hover:translate-x-1"
              >
                <Icon icon="mdi:gift" class="h-5 w-5 transition-transform group-hover:scale-110" />
                <span class="font-medium">奖品管理</span>
              </RouterLink>
            </li>
            <li>
              <RouterLink
                to="/winners"
                active-class="active"
                class="flex items-center gap-3 p-3 rounded-lg transition-all duration-300 hover:bg-primary/20 hover:text-primary hover:translate-x-1"
              >
                <Icon icon="mdi:trophy" class="h-5 w-5 transition-transform group-hover:scale-110" />
                <span class="font-medium">中奖记录</span>
              </RouterLink>
            </li>
            <li>
              <RouterLink
                to="/settings"
                active-class="active"
                class="flex items-center gap-3 p-3 rounded-lg transition-all duration-300 hover:bg-primary/20 hover:text-primary hover:translate-x-1"
              >
                <Icon icon="mdi:cog" class="h-5 w-5 transition-transform group-hover:scale-110" />
                <span class="font-medium">系统设置</span>
              </RouterLink>
            </li>
          </ul>

          <!-- 版本信息 -->
          <div class="absolute bottom-4 left-0 right-0 px-6 text-center text-xs text-gray-500 opacity-70">
            <p>🎯 抽奖系统 v1.0</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { ref, watchEffect } from 'vue'
import LoadingIndicator from '@/components/LoadingIndicator.vue'
import { useLoadingStore } from '@/stores/loading'
import { Icon } from '@iconify/vue'

const loadingStore = useLoadingStore()
const theme = ref(localStorage.getItem('theme') || 'light')

const toggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
  localStorage.setItem('theme', theme.value)
}

watchEffect(() => {
  document.documentElement.setAttribute('data-theme', theme.value)
})
</script>

<style>
.active {
  @apply bg-primary text-primary-content;
}
</style>
