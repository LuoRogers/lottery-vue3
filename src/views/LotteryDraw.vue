<template>
  <div class="p-4">
    <div class="card bg-base-200 shadow-xl">
      <div class="card-body">
        <h2 class="card-title">抽奖设置</h2>
        
          <div class="flex flex-col gap-4">
            <div class="form-control space-y-2">
            <label class="label p-0">
              <span class="label-text text-lg font-medium">当前抽奖池人数</span>
            </label>
            <div class="stat p-0">
              <div class="stat-value text-primary text-3xl">{{ currentPoolSize }}</div>
            </div>
          </div>
            <div class="form-control space-y-2">
            <div class="flex justify-between items-center">
              <label class="label p-0">
                <span class="label-text text-lg font-medium">选择奖品</span>
              </label>
              <span class="label-text-alt text-error" v-if="selectedPrize === '' && drawCount > 0">
                请选择奖品
              </span>
            </div>
            <select 
              v-model="selectedPrize" 
              class="select select-bordered select-primary w-full text-base"
              :class="{'select-error': selectedPrize === '' && drawCount > 0}"
              :disabled="isDrawing"
              @change="drawCount = Math.min(drawCount, maxDrawCount)"
            >
              <option disabled value="">请选择奖品</option>
              <option 
                v-for="prize in allPrizes" 
                :value="prize.name" 
                :key="prize.pid"
                :disabled="prize.quantity <= 0"
              >
                {{ prize.name }} (剩余: {{ prize.quantity }})
              </option>
            </select>
          </div>

          <div class="form-control space-y-2">
            <div class="flex justify-between items-center">
              <label class="label p-0">
                <span class="label-text text-lg font-medium">抽取数量</span>
              </label>
              <span class="label-text-alt">
                最多可抽: {{ maxDrawCount }} 人
              </span>
            </div>
            <div class="flex items-center gap-2">
              <button
                @click="decrementDrawCount"
                class="btn btn-primary"
                :disabled="isDrawing || !selectedPrize || drawCount <= 1"
              >
                -
              </button>
              <input
                v-model.number="drawCount"
                type="number"
                min="1"
                class="input input-bordered w-full text-base text-center"
                :class="{'input-error': drawCount > maxDrawCount || drawCount < 1}"
                :max="maxDrawCount"
                :disabled="isDrawing || !selectedPrize"
                @input="validateDrawCount"
              >
              <button
                @click="incrementDrawCount"
                class="btn btn-primary"
                :disabled="isDrawing || !selectedPrize || drawCount >= maxDrawCount"
              >
                +
              </button>
            </div>
            <div v-if="drawCount > maxDrawCount || drawCount < 1" class="text-sm text-error">
              {{ drawCount < 1 ? '至少抽取1人' : `最多只能抽取${maxDrawCount}人` }}
            </div>
          </div>
          </div>
          

          <div class="form-control flex flex-col md:flex-row justify-end gap-4 items-end mt-2">
            <button 
              @click="resetForm" 
              class="btn btn-ghost"
              :disabled="isDrawing"
            >
              重置
            </button>
            <button 
              @click="startDraw" 
              class="btn btn-primary"
              :disabled="!canDraw || isDrawing"
              :class="{'btn-success': canDraw}"
            >
              <span v-if="isDrawing" class="loading loading-spinner"></span>
              {{ isDrawing ? '抽奖中...' : canDraw ? '开始抽奖' : '请完成设置' }}
            </button>
          </div>
      </div>
    </div>

    <div v-if="isDrawing" class="card bg-base-200 shadow-xl mt-4">
      <div class="card-body items-center text-center">
        <h2 class="card-title">正在抽取: {{ selectedPrize }}</h2>
        <div class="text-xl">
          正在抽取第 {{ currentDrawIndex + 1 }} / {{ drawCount }} 位中奖者
        </div>
        <progress 
          class="progress progress-primary w-full mt-4" 
          :value="currentDrawIndex + 1" 
          :max="drawCount"
        ></progress>
      </div>
    </div>

    <div v-if="winners.length > 0" class="card bg-base-100 shadow-xl mt-4">
      <div class="card-body">
        <div class="flex justify-between items-center">
          <h2 class="card-title">中奖名单</h2>
          <button @click="saveWinners" class="btn btn-success">
            保存结果
          </button>
        </div>
        
        <div class="space-y-4">
          <div v-for="(winner, index) in displayedWinners" :key="winner.pid" 
               class="animate-fade-in-up" :style="`animation-delay: ${index * 0.2}s`">
            <div class="bg-primary/5 p-4 rounded-lg border border-primary/10">
              <div class="flex items-center gap-4">
                <div class="text-2xl font-bold text-primary">{{ index + 1 }}</div>
                <div>
                  <div class="font-bold">ID: {{ winner.pid }}</div>
                  <div>昵称: {{ winner.pname || '匿名' }}</div>
                  <div>座位号: {{ winner.seat_number || '-' }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useLotteryStore } from '@/stores/lottery'
import type { WinnerRecord } from '@/stores/lottery'
import { toast } from 'vue-sonner'

const store = useLotteryStore()
const selectedPrize = ref('')
const drawCount = ref(1)
const isDrawing = ref(false)
const winners = ref<WinnerRecord[]>([])
const displayedWinners = ref<WinnerRecord[]>([])
const currentDrawIndex = ref(0)

const allPrizes = computed(() => store.allPrizes)
const currentPoolSize = computed(() => store.currentPool.length)

const maxDrawCount = computed(() => {
  if (!selectedPrize.value) return 0
  const prize = allPrizes.value.find(p => p.name === selectedPrize.value)
  return Math.min(prize?.quantity || 0, currentPoolSize.value)
})

const canDraw = computed(() => {
  return selectedPrize.value && drawCount.value > 0 && maxDrawCount.value >= drawCount.value
})

  const startDraw = async () => {
    if (!canDraw.value) return

    isDrawing.value = true
    winners.value = []
    displayedWinners.value = []

    // 实际抽奖
    const result = store.drawWinners(selectedPrize.value, drawCount.value)
    winners.value = result

    // 逐个显示中奖者 (加快速度)
    for (let i = 0; i < result.length; i++) {
      currentDrawIndex.value = i
      await new Promise(resolve => setTimeout(resolve, 50))
      displayedWinners.value.push(result[i])
    }

    isDrawing.value = false
}

  const decrementDrawCount = () => {
    if (drawCount.value > 1) {
      drawCount.value--
    }
  }

  const incrementDrawCount = () => {
    if (drawCount.value < maxDrawCount.value) {
      drawCount.value++
    }
  }

  const validateDrawCount = () => {
    if (drawCount.value > maxDrawCount.value) {
      drawCount.value = maxDrawCount.value
    } else if (drawCount.value < 1) {
      drawCount.value = 1
    }
  }

  const resetForm = () => {
    selectedPrize.value = ''
    drawCount.value = 1
    winners.value = []
    displayedWinners.value = []
  }

  const saveWinners = () => {
    store.saveWinners()
    toast.success('中奖结果已保存！')
  }
</script>

<style>
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.5s ease-out forwards;
  opacity: 0;
}
</style>
