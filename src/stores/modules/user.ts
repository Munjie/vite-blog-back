
import { defineStore } from 'pinia'
import router from '../../router'
import type { Menus } from '../../types/menu.ts';

interface AllDataState {
    isCollapse: boolean
    username: string
    avatar: string
    userid: number
    token: string
    menus: Menus[]
    currentMenu: any
    permissions: any[]
    currentPagePath: string
    locale: string
    expireAt: number | null
}

// 初始化状态函数
function stateIni(): AllDataState {
    return {
        isCollapse: false,
        username: '',
        avatar: '',
        userid: 0,
        token: '',
        menus: [],
        currentMenu: null,
        permissions: [],
        currentPagePath: '/',
        locale: 'en',
        expireAt: null,
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
        // 登出方法
        logout() {
            this.resetStore()
            router.push({ name: 'login' })
        },
        getExpireToken() {
            if (!this.token) return ''
            if (this.expireAt && Date.now() > this.expireAt) {
                this.resetStore()
                return ''
            }
            return this.token
        },
        setExpire(expireIn?: number) {
            if (expireIn) {
                // 保存过期时间戳（毫秒）
                this.expireAt = new Date().getTime() + expireIn * 1000
            }
        },
    },
    // Persist 配置
    persist: {
        key: 'user-store',
        storage: localStorage,
        pick: ['token','menus', 'username', 'userid','avatar']
    }
})
