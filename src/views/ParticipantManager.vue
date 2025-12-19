<template>
  <div class="p-4">
    <div class="card bg-base-200 shadow-xl">
      <div class="card-body">
        <h2 class="card-title mb-8">参与者管理</h2>

        <!-- 功能按钮区 -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <!-- 导入功能区 -->
          <div class="card bg-base-100 shadow-md hover:shadow-lg transition-shadow">
            <div class="card-body p-4">
              <h3 class="card-title text-sm font-semibold text-base-content mb-3">导入参与者</h3>
              <button
                @click="showImportModal = true"
                class="btn btn-primary w-full"
              >
                <Icon icon="mdi:import" class="w-4 h-4 mr-2" />
                导入名单
              </button>
            </div>
          </div>

          <!-- 生成随机参与者 -->
          <div class="card bg-base-100 shadow-md hover:shadow-lg transition-shadow">
            <div class="card-body p-4">
              <h3 class="card-title text-sm font-semibold text-base-content mb-3">随机生成</h3>
              <div class="flex gap-2">
                <input
                  v-model.number="randomCount"
                  type="number"
                  min="1"
                  max="10000"
                  class="input input-bordered flex-1"
                  placeholder="数量"
                >
                <button @click="generateRandom" class="btn btn-secondary">
                  <Icon icon="mdi:dice-1" class="w-4 h-4 mr-1" />
                  生成
                </button>
              </div>
            </div>
          </div>

          <!-- 搜索参与者 -->
          <div class="card bg-base-100 shadow-md hover:shadow-lg transition-shadow">
            <div class="card-body p-4">
              <h3 class="card-title text-sm font-semibold text-base-content mb-3">搜索参与者</h3>
              <div class="input-group">
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="昵称、座位号"
                  class="input input-bordered w-full"
                >
                <!-- <button class="btn btn-accent">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </button> -->
              </div>
            </div>
          </div>
        </div>

        <!-- 表格展示区 -->
        <div class="card bg-base-100 shadow-md">
          <div class="card-body p-4">
            <div class="overflow-x-auto">
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
                  <tr v-for="p in paginatedParticipants" :key="p.pid">
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
                        <Icon icon="mdi:pencil-outline" class="w-4 h-4 mr-1" />
                        编辑
                      </button>
                      <button
                        @click="() => removeParticipant(p.pid)"
                        class="btn btn-error btn-sm"
                      >
                        <Icon icon="mdi:delete-outline" class="w-4 h-4 mr-1" />
                        删除
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- 分页 -->
            <div v-if="totalPages > 1" class="flex justify-center items-center gap-2 mt-4">
              <button
                @click="currentPage = Math.max(1, currentPage - 1)"
                class="btn btn-sm"
                :disabled="currentPage === 1"
              >
                &lt;
              </button>

              <div class="join">
                <button
                  v-for="page in totalPages"
                  :key="page"
                  @click="currentPage = page"
                  class="join-item btn btn-sm"
                  :class="{ 'btn-active': currentPage === page }"
                >
                  {{ page }}
                </button>
              </div>

              <button
                @click="currentPage = Math.min(totalPages, currentPage + 1)"
                class="btn btn-sm"
                :disabled="currentPage === totalPages"
              >
                &gt;
              </button>

              <div class="flex items-center gap-2 ml-4">
                <label class="text-sm">每页</label>
                <select
                  v-model="itemsPerPage"
                  class="select select-bordered select-sm w-auto"
                >
                  <option :value="10">10</option>
                  <option :value="20" selected>20</option>
                  <option :value="50">50</option>
                  <option :value="100">100</option>
                </select>
                <label class="text-sm">条</label>
              </div>
            </div>
          </div>
        </div>

        <!-- 底部操作按钮 -->
        <div class="flex justify-between items-center gap-4 mt-4">
          <button
            @click="resetParticipantsStatus"
            class="btn btn-warning"
          >
            <Icon icon="mdi:refresh" class="w-4 h-4 mr-1" />
            重置抽中状态
          </button>
          <button
            @click="clearParticipants"
            class="btn btn-error"
          >
            <Icon icon="mdi:delete-sweep" class="w-4 h-4 mr-1" />
            清空参与者
          </button>
        </div>

        <!-- 导入Excel弹窗 -->
        <div class="modal" :class="{ 'modal-open': showImportModal }">
          <div class="modal-box max-w-2xl">
            <h3 class="font-bold text-xl mb-4">导入Excel流程</h3>

            <!-- 流程说明 -->
            <div class="space-y-4 mb-6">
              <div class="flex gap-3 items-start">
                <div class="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
                <div class="flex-1">
                  <h4 class="font-semibold mb-1">下载导入模板</h4>
                  <p class="text-sm text-base-content/80 mb-2">点击下方按钮，获取标准格式的Excel模板文件</p>
                  <button
                    @click="downloadTemplate"
                    class="btn btn-outline btn-primary btn-sm"
                  >
                    下载模板
                  </button>
                </div>
              </div>
              <div class="flex gap-3 items-start">
                <div class="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
                <div class="flex-1">
                  <h4 class="font-semibold mb-1">填写Excel文件</h4>
                  <p class="text-sm text-base-content/80">按照模板格式填写参与者信息，确保列名和格式与模板一致</p>
                </div>
              </div>
              <div class="flex gap-3 items-start">
                <div class="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
                <div class="flex-1">
                  <h4 class="font-semibold mb-1">上传Excel文件</h4>
                  <p class="text-sm text-base-content/80">选择填写好的Excel文件进行上传导入</p>
                </div>
              </div>
            </div>

            <!-- 文件上传 -->
            <div class="form-control mb-6">
              <input
                type="file"
                accept=".xlsx,.xls"
                @change="handleFileUpload"
                :disabled="isLoading"
                class="file-input file-input-bordered w-full"
              >
              <label class="label">
                <span class="label-text-alt">支持.xlsx和.xls格式文件</span>
              </label>
            </div>

            <div class="modal-action">
              <button class="btn" @click="showImportModal = false">关闭</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useLotteryStore, type Participant } from '@/stores/lottery'
