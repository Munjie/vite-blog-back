<template>
    <div class="cert-container">
        <el-card class="dark-card">
            <template #header>
                <div class="card-header">
                    <span>SSL 证书自动化申请</span>
                    <el-tag type="info" effect="dark">Let's Encrypt 生产环境</el-tag>
                </div>
            </template>

            <el-steps :active="activeStep" finish-status="success" align-center>
                <el-step title="输入域名" />
                <el-step title="配置 DNS" />
                <el-step title="系统验证" />
                <el-step title="签发成功" />
            </el-steps>

            <div class="step-content">
                <div v-if="activeStep === 0" class="input-area">
                    <el-input
                        v-model="domain"
                        placeholder="请输入域名，如 www.munjie.com"
                        class="domain-input"
                        @keyup.enter="handleCreateOrder"
                    >
                        <template #prepend>https://</template>
                    </el-input>
                    <el-button type="primary" :loading="loading" @click="handleCreateOrder">
                        获取解析记录
                    </el-button>
                </div>

                <div v-if="activeStep === 1" class="dns-guide">
                    <el-alert
                        title="请登录阿里云/腾讯云后台，添加以下 TXT 解析记录"
                        type="warning"
                        :closable="false"
                        show-icon
                    />

                    <el-descriptions :column="1" border class="dns-table">
                        <el-descriptions-item label="记录类型">TXT</el-descriptions-item>
                        <el-descriptions-item label="主机记录">
                            <code class="code-box">{{ challengeInfo.hostRecord }}</code>
                            <el-button link type="primary" @click="copyText(challengeInfo.hostRecord)">复制</el-button>
                        </el-descriptions-item>
                        <el-descriptions-item label="记录值">
                            <code class="code-box">{{ challengeInfo.recordValue }}</code>
                            <el-button link type="primary" @click="copyText(challengeInfo.recordValue)">复制</el-button>
                        </el-descriptions-item>
                    </el-descriptions>

                    <div class="tip">
                        <el-icon><InfoFilled /></el-icon>
                        注意：主机记录不要包含域名后缀，系统会自动拼接。
                    </div>

                    <div class="actions">
                        <el-button @click="activeStep = 0">返回修改</el-button>
                        <el-button type="success" :loading="loading" @click="handleVerify">
                            我已配置，开始验证
                        </el-button>
                    </div>
                </div>

                <div v-if="activeStep === 2" class="verifying">
                    <el-result icon="info" title="正在预检 DNS 生效情况">
                        <template #sub-title>
                            正在同步全球 DNS 节点，请耐心等待...
                        </template>
                    </el-result>
                </div>

                <div v-if="activeStep === 3" class="success-result">
                    <el-result icon="success" title="证书签发成功" sub-title="Nginx 已准备就绪">
                        <template #extra>
                            <el-button type="primary" @click="activeStep = 0">继续申请</el-button>
                        </template>
                    </el-result>
                </div>
            </div>
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { InfoFilled } from '@element-plus/icons-vue'

// 接口定义
interface ChallengeDTO {
    domain: string
    hostRecord: string
    recordValue: string
}

const activeStep = ref(0)
const domain = ref('')
const loading = ref(false)
const challengeInfo = ref<ChallengeDTO>({
    domain: '',
    hostRecord: '',
    recordValue: ''
})

// 1. 创建订单 (对应后端 createOrder)
const handleCreateOrder = async () => {
    if (!domain.value) return ElMessage.error('请输入域名')
    loading.value = true
    try {
        // 模拟后端调用
        // const res = await axios.post('/api/cert/create', { domain: domain.value })
        // challengeInfo.value = res.data

        // 模拟数据
        setTimeout(() => {
            challengeInfo.value = {
                domain: domain.value,
                hostRecord: '_acme-challenge.' + domain.value.split('.')[0],
                recordValue: 'R-8_h_your_token_here_xxxx'
            }
            activeStep.value = 1
            loading.value = false
        }, 1000)
    } catch (error) {
        loading.value = false
    }
}

// 2. 触发验证 (对应后端 verifyAndIssue)
const handleVerify = async () => {
    loading.value = true
    try {
        // 模拟后端验证逻辑
        setTimeout(() => {
            loading.value = false
            activeStep.value = 3
            ElMessage.success('证书已部署到 Nginx')
        }, 3000)
    } catch (error: any) {
        loading.value = false
        ElMessage.error(error.message || 'DNS 尚未生效')
    }
}

// 复制功能
const copyText = (text: string) => {
    navigator.clipboard.writeText(text)
    ElMessage.success('复制成功')
}
</script>

<style scoped>
.cert-container {
    max-width: 800px;
    margin: 40px auto;
    background-color: #1a1a1a; /* 暗黑背景 */
}

.dark-card {
    background-color: #242424;
    border: 1px solid #333;
    color: #eee;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: bold;
    color: #409eff;
}

.step-content {
    margin-top: 40px;
    padding: 20px;
}

.input-area {
    display: flex;
    gap: 10px;
    justify-content: center;
}

.domain-input {
    width: 400px;
}

.dns-guide {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.dns-table {
    margin-top: 10px;
    background-color: #2d2d2d;
}

.code-box {
    background: #111;
    padding: 4px 8px;
    border-radius: 4px;
    color: #67c23a;
    margin-right: 10px;
    font-family: monospace;
}

.tip {
    font-size: 13px;
    color: #999;
    display: flex;
    align-items: center;
    gap: 5px;
}

.actions {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 20px;
}

/* 深度选择器修改 Element Plus 原生样式以匹配暗黑感 */
:deep(.el-step__title) {
    color: #888 !important;
}
:deep(.el-step__title.is-success) {
    color: #409eff !important;
}
:deep(.el-descriptions__label) {
    background-color: #1d1d1d !important;
    color: #aaa;
}
:deep(.el-descriptions__content) {
    background-color: #242424 !important;
    color: #fff;
}
</style>