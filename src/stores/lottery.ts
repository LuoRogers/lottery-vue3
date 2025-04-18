import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as XLSX from 'xlsx'
import { useDialog } from '@/services/dialogService'

interface Participant {
  pid: string
  name?: string
  seatNumber?: string
  notes?: string
}

interface Prize {
  pid: string
  name: string
  quantity: number
  image?: string
  description?: string
}

export interface WinnerRecord {
  prize_name: string
  pid: string
  pname?: string
  round_num: number
  draw_time: string
  seat_number?: string
}

interface AppData {
  participants: Participant[]
  prizes: Prize[]
  winners: WinnerRecord[]
  drawRound: number
}

export const useLotteryStore = defineStore('lottery', () => {
  // 状态
  const allParticipants = ref<Participant[]>([])
  const currentPool = ref<Participant[]>([])
  const allPrizes = ref<Prize[]>([])
  const winnerRecords = ref<WinnerRecord[]>([])
  const drawRound = ref(0)
  const allowDuplicateWinners = ref(false)

  // 参与者管理
  const loadParticipantsFromExcel = async (file: File) => {
    try {
      // 验证文件类型
      if (!file.name.match(/\.(xlsx|xls)$/i)) {
        throw new Error('请上传有效的Excel文件(.xlsx或.xls)')
      }

      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data)
      
      // 检查是否有工作表
      if (workbook.SheetNames.length === 0) {
        throw new Error('Excel文件中没有工作表')
      }

      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(sheet)
      
      // 检查是否有数据
      if (jsonData.length === 0) {
        throw new Error('Excel工作表中没有数据')
      }

      // 检查必要列是否存在
      const firstRow = jsonData[0]
      if (!('序号' in firstRow)) {
        throw new Error('Excel文件中缺少"序号"列')
      }

      const tempList: Participant[] = []
      jsonData.forEach(row => {
        const pid = String(row['序号'] ?? '').trim()
        const pname = String(row['参与者昵称'] ?? '').trim()
        const seatNumber = String(row['座位号'] ?? '').trim()
        const notes = String(row['备注'] ?? '').trim()
        if (pid) {
          tempList.push({ 
            pid, 
            name: pname || undefined,
            seatNumber: seatNumber || undefined,
            notes: notes || undefined
          })
        }
      })

      if (tempList.length === 0) {
        throw new Error('没有有效的参与者数据')
      }

      allParticipants.value = tempList
      currentPool.value = [...tempList]
      return { success: true, message: `成功导入${tempList.length}条参与者数据` }
    } catch (error) {
      const { showDialog } = useDialog()
      const errorMessage = error instanceof Error ? error.message : '导入Excel文件失败'
      await showDialog({
        message: `导入失败: ${errorMessage}`,
        type: 'error'
      })
      return { 
        success: false, 
        message: errorMessage
      }
    }
  }

  const generateParticipants = (totalNum: number) => {
    allParticipants.value = Array.from({ length: totalNum }, (_, i) => ({
      pid: String(i + 1),
      seatNumber: `${Math.floor(Math.random() * 20) + 1}排${Math.floor(Math.random() * 20) + 1}座`
    }))
    currentPool.value = [...allParticipants.value]
  }

  const updateParticipant = (pid: string, updates: Partial<Participant>) => {
    const index = allParticipants.value.findIndex(p => p.pid === pid)
    if (index >= 0) {
      allParticipants.value[index] = { ...allParticipants.value[index], ...updates }
      // 同步更新currentPool
      const poolIndex = currentPool.value.findIndex(p => p.pid === pid)
      if (poolIndex >= 0) {
        currentPool.value[poolIndex] = { ...currentPool.value[poolIndex], ...updates }
      }
    }
  }

  const removeParticipant = (pid: string) => {
    allParticipants.value = allParticipants.value.filter(p => p.pid !== pid)
    currentPool.value = currentPool.value.filter(p => p.pid !== pid)
  }

  const clearWinners = () => {
    winnerRecords.value = []
  }

  const resetAllParticipantsStatus = () => {
    winnerRecords.value = []
    currentPool.value = [...allParticipants.value]
  }

  // 奖品管理
  const addPrize = (prize: Omit<Prize, 'pid'>) => {
    const pid = Date.now().toString()
    allPrizes.value.push({
      pid,
      ...prize
    })
  }

  const updatePrize = (pid: string, updates: Partial<Omit<Prize, 'pid'>>) => {
    const index = allPrizes.value.findIndex(p => p.pid === pid)
    if (index >= 0) {
      allPrizes.value[index] = { ...allPrizes.value[index], ...updates }
    }
  }

  const removePrize = (pid: string) => {
    allPrizes.value = allPrizes.value.filter(p => p.pid !== pid)
  }

  // 抽奖逻辑
  const drawWinners = (prizeName: string, drawCount: number) => {
    const prize = allPrizes.value.find(p => p.name === prizeName)
    if (!prize || prize.quantity <= 0) return []

    const actualQty = Math.min(drawCount, prize.quantity, currentPool.value.length)
    if (actualQty <= 0) return []

    // 随机抽取参与者
    const winners: Participant[] = []
    for (let i = 0; i < actualQty; i++) {
      const randomIndex = Math.floor(Math.random() * currentPool.value.length)
      winners.push(currentPool.value[randomIndex])
      if (!allowDuplicateWinners.value) {
        currentPool.value.splice(randomIndex, 1)
      }
    }

    // 更新奖品数量
    prize.quantity -= actualQty

    // 记录中奖者
    const now = new Date().toISOString()
    const newRecords = winners.map(winner => ({
      prize_name: prizeName,
      pid: winner.pid,
      pname: winner.name,
      round_num: drawRound.value + 1,
      draw_time: now,
      seat_number: winner.seatNumber
    }))
    winnerRecords.value.push(...newRecords)
    drawRound.value++

    return newRecords
  }

  // 导出功能
  const exportWinnersToCSV = () => {
    if (winnerRecords.value.length === 0) return false
    
    const headers = ['奖品名称', '参与者ID', '参与者昵称', '座位号', '抽奖轮次', '抽奖时间']
    const data = winnerRecords.value.map(record => [
      record.prize_name,
      record.pid,
      record.pname || '',
      record.seat_number || '',
      record.round_num,
      record.draw_time
    ])
    
    const csvContent = [
      headers.join(','),
      ...data.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `抽奖结果_${new Date().toISOString().slice(0,10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    return true
  }

  // 导出所有数据
  const exportAllData = () => {
    const data: AppData = {
      participants: allParticipants.value,
      prizes: allPrizes.value,
      winners: winnerRecords.value,
      drawRound: drawRound.value
    }

    const jsonStr = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `抽奖系统数据备份_${new Date().toISOString().slice(0,10)}.json`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // 导入所有数据
  const importAllData = async (file: File) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string) as AppData
          
          if (!data.participants || !data.prizes || !data.winners) {
            throw new Error('无效的数据格式')
          }

          allParticipants.value = data.participants
          currentPool.value = [...data.participants]
          allPrizes.value = data.prizes
          winnerRecords.value = data.winners
          drawRound.value = data.drawRound || 0
          
          resolve()
        } catch (err) {
          reject(err)
        }
      }
      reader.onerror = () => reject(new Error('文件读取失败'))
      reader.readAsText(file)
    })
  }

  return {
    allParticipants,
    currentPool,
    allPrizes,
    winnerRecords,
    drawRound,
    allowDuplicateWinners,
    loadParticipantsFromExcel,
    generateParticipants,
    updateParticipant,
    removeParticipant,
    clearWinners,
    addPrize,
    updatePrize,
    removePrize,
    drawWinners,
    exportWinnersToCSV,
    saveWinners: exportWinnersToCSV,
    exportAllData,
    importAllData,
    resetAllParticipantsStatus
  }
}, {
  persist: {
    key: 'lottery-store',
    storage: localStorage
  }
})
