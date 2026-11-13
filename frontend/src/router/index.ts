import { createRouter, createWebHistory } from 'vue-router'
import NotesView from '@/views/NotesView.vue'
import LearnView from '@/views/LearnView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  // 新页面从顶部开始；浏览器后退时恢复之前的位置，兼顾手机上的长课程。
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { left: 0, top: 0 }
  },
  routes: [
    { path: '/', name: 'learn', component: LearnView },
    { path: '/notes', name: 'notes', component: NotesView },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

export default router
