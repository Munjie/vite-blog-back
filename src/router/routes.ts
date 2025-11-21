

//定义路由规则
export const routes = [
    {
        path: '/',
        name: 'main',
        component: () => import('@/views/main/index.vue'),
        redirect: { name: 'login' },
        children: [
            {
                path: 'home',
                name: 'home',
                component: () => import('@/views/home/index.vue'),
                meta: {}

            }
        ],
    },
    {
        path: '/login',
        name: 'login',
        component: () => import('@/views/login/index.vue'),
    },
    {
        path: '/main',
        redirect: { name: 'home' },
    },
];