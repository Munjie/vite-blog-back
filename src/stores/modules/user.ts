
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
    avatar: string
    userid: number
    token: string
    menuData: MenuItem[]
    menus: Menus[]
    tabs: TabItem[]
    currentMenu: any
    permissions: any[]
    currentPagePath: string
    locale: string
}

// 初始化状态函数
function stateIni(): AllDataState {
    return {
        isCollapse: false,
        username: '',
        avatar: '',
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

export const useUserStore = defineStore('useAllData', {
    // 定义状态
    state: stateIni,
    // 定义 getters
    getters: {
        getUsername: (state) => state.username,
        getAvatar: (state) => state.avatar,
        getUserid: (state) => state.userid,
        getToken: (state) => state.token,
        getMenus: (state) => state.menus,
        getPermissions: (state) => state.permissions,
        getLocale: (state) => state.locale,
        getCurrentPagePath: (state) => state.currentPagePath,
        getTabsData: (state) => state.tabs,
        // isCollapse: (state) => state.isCollapse,
    },
    // 定义 actions
    actions: {
        // 设置用户名
        setUsername(username: string) {
            this.username = username
        },
        setAvatar(avatar: string) {
            this.avatar = avatar
        },
        // 设置 userid
        setUserid(userid: number) {
            this.userid = userid
        },
        // 设置 token
        setToken(token: string) {
            this.token = token
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
            localStorage.removeItem('user-store')
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
    // Persist 配置
    persist: {
        key: 'user-store',
        storage: localStorage,
        pick: ['token', 'menuData','menus', 'username', 'userid']
    }
})
