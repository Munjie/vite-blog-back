<template>
    <div class="jcloud-container">
        <div class="header-section">
            <el-backtop target=".jcloud-container"/>
            <div class="title-bar">
                <el-button link icon="ArrowLeft" @click="router.back()" class="back-btn">返回列表</el-button>
                <h2 class="title">自动化托管与生产部署配置</h2>
            </div>
        </div>

        <el-row :gutter="24" class="deploy-layout">
            <el-col :xs="24" :md="10">
                <el-card class="jcloud-card form-card" header="环境参数配置">
                    <el-form :model="deployForm" label-position="top" class="dark-form">
                        <el-form-item label="生产服务器类型">
                            <el-radio-group v-model="deployForm.deployServerType" @change="handleServerTypeChange">
                                <el-radio-button label="Nginx" value="Nginx"/>
                                <el-radio-button label="Apache" value="Apache"/>
                                <el-radio-button label="Tomcat" value="Tomcat"/>
                            </el-radio-group>
                        </el-form-item>

                        <el-form-item label="证书存放绝对路径 (.crt / .pem)">
                            <el-input v-model="deployForm.deployCertPath" placeholder="例如: /etc/nginx/ssl/munjie.crt"
                                      class="dark-input"/>
                        </el-form-item>

                        <el-form-item label="私钥存放绝对路径 (.key)">
                            <el-input v-model="deployForm.deployKeyPath" placeholder="例如: /etc/nginx/ssl/munjie.key"
                                      class="dark-input"/>
                        </el-form-item>

                        <el-form-item label="服务安全重载命令 (Reload Command)">
                            <el-input v-model="deployForm.deployReloadCmd" placeholder="例如: nginx -s reload"
                                      class="dark-input"/>
                            <div class="input-tip">注：请确保执行定时任务的系统账户拥有该命令的执行权限。</div>
                        </el-form-item>

                        <el-form-item style="margin-top: 30px;">
                            <el-button type="primary" size="large" class="submit-btn" :loading="saving" icon="Cpu"
                                       @click="generateDeployCommand">
                                保存配置并生成专属命令
                            </el-button>
                        </el-form-item>
                    </el-form>
                </el-card>
            </el-col>

            <el-col :xs="24" :md="14">
                <el-card class="jcloud-card code-card" header="Linux 服务器一键托管指令">
                    <div class="cmd-welcome-box" v-if="!generatedCommand">
                        <el-empty description="请在左侧填写路径并点击生成" :image-size="80"/>
                    </div>
                    <div v-else class="cmd-content-box">
                        <p class="notice-text">请在您的 Linux 生产服务器（支持 Ubuntu/CentOS/Debian）上以
                            <strong>root</strong> 权限执行以下命令：</p>
                        <div class="code-terminal">
                            <code>{{ generatedCommand }}</code>
                            <el-button type="primary" size="small" icon="DocumentCopy" class="copy-float-btn"
                                       @click="copyText(generatedCommand)">
                                复制指令
                            </el-button>
                        </div>
                        <div class="workflow-alert">
                            <h5>💡 执行后发生了什么？</h5>
                            <ul>
                                <li>第一步：安全下发专属的轻量级同步客户端组件文件 <code>jcloud-ssl-sync.sh</code>。</li>
                                <li>第二步：自动注册 Linux <code>crontab</code> 计划任务，在每月 10 号与 25 号凌晨 02:30
                                    静默轮询。
                                </li>
                                <li>第三步：本地立即启动首次运行验证，备份当前老旧证书，并将新证书平滑重载。</li>
                            </ul>
                        </div>
                    </div>
                </el-card>

                <el-card class="jcloud-card preview-card" header="脚本内容预览 (Transparent Script)">
                    <div class="script-terminal-preview">
                        <pre><code>{{ scriptPreviewText }}</code></pre>
                    </div>
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>

<script setup lang="ts">
import {ref, reactive, onMounted} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {ElMessage} from 'element-plus';
import {previewTemplate, saveDeploy} from "../../api/lets.ts";

const router = useRouter();
const route = useRoute();

const saving = ref(false);
const generatedCommand = ref('');
const scriptPreviewText = ref('正在加载模板...');

const deployForm = reactive({
    id: null as any,
    deployServerType: 'Nginx',
    deployCertPath: '',
    deployKeyPath: '',
    deployReloadCmd: 'nginx -s reload'
});

onMounted(() => {
    const certId = route.query.id;
    if (!certId) {
        ElMessage.error('非法请求，未检测到证书标识');
        router.push('/cert-list');
        return;
    }
    deployForm.id = Number(certId);
    fetchCurrentScriptTemplate();
});


