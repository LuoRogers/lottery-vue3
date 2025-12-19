<script setup lang="ts">
import { useLotteryStore, type Prize } from '@/stores/lottery'
import { confirm } from '@/services/confirmService'
import { edit } from '@/services/editService'
import PrizeForm from '@/components/PrizeForm.vue'
import { Icon } from '@iconify/vue'

const store = useLotteryStore()

const openAddModal = async () => {
  // 这里不需要传递pid，因为后端会生成
  const result = await edit<Omit<Prize, 'pid'>>({
    title: '添加奖品',
    formComponent: PrizeForm,
    formProps: {}
  }, {
    name: '',
    quantity: 1,
    image: '',
    description: ''
  })

  if (result && result.name) {
    store.addPrize(result as Prize)
  }
}

const openEditModal = async (prize: Prize) => {
  const result = await edit<Prize>({
    title: '编辑奖品',
    formComponent: PrizeForm,
    formProps: {}
  }, { ...prize })

  if (result) {
    store.updatePrize(prize.pid, result)
  }
}

const removePrize = async (pid: string) => {
  const confirmed = await confirm({
    title: '确认删除',
    message: '确定要删除此奖品吗？',
    confirmText: '删除',
    cancelText: '取消'
  })
  if (confirmed) {
    store.removePrize(pid)
  }
}

const clearPrizes = async () => {
  const confirmed = await confirm({
    title: '确认清空',
    message: '确定要清空所有奖品吗？此操作不可撤销！',
    confirmText: '清空',
    cancelText: '取消'
  })
  if (confirmed) {
    store.allPrizes = []
  }
}
</script>

<template>
  <div class="p-4">
    <div class="card bg-base-200 shadow-xl">
      <div class="card-body">
        <h2 class="card-title">奖品管理</h2>
        
        <div class="flex justify-end mb-6">
          <button
            @click="openAddModal"
            class="btn btn-primary"
          >
            <Icon icon="mdi:plus" class="w-4 h-4 mr-2" />
            添加奖品
          </button>
        </div>

        <div class="overflow-x-auto mt-4">
          <table class="table table-zebra">
            <thead>
              <tr>
                <th>ID</th>
                <th>奖品名称</th>
                <th>数量</th>
                <th>图片</th>
                <th>描述</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in store.allPrizes" :key="p.pid">
                <td>{{ p.pid }}</td>
                <td>{{ p.name }}</td>
                <td>{{ p.quantity }}</td>
                <td>
                  <img 
                    v-if="p.image" 
                    :src="p.image" 
                    class="w-16 h-16 object-cover"
                  >
                  <span v-else>-</span>
                </td>
                <td>{{ p.description || '-' }}</td>
                <td class="flex gap-2">
                  <button
                    @click="openEditModal(p)"
                    class="btn btn-sm btn-info"
                  >
                    <Icon icon="mdi:pencil-outline" class="w-4 h-4 mr-1" />
                    编辑
                  </button>
                  <button
                    @click="removePrize(p.pid)"
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

        <div class="flex justify-end mt-4">
          <button
            @click="clearPrizes"
            class="btn btn-error"
          >
            <Icon icon="mdi:delete-sweep" class="w-4 h-4 mr-2" />
            清空奖品
          </button>
        </div>
      </div>
    </div>

  </div>
</template>
