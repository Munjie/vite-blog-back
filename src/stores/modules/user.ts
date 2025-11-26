// src/stores/allData.ts
import { defineStore } from 'pinia'
import router from '../../router'
import type { Component } from 'vue'
import type { Menus } from '../../types/menu.ts';

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
    menus: Menus[]
    tabs: TabItem[]
    currentMenu: any // 可优化为 MenuItem | null
    permissions: any[] // 可定义具体 Permission 类型
    currentPagePath: string
    locale: string
}

// 动态模块导入类型
type Modules = Record<string, () => Promise<{ default: Component }>>

// 初始化状态函数
function stateIni(): AllDataState {
    return {
        isCollapse: false,
        username: '',
        userid: 0,
        token: '',
        menuData: [],
        menus: [],
        tabs: [
            {
                path: "/home",
                index: "Home",
                label: "home",
                icon: "home"
            }
        ],
        currentMenu: null,
        permissions: [],
        currentPagePath: '/',
        locale: 'en'
    }
}

// addRouter 函数（保持不变）
function addRouter(menuData: MenuItem[]) {
    const routerList = router.getRoutes()
    const modules: Modules = import.meta.glob('../views/**/*.vue') as Modules
    const routerArr: any[] = []

    menuData.forEach((item) => {
        if (item.children && item.children.length > 0) {
            item.children.forEach((child) => {
                const componentPath = `../${child.path}.vue`
                const module = modules[componentPath as keyof Modules]
                if (module) {
                    child.component = module
                    routerArr.push({
                        path: child.index,
                        name: child.label,
                        component: child.component
                    })
                }
            })
        } else {
            const componentPath = `../${item.path}.vue`
            const module = modules[componentPath as keyof Modules]
            if (module) {
                item.component = module
                routerArr.push({
                    path: item.index,
                    name: item.label,
                    component: item.component
                })
            }
        }
    })

    // 删除动态路由（保留基础路由）
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

    // 添加新路由
    routerArr.forEach((item) => {
        router.addRoute('main', {
            path: item.path,
            name: item.name,
            component: item.component
        })
    })

    const routerListLast = router.getRoutes()
    console.log(routerListLast)
}

export const useUserStore = defineStore('useAllData', {
    // 定义状态
    state: stateIni,
    // 定义 getters
    getters: {
        getUsername: (state) => state.username,
        getUserid: (state) => state.userid,
        getToken: (state) => state.token,
        getMenuData: (state) => state.menuData,
        getMenus: (state) => state.menus,
        getPermissions: (state) => state.permissions,
        getLocale: (state) => state.locale,
        getCurrentPagePath: (state) => state.currentPagePath,
        getTabsData: (state) => state.tabs,
        isCollapse: (state) => state.isCollapse,
    },
    // 定义 actions
    actions: {
        // 设置用户名
        setUsername(username: string) {
            this.username = username
        },
        // 设置 userid
        setUserid(userid: number) {
            this.userid = userid
        },
        // 设置 token
        setToken(token: string) {
            this.token = token
        },
        // 设置菜单数据
        setMenuData(menuData: MenuItem[]) {
            addRouter(menuData)
            this.menuData = menuData
        },
        setMenus(menus: Menus[]) {
            this.menus = menus
        },
        // 权限
        setPermissions(val: any[]) {
            this.permissions = val
        },
        // 当前语言
        setLocale(val: string) {
            this.locale = val
        },
        // 当前页面路径
        setCurrentPagePath(val: string) {
            this.currentPagePath = val
        },
        resetStore() {
            // 重置为初始状态
            Object.assign(this.$state, stateIni())
            localStorage.removeItem('useAllData-store')
        },
        // tabs
        setTabsData(val: any) {
            console.log('val', val)
            if (val.name === 'home') {
                this.currentMenu = null
            } else {
                const index = this.tabs.findIndex((item: any) => item.index === val.index)
                console.log(index)
                if (index === -1) {
                    this.tabs.push(val)
                }
                console.log('tabs:', this.tabs)
            }
        },
        removeTagsData(val: any) {
            const index = this.tabs.findIndex((item: any) => item.index === val.index)
            if (index > -1) {
                this.tabs.splice(index, 1)
            }
        },
        // 登出方法
        logout() {
            this.resetStore()
            router.push({ name: 'login' })
        },
    },
    // Persist 配置（修正：移除 enabled 和 strategies，使用 pick）
    persist: {
        key: 'useAllData-store',
        storage: localStorage,
        pick: ['token', 'menuData','menus', 'username', 'userid'] // 使用 pick 指定持久化字段
    }
})

// ReloadData 函数
export function ReloadData() {
    const store = useUserStore()
    addRouter(store.getMenuData)
}