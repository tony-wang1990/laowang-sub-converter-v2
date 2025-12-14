
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

// 懒加载路由组件
const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        name: 'Dashboard',
        component: () => import('../views/Dashboard.vue')
    },
    {
        path: '/old-home',
        name: 'OldHome',
        component: () => import('../views/Home.vue')
    },
    {
        path: '/converter',
        name: 'Converter',
        component: () => import('../views/Converter.vue')
    },
    {
        path: '/shortlink',
        name: 'ShortLink',
        component: () => import('../views/ShortLink.vue')
    },
    {
        path: '/about',
        name: 'About',
        component: () => import('../views/About.vue')
    }
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
})

export default router
