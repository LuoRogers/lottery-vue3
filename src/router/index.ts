import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'
import ParticipantManager from '@/views/ParticipantManager.vue'
import PrizeManager from '@/views/PrizeManager.vue'
import LotteryDraw from '@/views/LotteryDraw.vue'
import WinnerList from '@/views/WinnerList.vue'
import Settings from '@/views/Settings.vue'

const routes = [
  {
    path: '/participants',
    name: 'Participants',
    component: ParticipantManager
  },
  {
    path: '/prizes',
    name: 'Prizes',
    component: PrizeManager
  },
  {
    path: '/draw',
    name: 'Draw',
    component: LotteryDraw
  },
  {
    path: '/winners',
    name: 'Winners',
    component: WinnerList
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings
  },
  {
    path: '/',
    redirect: '/draw'
  }
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes
})

export default router
