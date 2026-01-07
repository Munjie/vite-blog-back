import { createRouter, createWebHashHistory } from 'vue-router'
import { routes } from './routes'
//创建路由器
const router = createRouter({
    //路由模式根据需求选择
    history: createWebHashHistory(),
    routes: routes,
})

router.beforeEach((to, _from, next) => {
    if (to.path === '/article-list') {
        next();
    } else {
        next();  // 允许跳转
    }
});

export default router