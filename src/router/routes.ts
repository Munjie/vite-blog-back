

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
                meta: {
                    title: '首页',
                    permiss: '13',
                }

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
            {
                path: '/task-list',
                name: 'task-list',
                meta: {
                    title: '任务列表',
                    permiss: '13',
                },
                component: () => import('@/views/task/task-list.vue'),
            },
            {
                path: '/task-add',
                name: 'task-add',
                meta: {
                    title: '新增任务',
                    permiss: '13',
                },
                component: () => import('@/views/task/task-add.vue'),
            },
            {
                path: '/score-list',
                name: 'score-list',
                meta: {
                    title: '成绩列表',
                    permiss: '13',
                },
                component: () => import('@/views/student/score-list.vue'),
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