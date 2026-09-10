

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
                component: () => import('@/views/home/welcome.vue'),
                meta: {
                    title: '首页'
                }

            },
            {
                path: '/system-menu',
                name: 'system-menu',
                meta: {
                    title: '菜单管理'
                },
                component: () => import('@/views/system/menu.vue'),
            },
            {
                path: '/task-index',
                name: 'task-index',
                meta: {
                    title: '数据汇总'
                },
                component: () => import('@/views/task/index.vue'),
            },
            {
                path: '/task-list',
                name: 'task-list',
                meta: {
                    title: '任务列表'
                },
                component: () => import('@/views/task/task-list.vue'),
            },
            {
                path: '/task-add',
                name: 'task-add',
                meta: {
                    title: '新增任务'
                },
                component: () => import('@/views/task/task-add.vue'),
            },
            {
                path: '/score-list',
                name: 'score-list',
                meta: {
                    title: '成绩列表'
                },
                component: () => import('@/views/student/score-list.vue'),
            },
            {
                path: '/article-dashboard',
                name: '/article-dashboard',
                meta: {
                    title: '数据汇总',
                },
                component: () => import('@/views/article/dashboard.vue'),
            },
            {
                path: '/article-edit',
                name: '/article-edit',
                meta: {
                    title: '文章编辑',
                },
                component: () => import('@/views/article/article-editor.vue'),
            },
            {
                path: '/article-view',
                name: '/article-view',
                meta: {
                    title: '文章详情'
                },
                component: () => import('@/views/article/article-view.vue'),
            },
              {
                path: '/article-list',
                name: '/article-list',
                meta: {
                    title: '文章列表'
                },
                component: () => import('@/views/article/article-list.vue'),
            },

            {
                path: '/comment-list',
                name: '/comment-list',
                meta: {
                    title: '评论列表'
                },
                component: () => import('@/views/comment/comment-list.vue'),
            },

            {
                path: '/menu-list',
                name: '/menu-list',
                meta: {
                    title: '菜单列表'
                },
                component: () => import('@/views/menu/index.vue'),
            },

            {
                path: '/role-list',
                name: '/role-list',
                meta: {
                    title: '角色列表'
                },
                component: () => import('@/views/role/index.vue'),
            },

            {
                path: '/user-list',
                name: '/user-list',
                meta: {
                    title: '用户列表'
                },
                component: () => import('@/views/user/index.vue'),
            },

            {
                path: '/lets-list',
                name: '/lets-list',
                meta: {
                    title: '证书列表'
                },
                component: () => import('@/views/lets/lets-list.vue'),
            },


            {
                path: '/cert-list',
                name: '/cert-list',
                meta: {
                    title: '我的证书'
                },
                component: () => import('@/views/lets/cert-list.vue'),
            },
            {
                path: '/lets-add',
                name: 'lets-add',
                meta: {
                    title: '新增证书'
                },
                component: () => import('@/views/lets/lets-add.vue'),
            },
            {
                path: '/lets-deploy',
                name: 'lets-deploy',
                meta: {
                    title: '自动部署'
                },
                component: () => import('@/views/lets/lets-deploy.vue'),
            },
            {
                path: '/template-manage',
                name: 'template-manage',
                meta: {
                    title: '模板管理'
                },
                component: () => import('@/views/notification/TemplateManager.vue'),
            },
            {
                path: '/dig-twin',
                name: 'dig-twin',
                meta: {
                    title: '3D数字'
                },
                component: () => import('@/views/digital-twin/DigitalTwin.vue'),
            },
        ],
    },
    {
        path: '/login',
        name: 'login',
        component: () => import('@/views/login/login.vue'),
    },
    {
        path: '/main',
        redirect: { name: 'home' },
    },
];