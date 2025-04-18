<script setup lang="ts">
import { useLotteryStore } from '@/stores/lottery'
import { confirm } from '@/services/confirmService'

const store = useLotteryStore()

const confirmClear = async () => {
  const confirmed = await confirm({
    title: '确认清空记录',
    message: '确定要清空所有中奖记录吗？此操作不可撤销！'
  })
  if (confirmed) {
    store.clearWinners()
  }
}
</script>

<template>
  <div class="p-4">
    <div class="card bg-base-200 shadow-xl">
      <div class="card-body">
        <h2 class="card-title">中奖记录</h2>
        
        <div class="flex justify-end mb-4">
          <button 
            @click="confirmClear"
            class="btn btn-error"
            :disabled="store.winnerRecords.length === 0"
          >
            清空记录
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="table table-zebra">
            <thead>
              <tr>
                <th>奖品名称</th>
                <th>参与者ID</th>
                <th>参与者昵称</th>
                <th>抽奖轮次</th>
                <th>抽奖时间</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="record in store.winnerRecords" :key="`${record.pid}-${record.draw_time}`">
                <td>{{ record.prize_name }}</td>
                <td>{{ record.pid }}</td>
                <td>{{ record.pname || '匿名' }}</td>
                <td>{{ record.round_num }}</td>
                <td>{{ new Date(record.draw_time).toLocaleString() }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
