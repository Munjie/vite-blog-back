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
                <el-step title="系统校验" />
                <el-step title="证书颁发" />
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
                        :title="activeStep === 3 ? 'DNS生效检测成功' : '正在全力申请中'"
                    >
                        <template #extra>
                            <el-button v-if="activeStep === 3" type="primary" @click="confirmApply">提交申请</el-button>
                            <el-button v-else loading text>验证中...</el-button>
                        </template>
                    </el-result>
                </div>
                <div v-if="activeStep === 4" class="step-box result-box">
                    <el-result
                        :icon="activeStep === 4 ? 'success' : 'info'"
                        :title="activeStep === 4 ? '证书申请成功' : '验证中...'"
                    >
                        <template #extra>
                            <el-button v-if="activeStep ===  4" type="primary" @click="listLets">查看证书</el-button>
                            <el-button v-else loading text>验证中...</el-button>
                        </template>
                    </el-result>
                </div>
            </div>
        </el-card>
    </div>
</template>

<script setup lang="ts">
import {ref, reactive, onMounted} from 'vue';
import { ElMessage } from 'element-plus';
import {checkDns, confirmData, create, getLetsById} from "../../api/lets.ts";
import {useRoute, useRouter} from 'vue-router';
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

// 恢复订单状态的方法
const resumeOrder = async (id: string) => {
  loading.value = true;
  try {
    const res = await  getLetsById(id);
    if (res.code === 200) {
      challengeData.value = res.data;
      challengeData.value.id = id;
      activeStep.value = 1;
    } else {
      ElMessage.error('无法获取挑战信息，请重新申请');
      activeStep.value = 0;
    }
  } catch (err) {
    ElMessage.error('恢复状态失败');
  } finally {
    loading.value = false;
  }
};
const submitOrder = async () => {
    if (!certForm.domain) {
        ElMessage.warning('请输入有效域名');
        return;
    }
    submitting.value = true;
    try {
        let domainForm = {
            domain: certForm.domain
        }
        const res =  await create(domainForm);
        debugger
        if (res.code === 200) {
            challengeData.value = res.data;
            activeStep.value = 1;
        } else {
            ElMessage.error(res.message || '申请单创建失败');
        }
    } catch (err) {
        ElMessage.error('网络异常，请检查后端服务');
    } finally {
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
        ElMessage.error('验证过程发生异常');
        activeStep.value = 1;
    } finally {
        verifying.value = false;
    }
};

const confirmApply = async () => {
    verifying.value = true;
    activeStep.value = 3;
    try {
        const res = await  confirmData(challengeData.value.id);
        if (res.code === 200 && res.data === true) {
            activeStep.value = 4;
            ElMessage.success('证书已生效');
        } else {
            ElMessage.error(res.message || '申请失败');
            activeStep.value = 3;
        }
    } catch (err) {
        ElMessage.error('验证过程发生异常');
        activeStep.value = 2;
    } finally {
        verifying.value = false;
    }
};

// 工具函数
const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    ElMessage.success('已复制到剪贴板');
};

const listLets = () => {
    router.push('/lets-add');
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