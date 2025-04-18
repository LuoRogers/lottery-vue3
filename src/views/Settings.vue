<script setup lang="ts">
import { ref } from 'vue'
import { useLotteryStore } from '@/stores/lottery'
import { confirm } from '@/services/confirmService'
import { useDialog } from '@/services/dialogService'

const importFile = ref<File | null>(null)
const store = useLotteryStore()

const exportWinners = () => {
  store.exportWinnersToCSV()
}

const exportAllData = () => {
  store.exportAllData()
}

const importData = async (e: Event) => {
  const input = e.target as HTMLInputElement
  if (!input.files?.length) return

  const file = input.files[0]
  if (!file.name.endsWith('.json')) {
    const { showDialog } = useDialog()
    await showDialog({
      type: 'error',
      message: '请选择JSON格式的文件'
    })
    return
  }

  const confirmed = await confirm({
    title: '确认导入数据',
    message: '确定要导入数据吗？这将覆盖当前所有数据！',
    confirmText: '确认导入'
  })
  
  if (!confirmed) {
    input.value = ''
    return
  }

  try {
    await store.importAllData(file)
    const { showDialog } = useDialog()
    await showDialog({
      type: 'success',
      message: '数据导入成功！'
    })
  } catch (err) {
    const { showDialog } = useDialog()
    await showDialog({
      type: 'error',
      message: `导入失败: ${err instanceof Error ? err.message : String(err)}`
    })
  } finally {
    input.value = ''
  }
}
</script>

<template>
  <div class="p-4">
    <div class="card bg-base-200 shadow-xl">
      <div class="card-body">
        <h2 class="card-title">系统设置</h2>

        <div class="space-y-4">
          <div class="form-control">
            <label class="label cursor-pointer">
              <span class="label-text">允许重复中奖</span>
              <input 
                type="checkbox" 
                class="toggle toggle-primary"
                v-model="store.allowDuplicateWinners"
              >
            </label>
          </div>

          <div class="divider"></div>

          <div class="flex flex-wrap gap-2">
            <button 
              @click="exportWinners" 
              class="btn btn-primary"
              :disabled="store.winnerRecords.length === 0"
            >
              导出中奖记录(CSV)
            </button>
            <button 
              @click="exportAllData"
              class="btn btn-secondary"
            >
              导出全部数据(JSON)
            </button>
            <label class="btn btn-accent">
              导入数据(JSON)
              <input 
                type="file" 
                class="hidden" 
                accept=".json"
                @change="importData"
              >
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