const handleServerTypeChange = (val: any) => {
    if (val === 'Nginx') {
        deployForm.deployCertPath = '/etc/nginx/ssl/munjie_fullchain.crt';
        deployForm.deployKeyPath = '/etc/nginx/ssl/munjie.key';
        deployForm.deployReloadCmd = 'nginx -s reload';
    } else if (val === 'Apache') {
        deployForm.deployCertPath = '/etc/httpd/conf.d/ssl/munjie.crt';
        deployForm.deployKeyPath = '/etc/httpd/conf.d/ssl/munjie.key';
        deployForm.deployReloadCmd = 'systemctl reload httpd';
    } else if (val === 'Tomcat') {
        deployForm.deployCertPath = '/usr/local/tomcat/conf/munjie.p15';
        deployForm.deployKeyPath = '/usr/local/tomcat/conf/password.txt';
        deployForm.deployReloadCmd = 'systemctl restart tomcat';
    }
};


const fetchCurrentScriptTemplate = async () => {
    try {
        const res = await previewTemplate();
        scriptPreviewText.value = typeof res?.data === 'string' ? res.data : JSON.stringify(res?.data);
    } catch (e) {
        scriptPreviewText.value = "# 暂无网络连接 #";
    }
};


const generateDeployCommand = async () => {
    if (!deployForm.deployCertPath || !deployForm.deployKeyPath) {
        ElMessage.warning('请将证书和私钥的本地存放路径填写完整');
        return;
    }
    saving.value = true;
    try {
        const res: any = await saveDeploy(deployForm);
        if (res.data.code === 200 || res.code === 200) {
            const data = res.data.data || res.data;
            generatedCommand.value = data.command;
            ElMessage.success('配置已保存，托管命令就绪！');
        } else {
            ElMessage.error(res.message || '命令计算生成失败');
        }
    } catch (err) {
        ElMessage.error('服务异常');
    } finally {
        saving.value = false;
    }
};

const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    ElMessage.success('命令已成功复制到剪贴板，可直接上机执行！');
};
</script>

<style scoped>
.jcloud-container {
    padding: 24px;
    background-color: #0d1117;
    min-height: 100vh;
    color: #c9d1d9;
}

.title-bar {
    display: flex;
    align-items: center;
    gap: 15px;
}

.back-btn {
    color: #8b949e;
}

.back-btn:hover {
    color: #58a6ff;
}

.title {
    color: #f0f6fc;
    margin: 0;
}

.subtitle {
    color: #8b949e;
    font-size: 14px;
    margin-top: 5px;
    margin-bottom: 30px;
}

.deploy-layout {
    margin-top: 10px;
}

.jcloud-card {
    background-color: #161b22 !important;
    border: 1px solid #30363d !important;
    border-radius: 8px;
    color: #c9d1d9;
    margin-bottom: 24px;
}

:deep(.el-card__header) {
    border-bottom: 1px solid #30363d !important;
    color: #f0f6fc;
    font-weight: bold;
}

.dark-input :deep(.el-input__wrapper) {
    background-color: #0d1117;
    box-shadow: 0 0 0 1px #30363d inset;
}

.dark-input :deep(.el-input__inner) {
    color: #c9d1d9;
}

.input-tip {
    font-size: 12px;
    color: #8b949e;
    margin-top: 4px;
}

.submit-btn {
    width: 100%;
    background-color: #238636;
    border-color: #2ea44f;
}

.submit-btn:hover {
    background-color: #2ea44f;
}

/* 终端仿真样式块 */
.code-terminal {
    background-color: #010409;
    padding: 16px;
    border-radius: 6px;
    border: 1px solid #30363d;
    position: relative;
    font-family: monospace, Courier New;
    color: #58a6ff;
    word-break: break-all;
    margin: 15px 0;
}

.copy-float-btn {
    position: absolute;
    right: 8px;
    bottom: 8px;
}

.script-terminal-preview {
    background-color: #0d1117;
    padding: 14px;
    border-radius: 6px;
    max-height: 260px;
    overflow-y: auto;
    font-size: 12px;
    color: #79c0ff;
    border: 1px solid #21262d;
}

.workflow-alert {
    background-color: rgba(56, 139, 253, 0.1);
    border: 1px solid rgba(56, 139, 253, 0.2);
    padding: 12px 16px;
    border-radius: 6px;
    margin-top: 15px;
}

.workflow-alert h5 {
    margin: 0 0 8px 0;
    color: #58a6ff;
}

.workflow-alert ul {
    margin: 0;
    padding-left: 18px;
    font-size: 12px;
    color: #8b949e;
    line-height: 1.6;
}

.notice-text {
    font-size: 13px;
    color: #c9d1d9;
}
</style>