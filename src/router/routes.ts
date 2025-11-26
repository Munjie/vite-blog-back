

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

            },
            {
                path: '/system-menu',
                name: 'system-menu',
                meta: {
                    title: '菜单管理',
                    permiss: '13',
                },
                component: () => import('@/views/system/menu.vue'),
            },
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