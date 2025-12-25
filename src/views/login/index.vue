<template>
    <div class="login-bg">
        <div class="login-container">
            <div class="login-header">
                <img class="logo mr10" src="../../assets/img/login-index.svg" alt=""/>
                <div class="login-title">JCloud System</div>
            </div>

            <div class="qr-login-box">
                <div class="qr-code-wrapper">
                    <img v-if="qrImg" :src="qrImg" alt="小程序码" class="qr-img"/>
                    <div v-else class="loading">
                        <el-icon class="is-loading">
                            <Loading/>
                        </el-icon>
                        <span>加载中...</span>
                    </div>
                </div>

                <p class="qr-tip">
                     <span class="wechat-icon"></span> 扫一扫或长按识别登录
                </p>

                <el-button type="text" @click="refreshQr" style="margin-top: 15px;">
                   点击刷新
                </el-button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import {ref, onMounted, onUnmounted} from 'vue'
import {useRouter} from 'vue-router'
import axios from 'axios'
import {ElMessage, ElIcon} from 'element-plus'
import {Loading} from '@element-plus/icons-vue'

import {useUserStore} from '../../stores'
import {usePermissStore} from '../../stores/permiss'
import {useTabsStore} from '../../stores/tabs'
import {getUserMenu} from '../../api/menu.ts'
import type {Menus} from '../../types/menu.ts'

const router = useRouter()
const userStore = useUserStore()
const permissStore = usePermissStore()
const tabsStore = useTabsStore()

const qrImg = ref<string>('')
const scene = ref<string>('')
let ws: WebSocket | null = null
let currentObjectUrl = ''

const loadQrCode = async () => {
    try {
        const response = await axios.get('/api/wechat/qr', {responseType: 'blob'})
        scene.value = response.headers['x-scene'] || response.headers['X-Scene']

        if (!scene.value) {
            ElMessage.error('获取二维码失败')
            return
        }

        if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl)
        currentObjectUrl = URL.createObjectURL(response.data)
        qrImg.value = currentObjectUrl

        connectWebSocket()
    } catch (err) {
        ElMessage.error('加载二维码失败，请刷新页面')
    }
}
const isDevelopment = import.meta.env.MODE === 'development'
const connectWebSocket = () => {
    if (!scene.value) return
    if (ws) ws.close()
    let backendHost = 'localhost:8090'
    if (!isDevelopment) {
        backendHost = "www.munjie.com"
    }
    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//${backendHost}/ws/qrlogin?scene=${scene.value}`
    console.log('WebSocket 连接地址:', wsUrl)
    ws = new WebSocket(wsUrl)
    ws.onopen = () => console.log('WebSocket 连接成功！')
    ws.onerror = (e) => console.error('WebSocket 错误', e)
    ws.onclose = () => console.log('WebSocket 已关闭')
    ws.onmessage = (event) => {
        const msg = event.data
        console.log('收到后端推送:', msg)
        if (msg.startsWith('SUCCESS|')) {
            const parts = msg.split('|')
            const token = parts[1]
            const userId = Number(parts[2])
            const username = parts[3]
            performLogin(token, userId, username)
        }
    }
}

const performLogin = async (token: string, userId: number, username: string) => {
    localStorage.setItem('vuems_name', username)
    userStore.setUsername(username)
    userStore.setUserid(userId)
    userStore.setToken(token)

    const keys = permissStore.defaultList[username.includes('admin') ? 'admin' : 'user']
    permissStore.handleSet(keys || [])

    const menus: Menus[] = await getUserMenu(userId)
    userStore.setMenus(menus)

    tabsStore.clearTabs()
    ElMessage.success('登录成功！')
    await router.push('/main')
}

const refreshQr = () => {
    if (ws) {
        ws.close()
        ws = null
    }
    loadQrCode()
}

onMounted(() => loadQrCode())
onUnmounted(() => {
    if (ws) ws.close()
    if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl)
})
</script>

<style scoped>
/* 与之前相同，保持美观样式 */
.login-bg {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100vh;
    background: url(../../assets/img/bg_login.jpg) center/cover no-repeat;
}

.login-header {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 40px;
}

.logo {
    width: 35px;
}

.login-title {
    font-size: 22px;
    color: #333;
    font-weight: bold;
}

.login-container {
    width: 450px;
    border-radius: 5px;
    background: #fff;
    padding: 40px 50px 50px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.qr-login-box {
    text-align: center;
}

.qr-code-wrapper {
    width: 260px;
    height: 260px;
    margin: 0 auto 20px;
    padding: 10px;
    background: #fff;
    border: 1px solid #ebeef5;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.qr-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #999;
}

.qr-tip {
    margin: 20px 0 10px;
    color: #666;
    font-size: 14px;
}

.wechat-icon {
    display: inline-block;
    width: 20px;
    height: 20px;
    background: url('https://res.wx.qq.com/a/wx_fed/assets/res/NTI4MWU5.ico') no-repeat center/cover;
    vertical-align: middle;
    margin: 0 4px;
}
</style>