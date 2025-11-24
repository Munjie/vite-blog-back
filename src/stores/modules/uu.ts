// src/stores/allData.ts (假设文件路径)
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import router from '../../router' // 调整为实际路径
import type { Component } from 'vue'

// 类型定义
interface TabItem {
    path: string
    index: string
    label: string
    icon: string
}

interface MenuItem {
    path: string
    index: string
    label: string
    icon?: string
    children?: MenuItem[]
    component?: () => Promise<{ default: Component }>
}

interface AllDataState {
    isCollapse: boolean
    username: string
    userid: number
    token: string
    menuData: MenuItem[]
    tabs: TabItem[]
    currentMenu: any // 可优化为 MenuItem | null
    permissions: any[] // 可定义具体 Permission 类型
    currentPagePath: string
    locale: string
}

// 动态模块导入类型
type Modules = Record<string, () => Promise<{ default: Component }>>

// 初始化状态
const initState = (): AllDataState => ({
    isCollapse: false,
    username: '',
    userid: 0,
    token: '',
    menuData: [],
    tabs: [
        {
            path: '/home',
            index: 'Home',
            label: 'home',
            icon: 'home'
        }
    ],
    currentMenu: null,
    permissions: [],
    currentPagePath: '/',
    locale: 'en'
})

export const useAllDataStore = defineStore('useAllData', () => {
    // State
    const state = ref<AllDataState>(initState())

    // Getters
    const getUsername = computed(() => state.value.username)
    const getUserid = computed(() => state.value.userid)
    const getToken = computed(() => state.value.token)
    const getMenuData = computed(() => state.value.menuData)
    const getPermissions = computed(() => state.value.permissions)
    const getLocale = computed(() => state.value.locale)
    const getCurrentPagePath = computed(() => state.value.currentPagePath)
    const getTabsData = computed(() => state.value.tabs)

    // Actions
    const setUsername = (username: string) => {
        state.value.username = username
    }

    const setUserid = (userid: number) => {
        state.value.userid = userid
    }

    const setToken = (token: string) => {
        state.value.token = token
    }

    const setMenuData = (menuData: MenuItem[]) => {
        addRouter(menuData)
        state.value.menuData = menuData
    }

    const setPermissions = (val: any[]) => {
        state.value.permissions = val
    }

    const setLocale = (val: string) => {
        state.value.locale = val
    }

    const setCurrentPagePath = (val: string) => {
        state.value.currentPagePath = val
    }

    const resetStore = () => {
        state.value = initState() // 重置为初始状态
        localStorage.removeItem('useAllData-store')
    }

    const setTabsData = (val: any) => {
        console.log('val', val)
        if (val.name === 'home') {
            state.value.currentMenu = null
        } else {
            const index = state.value.tabs.findIndex((item: any) => item.index === val.index)
            console.log(index)
            if (index === -1) {
                state.value.tabs.push(val)
            }
            console.log('tabs:', state.value.tabs)
        }
    }

    const removeTagsData = (val: any) => {
        const index = state.value.tabs.findIndex((item: any) => item.index === val.index)
        if (index > -1) {
            state.value.tabs.splice(index, 1)
        }
    }

    const logout = async () => {
        resetStore()
        router.push({ name: 'login' })
    }

    return {
        // State (暴露以便直接访问，如果需要)
        ...state.value,

        // Getters
        getUsername,
        getUserid,
        getToken,
        getMenuData,
        getPermissions,
        getLocale,
        getCurrentPagePath,
        getTabsData,

        // Actions
        setUsername,
        setUserid,
        setToken,
        setMenuData,
        setPermissions,
        setLocale,
        setCurrentPagePath,
        resetStore,
        setTabsData,
        removeTagsData,
        logout
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

// ReloadData 函数（修正 TS 类型）
export function ReloadData() {
    const store = useAllDataStore()
    const menuData = store.getMenuData // 使用 getter（computed，无需 .value 在此上下文中）
    addRouter(menuData)
}