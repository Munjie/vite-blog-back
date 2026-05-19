<template>
    <div class="login-page">
        <div class="stars-bg"></div>

        <div class="login-card glass-panel">
            <div class="mode-switch" @click="toggleLoginMode">
                <el-tooltip :content="loginMode === 'qr' ? '账号密码登录' : '扫码登录'" placement="left">
                    <div class="switch-icon">
                        <el-icon v-if="loginMode === 'qr'">
                            <Monitor/>
                        </el-icon>
                        <el-icon v-else>
                            <Menu/>
                        </el-icon>
                    </div>
                </el-tooltip>
            </div>

            <div class="login-header">
                <h2>{{ loginMode === 'qr' ? '微信扫码一键登录' : '欢迎回来' }}</h2>
                <p>{{ loginMode === 'qr' ? '安全、便捷、快速' : '使用您的账号密码登录' }}</p>
            </div>

            <div class="login-body">
                <transition name="fade-slide" mode="out-in">
                    <div v-if="loginMode === 'qr'" class="qr-view">
                        <!-- 二维码 + 遮罩层容器 -->
                        <div class="qr-container">
                            <!-- 二维码图片（始终显示） -->
                            <img v-if="qrImg" :src="qrImg" class="qr-img"/>
                            <!-- 遮罩层：仅在有状态提示时显示（初始 waiting 时也显示，但透明度低，让二维码清晰可见） -->
                            <div class="qr-overlay" :class="loginStatus">
                                <!-- 加载中 -->
                                <div v-if="loginStatus === 'loading'" class="status loading">
                                    <el-icon class="is-loading icon">
                                        <Loading/>
                                    </el-icon>
                                    <p>加载中...</p>
                                </div>
                                <!-- 等待扫码：半透明，二维码仍可扫描 -->
                                <div v-if="loginStatus === 'waiting'" class="status waiting">
                                    <el-icon class="icon">
                                        <Scan/>
                                    </el-icon>
                                </div>
                                <!-- 已扫码待确认状态：只显示大绿色打钩 -->
                                <div v-if="loginStatus === 'scanned'" class="status scanned">
                                    <el-icon class="success-icon">
                                        <Check/>
                                    </el-icon>
                                    <p style="margin-top: 20px; font-size: 14px; color: #0e0d0d;">请在手机上确认登录</p>
                                </div>

                                <!-- 刷新中 -->
                                <div v-if="loginStatus === 'refreshing'" class="status refreshing">
                                    <el-icon class="is-loading icon">
                                        <Loading/>
                                    </el-icon>
                                    <p>正在刷新...</p>
                                </div>

                                <!-- 失败 -->
                                <div v-if="loginStatus === 'failed'" class="status failed">
                                    <el-icon class="is-loading icon">
                                        <Loading/>
                                    </el-icon>
                                    <p>获取失败，请刷新</p>
                                </div>

                                <!-- 刷新按钮：始终可见 -->
                                <div class="refresh-btn" @click="refreshQr">
                                    <el-icon>
                                        <Refresh/>
                                    </el-icon>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div v-else class="form-view">
                        <el-form :model="loginForm" label-position="top">
                            <el-form-item label="用户名 / 邮箱">
                                <el-input
                                        v-model="loginForm.username"
                                        placeholder="请输入账号"
                                        prefix-icon="User"
                                />
                            </el-form-item>
                            <el-form-item label="密码">
                                <el-input
                                        v-model="loginForm.password"
                                        type="password"
                                        show-password
                                        placeholder="请输入密码"
                                        prefix-icon="Lock"
                                />
                            </el-form-item>
                            <div class="form-options">
                                <el-checkbox v-model="rememberMe">记住我</el-checkbox>
                                <span class="forgot-pwd">忘记密码？</span>
                            </div>
                            <el-button
                                    type="primary"
                                    class="submit-btn"
                                    :loading="isSubmitting"
                                    @click="handlePwdLogin"
                            >
                                登 录
                            </el-button>
                        </el-form>
                    </div>
                </transition>
            </div>

            <div class="login-footer">
                <p v-if="loginMode === 'pwd'">还没有账号？<!--<span class="link">立即注册</span>--><span class="link"
                                                                                                        @click="loginMode = 'qr'">扫码注册登录</span>
                </p>
                <p v-else @click="loginMode = 'pwd'" class="link-switch">使用账号密码登录</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import {ref, reactive, onMounted, onUnmounted} from 'vue'
