<template>
  <div class="p-4">
    <div class="card bg-base-200 shadow-xl">
      <div class="card-body">
        <h2 class="card-title">参与者管理</h2>
        
        <div class="flex flex-wrap gap-4">
          <div class="form-control w-full mb-4">
            <label class="label mb-2">
              <span class="label-text">导入Excel文件</span>
            </label>
            <input 
              type="file" 
              accept=".xlsx,.xls" 
              @change="handleFileUpload" 
              class="file-input file-input-bordered w-full"
            >
          </div>

          <div class="form-control w-full mb-4">
            <label class="label mb-2">
              <span class="label-text">生成随机参与者</span>
            </label>
            <div class="flex gap-2 w-full">
              <input 
                v-model.number="randomCount" 
                type="number" 
                min="1" 
                max="10000" 
                class="input input-bordered flex-1"
              >
              <button @click="generateRandom" class="btn btn-primary">
                生成
              </button>
            </div>
          </div>
        </div>

        <div class="overflow-x-auto mt-4">
          <table class="table table-zebra">
            <thead>
              <tr>
                <th>ID</th>
                <th>昵称</th>
                <th>座位号</th>
                <th>备注</th>
                <th>已抽中</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in store.allParticipants" :key="p.pid">
                <td>{{ p.pid }}</td>
                <td>{{ p.name || '-' }}</td>
                <td>{{ p.seatNumber || '-' }}</td>
                <td>{{ p.notes || '-' }}</td>
                <td>{{ isWinner(p.pid) ? '是' : '否' }}</td>
                <td class="flex gap-2">
                  <button 
                    @click="openEditModal(p)"
                    class="btn btn-sm btn-info"
                  >
                    编辑
                  </button>
                  <button 
                    @click="() => removeParticipant(p.pid)"
                    class="btn btn-error btn-sm"
                  >
                    删除
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex justify-end gap-4 mt-4">
          <button 
            @click="resetParticipantsStatus" 
            class="btn btn-warning"
          >
            重置抽中状态
          </button>
          <button 
            @click="clearParticipants" 
            class="btn btn-error"
          >
            清空参与者
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useLotteryStore } from '@/stores/lottery'
import { confirm } from '@/services/confirmService'
import { edit } from '@/services/editService'
import ParticipantForm from '@/components/ParticipantForm.vue'

const store = useLotteryStore()
const randomCount = ref(100)
const editingParticipant = ref({
  pid: '',
  name: '',
  seatNumber: '',
  notes: ''
})

const isWinner = (pid: string) => {
  return store.winnerRecords.some(record => record.pid === pid)
}

watch(() => store.winnerRecords, () => {
  // 强制重新渲染表格
}, { deep: true })

const handleFileUpload = async (e: Event) => {
  const input = e.target as HTMLInputElement
  if (input.files?.length) {
    const result = await store.loadParticipantsFromExcel(input.files[0])
    if (result.success) {
      const { showDialog } = useDialog()
      await showDialog({
        message: result.message,
        type: 'success'
      })
    } else {
      const { showDialog } = useDialog()
      await showDialog({
        message: `导入失败: ${result.message}`,
        type: 'error'
      })
    }
    input.value = '' // 重置文件输入
  }
}

const generateRandom = () => {
  store.generateParticipants(randomCount.value)
}

const openEditModal = async (participant: any) => {
  editingParticipant.value = { ...participant }
  const result = await edit({
    title: '编辑参与者',
    content: ParticipantForm,
    props: {
      modelValue: editingParticipant.value
    },
    onConfirm: () => {
      store.updateParticipant(editingParticipant.value.pid, {
        name: editingParticipant.value.name,
        seatNumber: editingParticipant.value.seatNumber,
        notes: editingParticipant.value.notes
      })
    }
  })
}

const removeParticipant = async (pid: string) => {
  const confirmed = await confirm({
    title: '确认删除',
    message: '确定要删除此参与者吗？'
  })
  if (confirmed) {
    store.removeParticipant(pid)
  }
}

const resetParticipantsStatus = async () => {
  const confirmed = await confirm({
    title: '确认重置',
    message: '确定要重置所有参与者的抽中状态吗？'
  })
  if (confirmed) {
    store.resetAllParticipantsStatus()
  }
}

const clearParticipants = async () => {
  const confirmed = await confirm({
    title: '确认清空',
    message: '确定要清空所有参与者吗？此操作不可撤销！'
  })
  if (confirmed) {
    store.allParticipants = []
    store.currentPool = []
  }
}
</script>
