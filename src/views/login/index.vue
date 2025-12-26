<template>
    <div class="login-bg">
        <div class="login-container">
            <div class="login-header">
                <img class="logo mr10" src="../../assets/img/login-index.svg" alt=""/>
                <div class="login-title">JCloud System</div>
            </div>

            <div class="qr-login-box">
                <h3 style="text-align: center; margin-bottom: 30px; color: #333;">
                    微信扫码登录
                </h3>

                <!-- 二维码 + 遮罩层容器 -->
                <!-- 二维码 + 遮罩层容器 -->
                <div class="qr-container">
                    <!-- 二维码图片（始终显示） -->
                    <img v-if="qrImg" :src="qrImg" class="qr-img" />

                    <!-- 遮罩层：仅在有状态提示时显示（初始 waiting 时也显示，但透明度低，让二维码清晰可见） -->
                    <div class="qr-overlay" :class="loginStatus">
                        <!-- 等待扫码：半透明，二维码仍可扫描 -->
                        <div v-if="loginStatus === 'waiting'" class="status waiting">
                            <el-icon class="icon"><Scan /></el-icon>
                        </div>

                        <!-- 已扫码待确认：高不透明度 + 绿色对勾 -->
                        <div v-if="loginStatus === 'scanned'" class="status scanned">
                            <el-icon class="icon"><CheckBold /></el-icon>
                            <p>已扫码，请在手机确认</p>
                        </div>

                        <!-- 刷新中 -->
                        <div v-if="loginStatus === 'refreshing'" class="status refreshing">
                            <el-icon class="is-loading icon"><Loading /></el-icon>
                            <p>正在刷新...</p>
                        </div>

                        <!-- 刷新按钮：始终可见 -->
                        <div class="refresh-btn" @click="refreshQr">
                            <el-icon><Refresh /></el-icon>
                        </div>
                    </div>
                </div>
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
let loginStatus = ref<'waiting' | 'scanned' | 'refreshing'>('waiting')  // 新增 refreshing 状态


const refreshQr = () => {
    if (loginStatus.value === 'refreshing') return // 防止重复点击

    loginStatus.value = 'refreshing'

    if (ws) {
        ws.close()
        ws = null
    }

    // 重新加载二维码
    loadQrCode().finally(() => {
        // 加载完成（无论成功失败）恢复等待状态
        setTimeout(() => {
            loginStatus.value = 'waiting'
        }, 800) // 给用户一点加载反馈
    })
}
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
        if (msg === 'SCANNED') {
            loginStatus.value = 'scanned'
        }
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

/*const refreshQr = () => {
    if (ws) {
        ws.close()
        ws = null
    }
    loadQrCode()
}*/

onMounted(() => loadQrCode())
onUnmounted(() => {
    if (ws) ws.close()
    if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl)
})
</script>

<style scoped>
.login-bg {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100vh;
    background: url(../../assets/img/bg_login.jpg) center/cover no-repeat;
}

.login-container {
    width: 450px;
    border-radius: 12px;
    background: #fff;
    padding: 50px 50px 60px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.15);
    text-align: center;
}

.login-header {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 40px;
}

.logo { width: 40px; }
.login-title { font-size: 24px; font-weight: bold; color: #333; }

/* 二维码容器 */
.qr-container {
    position: relative;
    width: 260px;
    height: 260px;
    margin: 0 auto 30px;
    border: 1px solid #ebeef5;
    border-radius: 12px;
    overflow: hidden;
    background: #fff;
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}

.qr-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

/* 遮罩层 */
.qr-overlay {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    pointer-events: none; /* 关键：初始允许点击穿透（刷新按钮除外） */
    transition: background 0.3s ease;
}

/* 等待扫码：浅遮罩，二维码清晰可见，能正常扫描 */
.qr-overlay.waiting {
    background: rgba(255, 255, 255, 0.4);
    pointer-events: none;
}
.qr-overlay.waiting .status {
    color: #999;
}

/* 已扫码：深遮罩，挡住二维码，防止重复扫 */
.qr-overlay.scanned {
    background: rgba(255, 255, 255, 0.95);
    pointer-events: auto; /* 允许点击刷新按钮 */
}
.qr-overlay.scanned .status {
    color: #07c160;
}

/* 刷新中 */
.qr-overlay.refreshing {
    background: rgba(255, 255, 255, 0.8);
    pointer-events: auto;
}
.qr-overlay.refreshing .status {
    color: #409eff;
}

/* 刷新按钮：始终可点击 */
.refresh-btn {
    pointer-events: auto; /* 强制可点击，覆盖父层的 none */
    /* 其余样式不变 */
}



.status {
    color: #666;
    font-size: 16px;
}

.status .icon {
    font-size: 48px;
    margin-bottom: 16px;
}

.status.waiting .icon { color: #999; }
.status.scanned .icon { color: #07c160; animation: pulse 1.5s infinite; }
.status.refreshing .icon { color: #409eff; }

/* 绿色打钩动画 */
@keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
}

/* 刷新按钮：右上角小图标 */
.refresh-btn {
    position: absolute;
    top: 12px;
    right: 12px;
    width: 36px;
    height: 36px;
    background: rgba(0,0,0,0.05);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
}

.refresh-btn:hover {
    background: rgba(0,0,0,0.15);
    transform: rotate(180deg);
}

.refresh-btn .el-icon {
    font-size: 18px;
    color: #666;
}
</style>