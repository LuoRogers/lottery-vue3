<script setup lang="ts">
import { ref } from 'vue'
import { useLotteryStore } from '@/stores/lottery'
import { confirm } from '@/services/confirmService'
import { edit } from '@/services/editService'
import PrizeForm from '@/components/PrizeForm.vue'

const store = useLotteryStore()
const newPrize = ref({
  name: '',
  quantity: 1,
  image: '',
  description: ''
})
const editingPrize = ref({
  pid: '',
  name: '',
  quantity: 1,
  image: '',
  description: ''
})

const addPrize = () => {
  if (!newPrize.value.name) return
  store.addPrize({ ...newPrize.value })
  newPrize.value = {
    name: '',
    quantity: 1,
    image: '',
    description: ''
  }
}

const openEditModal = async (prize: any) => {
  const result = await edit({
    title: '编辑奖品',
    formComponent: PrizeForm
  }, {
    name: prize.name,
    quantity: prize.quantity,
    image: prize.image,
    description: prize.description
  })

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
        
        <div class="flex flex-wrap gap-4">
          <div class="form-control flex-1">
            <label class="label">
              <span class="label-text">奖品名称</span>
            </label>
            <input 
              v-model="newPrize.name" 
              class="input input-bordered"
              placeholder="奖品名称"
            >
          </div>
          <div class="form-control flex-1">
            <label class="label">
              <span class="label-text">奖品数量</span>
            </label>
            <input 
              v-model.number="newPrize.quantity" 
              type="number" 
              min="1" 
              class="input input-bordered"
              placeholder="数量"
            >
          </div>
          <div class="form-control flex-1">
            <label class="label">
              <span class="label-text">奖品图片URL</span>
            </label>
            <input 
              v-model="newPrize.image" 
              class="input input-bordered"
              placeholder="图片URL"
            >
          </div>
          <div class="form-control flex-1">
            <label class="label">
              <span class="label-text">奖品描述</span>
            </label>
            <input 
              v-model="newPrize.description" 
              class="input input-bordered"
              placeholder="描述"
            >
          </div>
          <div class="form-control">
            <button 
              @click="addPrize" 
              class="btn btn-primary mt-6"
            >
              添加奖品
            </button>
          </div>
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
                    编辑
                  </button>
                  <button 
                    @click="removePrize(p.pid)"
                    class="btn btn-error btn-sm"
                  >
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
            清空奖品
          </button>
        </div>
      </div>
    </div>

  </div>
</template>