import { confirm } from '@/services/confirmService'
import { edit } from '@/services/editService'
import ParticipantForm from '@/components/ParticipantForm.vue'
import { useDialog } from '@/services/dialogService'
import { Icon } from '@iconify/vue'

const store = useLotteryStore()
const randomCount = ref(100)
const searchQuery = ref('')
const isLoading = ref(false)

// 导入弹窗状态
const showImportModal = ref(false)

// 分页设置
const itemsPerPage = ref(20)
const currentPage = ref(1)

const isWinner = (pid: string) => {
  return store.winnerRecords.some(record => record.pid === pid)
}

// 搜索功能
const filteredParticipants = computed(() => {
  if (!searchQuery.value) return store.allParticipants

  const query = searchQuery.value.toLowerCase()
  return store.allParticipants.filter(participant =>
    participant.name?.toLowerCase().includes(query) ||
    participant.seatNumber?.toLowerCase().includes(query) ||
    participant.notes?.toLowerCase().includes(query)
  )
})

// 分页功能
const paginatedParticipants = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredParticipants.value.slice(start, end)
})

// 总页数
const totalPages = computed(() => {
  return Math.ceil(filteredParticipants.value.length / itemsPerPage.value)
})

watch(() => store.winnerRecords, () => {
  // 强制重新渲染表格
}, { deep: true })

const handleFileUpload = async (e: Event) => {
  const input = e.target as HTMLInputElement
  if (input.files?.length) {
    isLoading.value = true
    try {
      const result = await store.loadParticipantsFromExcel(input.files[0])
      if (result.success) {
        const { showDialog } = useDialog()
        await showDialog({
          message: result.message,
          type: 'success'
        })
        showImportModal.value = false // 导入成功后关闭弹窗
      } else {
        const { showDialog } = useDialog()
        await showDialog({
          message: `导入失败: ${result.message}`,
          type: 'error'
        })
      }
    } catch (error: any) {
      const { showDialog } = useDialog()
      await showDialog({
        message: `导入失败: ${error.message}`,
        type: 'error'
      })
    } finally {
      isLoading.value = false
      input.value = '' // 重置文件输入
    }
  }
}

const generateRandom = () => {
  store.generateParticipants(randomCount.value)
}

const openEditModal = async (participant: Participant) => {
  const result = await edit<Participant>({
    title: '编辑参与者',
    formComponent: ParticipantForm,
    formProps: {}
  }, { ...participant })

  if (result) {
    store.updateParticipant(result.pid, result)
  }
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

// 下载导入模板
const downloadTemplate = () => {
  // 创建下载链接并触发下载
  const link = document.createElement('a')
  link.href = '/template/participants_template.xlsx'
  link.download = 'participants_template.xlsx'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>