import {useRouter} from 'vue-router'
import axios from 'axios'
import {ElMessage, ElIcon} from 'element-plus'
import {Check, Loading, Monitor, Refresh} from '@element-plus/icons-vue'
import {useUserStore} from '../../stores'
import {login} from "../../api/user.ts";
import type {Menus} from "../../types/menu.ts";
import {getUserMenu} from "../../api/menu.ts";
import {useTagsViewStore} from '../../stores/tagsView.ts';

const tagsViewStore = useTagsViewStore();
const router = useRouter()
const userStore = useUserStore()
const qrImg = ref<string>('')
const scene = ref<string>('')
let ws: WebSocket | null = null
let currentObjectUrl = ''
let loginStatus = ref<'loading' | 'waiting' | 'scanned' | 'refreshing' | 'failed'>('loading')
// 状态管理
const loginMode = ref<'qr' | 'pwd'>('qr')
const isSubmitting = ref(false)
const rememberMe = ref(true)
// 账号登录表单
const loginForm = reactive({
    username: '',
    password: ''
})

const toggleLoginMode = () => {
    loginMode.value = loginMode.value === 'qr' ? 'pwd' : 'qr'
    if (loginMode.value === 'qr' && !qrImg.value) {
        loadQrCode()
    }
}

// 密码登录逻辑
const handlePwdLogin = async () => {
    if (!loginForm.username || !loginForm.password) {
        return ElMessage.warning('请填写完整的登录信息')
    }
    isSubmitting.value = true
    try {
        const res = (await login(loginForm)).data;
        await performLogin(res.token, res.userId, res.userName, res.avatar, res.expire)
    } finally {
        isSubmitting.value = false
    }
}

//NEW


const refreshQr = () => {
    if (loginStatus.value === 'loading') return
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
        }, 800)
    })
}
const loadQrCode = async () => {
    loginStatus.value = 'loading'
    try {
        const response = await axios.get('/api/auth/qr', {responseType: 'blob'})
        if (response.status !== 200) {
            ElMessage.error('服务器错误')
            return
        }
        scene.value = response.headers['x-scene'] || response.headers['X-Scene']
        if (!scene.value) {
            ElMessage.error('获取二维码失败，请刷新重新获取')
            loginStatus.value = 'failed'
            return
        }
        if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl)
        currentObjectUrl = URL.createObjectURL(response.data)
        qrImg.value = currentObjectUrl
        loginStatus.value = 'waiting'
        connectWebSocket()
    } catch (err) {
        ElMessage.error('加载二维码失败，请刷新重新获取')
        loginStatus.value = 'failed'
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
            const avatar = parts[4]
            const expire = parts[5]
            performLogin(token, userId, username, avatar, expire)
        }
    }
}

const performLogin = async (token: string, userId: number, username: string, avatar: string, expire: number) => {
    userStore.setUsername(username)
    userStore.setUserid(userId)
    userStore.setToken(token)
    userStore.setAvatar(avatar)
    userStore.setExpire(expire)
    const menus: Menus[] = await getUserMenu(userId)
    userStore.setMenus(menus)
    tagsViewStore.delAllViews(true)
    ElMessage.success('登录成功！')
    await router.push('/main')
}


onMounted(() => loadQrCode())
onUnmounted(() => {
    if (ws) ws.close()
    if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl)
})


</script>

<style scoped lang="scss">
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: url(../../assets/img/bg_login.jpg) center/cover no-repeat;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle at 30% 30%, rgba(99, 102, 241, 0.1) 0%, transparent 40%),
    radial-gradient(circle at 70% 70%, rgba(168, 85, 247, 0.1) 0%, transparent 40%);
    animation: aurora 20s linear infinite;
  }
}


@keyframes aurora {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 玻璃卡片样式 */
.login-card {
  position: relative;
  width: 420px;
  padding: 40px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
  z-index: 10;
  transition: border-color 0.3s;

  &:hover {
    border-color: rgba(117, 118, 161, 0.3);
  }
}

.mode-switch {
  position: absolute;
  top: 0;
  right: 0;
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.05);
  clip-path: polygon(100% 0, 0 0, 100% 100%);
  border-radius: 0 24px 0 0;
  cursor: pointer;
  transition: background 0.3s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .switch-icon {
    position: absolute;
    top: 12px;
    right: 12px;
    color: var(--el-color-primary);
    font-size: 20px;
  }
}

