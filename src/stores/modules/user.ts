// src/stores/user.ts
import { defineStore } from 'pinia'
import {ref, computed} from 'vue'
import router from '../../router'
import type {Component} from 'vue';
import type { UserInfo, MenuItem, Permission,tabs } from '../../types/user.ts' // 调整路径

type Modules = Record<string, () => Promise<{ default: Component }>>;
export const useUserStore = defineStore('user', () => {
        // State
        const userInfo = ref<UserInfo | null>(null)
        const menuList = ref<MenuItem[]>([])
        const tabsList = ref<tabs[]>([])
        const permissions = ref<Permission[]>([])
        const isLoggedIn = computed(() => !!userInfo.value)
        const isCollapse = false;
        // Getters
        const hasPermission = (permissionName: string) => {
            return computed(() => permissions.value.some(p => p.name === permissionName))
        }
        const getUsername = computed(() => userInfo.value?.username || '')
        const getUserId = computed(() => userInfo.value?.id || '')
        const getMenuData = computed(() => menuList.value)
        const getTabs = computed(() => tabsList.value)
        // Actions
        const logout = async () => {
            userInfo.value = null
            menuList.value = []
            permissions.value = []
            // 可添加清除 token 等逻辑
            // router.push('/login') // 跳转登录页
        }

        const setUsername = (newUsername: string) => {
            if (userInfo.value) {
                userInfo.value.username = newUsername // 响应式更新
                console.log('用户名已更新为:', newUsername)
                // 可选：调用后端 API 更新用户名，如 updateUser(newUsername)
            } else {
                console.warn('用户未登录，无法设置用户名')
            }
        }

        const setUserId = () => {
                // userInfo.value.id = newId

        }

        // setMenuData：传入菜单数据（MenuItem[] 类型），直接设置并可选过滤
       /* const setMenuData = (newMenuData: MenuItem[]) => {
            addRouter(newMenuData)
            menuList.value = newMenuData
        }*/

        const setMenuData =(menuData: any) => {
            addRouter(menuData)
            menuList.value = menuData

        }

        const setTabsData = (val: any) => {
            console.log('val', val)
            if (val.name === 'home') {

            } else {
                let index = tabsList.value.findIndex((item: any) => item.index === val.index)
                console.log(index)
                if (index === -1) {
                    tabsList.value.push(val)
                }
                console.log('tabs:', tabsList.value)
            }
        }

        // 初始化：如在 App.vue 中调用 fetchMenu 等（如果已登录）
        return {
            userInfo,
            menuList,
            permissions,
            isLoggedIn,
            hasPermission,
            getMenuData,
            getUsername,
            getUserId,
            getTabs,
            logout,
            setMenuData,
            setTabsData,
            setUsername,
            setUserId,
            isCollapse

        }
    },
    {
        persist: {
            key: 'user-store',
            storage: localStorage,
        },
    }
)



function addRouter(menuData: any) {
    const routerList = router.getRoutes()
    const modules: Modules = import.meta.glob('../views/**/*.vue') as Modules;
    const routerArr: Array<any> = [];
    menuData.forEach((item: any) => {
        if (item.children) {
            item.children.forEach((child: any) => {
                const componentPath = `../${child.path}.vue`;
                const module = modules[componentPath];
                if (module) {
                    child.component = module;
                    routerArr.push(child)
                }
            });
        } else {
            const componentPath = `../${item.path}.vue`;
            const module = modules[componentPath];
            if (module) {
                item.component = module;
                routerArr.push(item)
            }

        }
    });
    // 增加删除路由
    routerList.forEach((item: any) => {
        if (item.name === 'main'
            || item.name === 'home'
            || item.name === '404'
            || item.name === 'login'
            || item.name === 'error'
            || item.name === 'undefined'
            || item.path === '/'
            || item.path === '/main')
            return
        router.removeRoute(item.name)
    });

    routerArr.forEach((item: any) => {
        router.addRoute('main',
            {
                path: item.index,
                name: item.label,
                component: item.component,
            });

    })
    const routerListLast = router.getRoutes()
    console.log(routerListLast)

}

export function ReloadData() {
    const store = useUserStore();
    const menuData = store.getMenuData;
    addRouter(menuData);
}
