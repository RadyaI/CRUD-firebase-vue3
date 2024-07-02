import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import perpustakaan from '@/views/perpustakaanView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/perpustakaan',
    component: perpustakaan
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
