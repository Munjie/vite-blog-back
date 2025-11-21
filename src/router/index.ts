import { createRouter, createWebHashHistory } from 'vue-router'
import { routes } from './routes'
//创建路由器
const router = createRouter({
    //路由模式根据需求选择
    history: createWebHashHistory(),
    routes: routes,
})
export default router