<template>
    <div class="jcloud-container">
        <div class="header-section">
            <h2 class="title">SSL 证书自动化中心</h2>
            <p class="subtitle">基于 ACME 协议的自动化证书签发与部署</p>
        </div>

        <el-card class="jcloud-card">
            <el-steps :active="activeStep"
                      finish-status="success"
                      process-status="finish"
                      align-center class="custom-steps">
                <el-step title="域名提交" />
                <el-step title="解析配置" />
                <el-step title="DNS校验" />
                <el-step title="证书签发" />
                <el-step title="完成" />
            </el-steps>

            <div class="content-body">
                <div v-if="activeStep === 0" class="step-box">
                    <div class="input-group">
                        <el-input
                            v-model="certForm.domain"
                            placeholder="请输入您要保护的域名 (例: www.xxx.com)"
                            size="large"
                            class="dark-input"
                        >
                            <template #prepend>https://</template>
                        </el-input>
                        <el-button
                            type="primary"
                            size="large"
                            :loading="submitting"
                            @click="submitOrder"
                        >
                            提交申请
                        </el-button>
                    </div>
                    <div class="form-tip">支持普通域名、子域名及 *.xxx.com 泛域名</div>
                </div>

                <div v-if="activeStep === 1" class="step-box">
                    <el-alert
                        title="请前往您的域名服务商（阿里云/腾讯云）添加以下 TXT 记录"
                        type="warning"
                        :closable="false"
                        show-icon
                        class="mb-20"
                    />

                    <table class="dns-table">
                        <thead>
                        <tr>
                            <th>记录类型</th>
                            <th>主机记录 (Host)</th>
                            <th>记录值 (Value)</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td><el-tag effect="plain">TXT</el-tag></td>
                            <td>
                                <span class="code-text">{{ challengeData.hostRecord }}</span>
                                <el-button link type="primary" @click="copy(challengeData.hostRecord)">复制</el-button>
                            </td>
                            <td>
                                <span class="code-text">{{ challengeData.recordValue }}</span>
                                <el-button link type="primary" @click="copy(challengeData.recordValue)">复制</el-button>
                            </td>
                        </tr>
                        </tbody>
                    </table>

                    <div class="warning-text">
                        <i class="el-icon-info"></i>
                        提示：主机记录通常不包含主域名后缀，请直接复制上方内容。
                    </div>

                    <div class="action-footer">
                        <el-button @click="activeStep = 0">重新填写</el-button>
                        <el-button type="success" :loading="verifying" @click="verifyDns">
                            我已完成配置，开始验证DNS
                        </el-button>
                    </div>
                </div>

                <div v-if="activeStep === 2 || activeStep === 3" class="step-box result-box">
                    <el-result
                        :icon="activeStep === 3 ? 'success' : 'info'"
                        :title="activeStep === 3 ? 'DNS 生效检测成功' : '正在检测 DNS 解析...'"
                        :sub-title="activeStep === 3 ? '系统已准备就绪，可以开始签发证书' : '这可能需要几十秒，请稍后'"
                    >
                        <template #extra>
                            <el-button v-if="activeStep === 3" type="primary" :loading="issuing" @click="confirmApply">
                                立即签发证书
                            </el-button>
                            <el-button v-else loading text>系统正在努力验证中...</el-button>
                        </template>
                    </el-result>
                </div>
                <div v-if="activeStep === 4 || activeStep === 5" class="step-box result-box">
                    <el-result
                        :icon="activeStep === 5 ? 'success' : 'info'"
                        :title="activeStep === 5 ? '证书颁发成功' : '证书正在颁发中...'"
                        :sub-title="activeStep === 5 ? '您的 SSL 证书已成功签发并存储' : '正在与 CA 机构通信并下载证书链，请勿刷新页面'"
                    >
                        <template #extra>
                            <el-button v-if="activeStep === 5" type="primary" @click="listLets">进入证书列表</el-button>
                            <div v-else class="issuing-loading">
                                <el-icon class="is-loading" :size="24"><Loading /></el-icon>
                                <p>正在与 Let's Encrypt 建立安全连接...</p>
                                <p>正在执行 Finalize 流程，请稍候...</p>
                                <p>正在下载全链证书文件...</p>
                            </div>
                        </template>
                    </el-result>
                </div>
            </div>
        </el-card>
    </div>
</template>

<script setup lang="ts">
import {ref, reactive, onMounted, onUnmounted} from 'vue';
import { ElMessage } from 'element-plus';
import {checkDns, confirmData, create, getLetsById} from "../../api/lets.ts";
import {useRoute, useRouter} from 'vue-router';
import {Loading} from "@element-plus/icons-vue";
const router = useRouter()
const route = useRoute();
// --- 类型定义 ---
interface ChallengeResponse {
    id: number;
    domain: string;
    hostRecord: string;
    recordValue: string;
}

// --- 响应式数据 ---
const activeStep = ref(0);
const loading = ref(false);
const submitting = ref(false);
const verifying = ref(false);
const issuing = ref(false);
let pollTimer: number | null = null; // 轮询定时器
const certForm = reactive({
    domain: ''
});
const challengeData = ref<ChallengeResponse>({
    id: 0,
    domain: '',
    hostRecord: '',
    recordValue: ''
});