.login-header {
  text-align: center;
  margin-bottom: 35px;

  h2 {
    color: #fff;
    font-size: 26px;
    font-weight: 600;
    margin-bottom: 10px;
  }

  p {
    color: #888;
    font-size: 14px;
  }
}

@keyframes checkPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.08);
  }
}

/* 表单美化 */
:deep(.el-form-item__label) {
  color: #aaa !important;
}

:deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.05) !important;
  box-shadow: none !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  padding: 8px 15px;

  .el-input__inner {
    color: #fff;
  }
}

:deep(.el-input__wrapper.is-focus) {
  border-color: var(--el-color-primary) !important;
  background: rgba(255, 255, 255, 0.08) !important;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  font-size: 13px;

  .forgot-pwd {
    color: #888;
    cursor: pointer;

    &:hover {
      color: #fff;
    }
  }
}

.submit-btn {
  width: 100%;
  padding: 12px;
  font-size: 16px;
  height: auto;
  border-radius: 12px;
}

.login-footer {
  text-align: center;
  margin-top: 30px;
  font-size: 13px;
  color: #666;

  .link, .link-switch {
    color: var(--el-color-primary);
    cursor: pointer;
    margin-left: 5px;
  }
}

/* 动画 */
.fade-slide-enter-active, .fade-slide-leave-active {
  transition: all 0.4s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.status {
  color: #666;
  font-size: 16px;
}

.status .icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.status.waiting .icon {
  color: #999;
}

.status.scanned .icon {
  color: #07c160;
  animation: pulse 1.5s infinite;
}

.status.refreshing .icon {
  color: #409eff;
}

.success-icon {
  color: #67C23A;
  font-size: 160px !important;
  font-weight: bold;
  animation: checkScale 0.8s ease-in-out, checkPulse 2s ease-in-out infinite 0.8s;
}

.qr-overlay.scanned p {
  margin-top: 20px;
  font-size: 14px;
  color: #666;
}

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
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.qr-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* 遮罩层 */
.qr-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none; /* 关键：初始允许点击穿透（刷新按钮除外） */
  transition: background 0.3s ease;
}

/* 加载中状态 */
.qr-overlay.loading {
  background: rgba(255, 255, 255, 0.8);
  pointer-events: auto;
}

.qr-overlay.loading .status {
  color: #409eff;
  text-align: center;
}

/* 等待扫码：浅遮罩，二维码清晰可见，能正常扫描 */
.qr-overlay.waiting {
  background: rgba(255, 255, 255, 0);
  pointer-events: none;
}

.qr-overlay.waiting .status {
  color: #999;
  text-align: center;
}

/* 已扫码状态：超大绿色打钩 */
.qr-overlay.scanned {
  background: rgba(255, 255, 255, 0.7);
  pointer-events: auto;
}

.qr-overlay.scanned .status {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* 加载中状态 */
.qr-overlay.failed {
  background: rgba(255, 255, 255, 0.8);
  pointer-events: auto;
}

.qr-overlay.failed .status {
  color: #d11530;
  text-align: center;
}

@keyframes checkPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.08);
  }
}

.success-icon {
  color: #67C23A;
  font-size: 160px !important;
  font-weight: bold;
  animation: checkScale 0.8s ease-in-out, checkPulse 2s ease-in-out infinite 0.8s;
}


.qr-overlay.scanned p {
  margin-top: 20px;
  font-size: 14px;
  color: #666;
}

/* 刷新中 */
.qr-overlay.refreshing {
  background: rgba(255, 255, 255, 0.8);
  pointer-events: auto;
}

.qr-overlay.refreshing .status {
  color: #409eff;
}

.status {
  color: #666;
  font-size: 16px;
}

.status .icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.status.waiting .icon {
  color: #999;
}

.status.scanned .icon {
  color: #07c160;
  animation: pulse 1.5s infinite;
}

.status.refreshing .icon {
  color: #409eff;
}

/* 绿色打钩动画 */
@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

/* 刷新按钮：右上角小图标 */
.refresh-btn {
  pointer-events: auto;
  position: absolute;
  top: 12px;
  right: 12px;
  width: 36px;
  height: 36px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.refresh-btn:hover {
  background: rgba(0, 0, 0, 0.15);
  transform: rotate(180deg);
}

.refresh-btn .el-icon {
  font-size: 18px;
  color: #666;
}
</style>