// --- 业务逻辑 ---
onMounted(async () => {
  const { id: id, resume } = route.query;
  if (resume === 'true' && id) {
    await resumeOrder(id as string);
  }
});
onUnmounted(() => {
    stopPolling();
});

// --- 业务方法 ---

const stopPolling = () => {
    if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
    }
};
// 恢复订单状态的方法
const resumeOrder = async (id: string) => {
    try {
        const res = await getLetsById(id);
        if (res.code === 200) {
            challengeData.value = res.data;
            challengeData.value.id = Number(id);
            // 根据后端状态自动跳转步骤
            if (res.data.status === 'PENDING_CONFIG') activeStep.value = 1;
            if (res.data.status === 'DNS_SUCCESS') activeStep.value = 3;
            if (res.data.status === 'VALID') activeStep.value = 5;
        }
    } catch (err) {
        ElMessage.error('恢复状态失败');
    }
};
const submitOrder = async () => {
    if (!certForm.domain) return ElMessage.warning('请输入有效域名');
    submitting.value = true;
    try {
        let domainForm = {
            domain: certForm.domain
        }
        const res =  await create(domainForm);
        if (res.code === 200) {
            challengeData.value = res.data;
            activeStep.value = 1;
        } else {
            ElMessage.error(res.message || '申请单创建失败');
        }
    }  finally {
        submitting.value = false;
    }
};

const verifyDns = async () => {
    verifying.value = true;
    activeStep.value = 2;
    try {
        const res = await  checkDns(challengeData.value.id);
        if (res.code === 200 && res.data === true) {
            activeStep.value = 3;
            ElMessage.success('DNS已生效');
        } else {
            ElMessage.error(res.message || '验证失败，请确保解析已生效');
            activeStep.value = 1;
        }
    } catch (err) {
        activeStep.value = 1;
    } finally {
        verifying.value = false;
    }
};


const confirmApply = async () => {
    issuing.value = true;
    activeStep.value = 4;
    try {
        const res = await confirmData(challengeData.value.id);
        if (res.code === 200) {
            startPollingStatus(challengeData.value.id);
        } else {
            ElMessage.error(res.message || '发起签发请求失败');
            activeStep.value = 3;
            issuing.value = false;
        }
    } catch (err) {
        console.warn("触发接口异常，进入补偿轮询模式");
        startPollingStatus(challengeData.value.id);
    }
};

// 核心轮询逻辑
const startPollingStatus = (id: number) => {
    stopPolling();
    pollTimer = window.setInterval(async () => {
        try {
            const res = await getLetsById(id);
            if (res.code === 200) {
                if (res.data.status === 'VALID') {
                    activeStep.value = 5;
                    issuing.value = false;
                    stopPolling();
                    ElMessage.success('证书签发成功！');
                }
                 if (res.data.status === 'INVALID') {
                    activeStep.value = 3;
                    issuing.value = false;
                    stopPolling();
                    ElMessage.error('证书签发失败：' + (res.data.status || '未知原因'));
                }
                if (res.data.status === 'ERROR') {
                    activeStep.value = 3;
                    issuing.value = false;
                    stopPolling();
                    ElMessage.error('证书签发失败：' + (res.data.errorMessage || '未知原因'));
                }
            }
        } catch (e) {
            console.error("轮询异常", e);
        }
    }, 3000); // 每 3 秒检查一次
};

// 工具函数
const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    ElMessage.success('已复制到剪贴板');
};

const listLets = () => {
    router.push('/cert-list');
};
</script>

<style scoped>
.jcloud-container {
    padding: 40px;
    min-height: 100vh;
    background-color: #0d1117; /* 深色背景 */
    color: #c9d1d9;
}

.header-section {
    text-align: center;
    margin-bottom: 40px;
}

.title {
    font-size: 28px;
    color: #58a6ff;
    letter-spacing: 1px;
}

.subtitle {
    color: #8b949e;
    margin-top: 10px;
}

.jcloud-card {
    max-width: 900px;
    margin: 0 auto;
    background-color: #161b22 !important;
    border: 1px solid #30363d !important;
    border-radius: 8px;
}

.custom-steps {
    margin-bottom: 50px;
    --el-text-color-placeholder: #484f58;
}

.step-box {
    padding: 20px 0;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.input-group {
    display: flex;
    gap: 12px;
    width: 100%;
    max-width: 600px;
}

.dark-input :deep(.el-input__wrapper) {
    background-color: #0d1117;
    box-shadow: 0 0 0 1px #30363d inset;
}

.form-tip {
    margin-top: 15px;
    font-size: 13px;
    color: #8b949e;
}

/* DNS 表格样式 */
.dns-table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
    background: #0d1117;
    border-radius: 4px;
    overflow: hidden;
}

.dns-table th, .dns-table td {
    padding: 15px;
    text-align: left;
    border-bottom: 1px solid #30363d;
}

.dns-table th {
    background: #21262d;
    color: #8b949e;
    font-weight: 500;
}

.code-text {
    font-family: 'JetBrains Mono', monospace;
    color: #7ee787;
    background: rgba(126, 231, 135, 0.1);
    padding: 2px 6px;
    border-radius: 3px;
    margin-right: 10px;
}

.warning-text {
    font-size: 13px;
    color: #f85149;
    margin-top: 10px;
}

.action-footer {
    margin-top: 30px;
    display: flex;
    gap: 20px;
}

.mb-20 { margin-bottom: 20px; }
</style>