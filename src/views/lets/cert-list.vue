<template>
    <div class="jcloud-container">
        <div class="header-section">
            <div class="header-left">
                <h2 class="title">证书管理控制台</h2>
            </div>
            <el-button type="primary" size="large" @click="goToApply">
                <el-icon>
                    <Plus/>
                </el-icon>
                申请新证书
            </el-button>
        </div>

        <el-card class="filter-card">
            <el-input
                    v-model="searchQuery"
                    placeholder="搜索域名..."
                    class="search-input"
                    clearable
                    :prefix-icon="Search"
            />
        </el-card>

        <el-table :data="filteredList" class="jcloud-table" v-loading="loading">
            <el-table-column prop="domain" label="绑定域名">
                <template #default="{ row }">
                    <span class="domain-name">{{ row.domain }}</span>
                    <el-tag v-if="row.isWildcard" size="small" effect="plain" class="ml-10">泛域名</el-tag>
                </template>
            </el-table-column>

            <el-table-column prop="status" label="状态">
                <template #default="{ row }">
                    <el-tag :type="getStatusType(row.status)" effect="dark">
                        {{ getStatusText(row.status) }}
                    </el-tag>
                </template>
            </el-table-column>

            <el-table-column prop="issuer" label="签发者"/>

            <el-table-column prop="expiryDate" label="到期时间">
                <template #default="{ row }">
          <span :class="{ 'text-danger': isNearExpiry(row.expiryDate) }">
            {{ row.expiryDate }}
          </span>
                </template>
            </el-table-column>

            <el-table-column label="自动续期" width="140" align="center">
                <template #default="{ row }">
                    <el-switch
                            v-model="row.autoRenew"
                            :active-value="1"
                            :inactive-value="0"
                            active-color="#58a6ff"
                            inactive-color="#30363d"
                            @change="(val) => handleToggleRenew(row, val)"
                    />
                    <div v-if="row.autoRenew === 1 && row.renewStatus" class="renew-status-tag">
                        <el-text :type="row.renewStatus === 'FAILED' ? 'danger' : 'info'" size="small">
                            {{
                            row.renewStatus === 'RENEWING' ? '(续期中...)' : row.renewStatus === 'FAILED' ? '(续期失败)' : ''
                            }}
                        </el-text>
                    </div>
                </template>
            </el-table-column>

            <el-table-column label="操作" fixed="right">
                <template #default="{ row }">
                    <el-button
                            v-if="row.status === 'PENDING_CONFIG'"
                            type="warning"
                            link
                            @click="handleContinue(row)"
                    >
                        继续配置
                    </el-button>
                    <el-button type="primary" link @click="handleDetail(row)">详情</el-button>
                    <el-button v-if="row.status === 'VALID'" type="primary" link @click="handleGoToDeploy(row)">自动部署
                    </el-button>
                    <el-button v-if="row.status === 'VALID'" type="primary" link @click="handleDownload(row)">下载
                    </el-button>


                    <el-popconfirm
                            title="确定要删除该证书吗？此操作不可恢复"
                            confirm-button-text="确定"
                            cancel-button-text="取消"
                            @confirm="confirmDelete(row)"
                    >
                        <template #reference>
                            <el-button type="danger" link>删除</el-button>
                        </template>
                    </el-popconfirm>
                </template>
            </el-table-column>
        </el-table>

        <el-drawer
                v-model="drawerVisible"
                title="证书详细信息"
                size="640px"
                custom-class="jcloud-drawer"
                destroy-on-close
        >
            <div v-loading="drawerLoading" class="drawer-content">
                <div v-if="detailData">
                    <div class="detail-section">
                        <h3 class="section-title">
                            <el-icon>
                                <InfoFilled/>
                            </el-icon>
                            基本信息
                        </h3>
                        <el-descriptions :column="1" border class="dark-descriptions">
                            <el-descriptions-item label="域名">{{ detailData.domain }}</el-descriptions-item>
                            <el-descriptions-item label="状态">
                                <el-tag :type="detailData.status === 'VALID' ? 'success' : 'danger'" effect="dark">
                                    {{ detailData.status === 'VALID' ? '有效' : '无效' }}
                                </el-tag>
                            </el-descriptions-item>
                            <el-descriptions-item label="证书类型">{{
                                detailData.certType || 'DV'
                                }}
                            </el-descriptions-item>
                            <el-descriptions-item label="证书分类">{{
                                detailData.certCategory || '服务器证书'
                                }}
                            </el-descriptions-item>
                            <el-descriptions-item label="创建时间">{{ detailData.createTime }}</el-descriptions-item>
                        </el-descriptions>
                    </div>

                    <div class="detail-section">
                        <h3 class="section-title">
                            <el-icon>
                                <User/>
                            </el-icon>
                            证书主体信息
                        </h3>
                        <el-descriptions :column="1" border class="dark-descriptions">
                            <el-descriptions-item label="通用名称(CN)">{{ detailData.domain }}</el-descriptions-item>
                        </el-descriptions>
                    </div>

                    <div class="detail-section">
                        <h3 class="section-title">
                            <el-icon>
                                <Management/>
                            </el-icon>
                            签发者信息
                        </h3>
                        <el-descriptions :column="1" border class="dark-descriptions">
                            <el-descriptions-item label="通用名称(CN)">{{
                                detailData.issuerCn || 'R12'
                                }}
                            </el-descriptions-item>
                            <el-descriptions-item label="国家(C)">{{
                                detailData.issuerCountry || 'US'
                                }}
                            </el-descriptions-item>
                            <el-descriptions-item label="省份(ST)">{{
                                detailData.issuerProvince || '-'
                                }}
                            </el-descriptions-item>
                            <el-descriptions-item label="城市(L)">{{
                                detailData.issuerCity || '-'
                                }}
                            </el-descriptions-item>
                            <el-descriptions-item label="组织(O)">{{
                                detailData.issuerOrg || "Let's Encrypt"
                                }}
                            </el-descriptions-item>
                            <el-descriptions-item label="部门(OU)">{{
                                detailData.issuerOu || '-'
                                }}
                            </el-descriptions-item>
                        </el-descriptions>
                    </div>

                    <div class="detail-section">
                        <h3 class="section-title">
                            <el-icon>
                                <Cpu/>
                            </el-icon>
                            证书技术信息
                        </h3>
                        <el-descriptions :column="1" border class="dark-descriptions">
                            <el-descriptions-item label="序列号"><span class="mono-text">{{
                                detailData.serialNumber
                                }}</span></el-descriptions-item>
                            <el-descriptions-item label="密钥类型">{{
                                detailData.keyType || 'RSA'
                                }}
                            </el-descriptions-item>
                            <el-descriptions-item label="密钥强度">{{
                                detailData.keyStrength || '2048 bits'
                                }}
                            </el-descriptions-item>
                            <el-descriptions-item label="签名算法">{{
                                detailData.signAlgorithm || 'SHA256withRSA'
                                }}
                            </el-descriptions-item>
                            <el-descriptions-item label="密钥用法">{{ detailData.keyUsage }}</el-descriptions-item>
                            <el-descriptions-item label="CA URL"><a :href="detailData.caUrl" target="_blank"
                                                                    class="link-text">{{ detailData.caUrl || '-' }}</a>
                            </el-descriptions-item>
                            <el-descriptions-item label="CRL URL"><a :href="detailData.crlUrl" target="_blank"
                                                                     class="link-text">{{
                                detailData.crlUrl || '-'
                                }}</a></el-descriptions-item>
                            <el-descriptions-item label="OCSP URL">{{
                                detailData.ocspUrl || '-'
                                }}
                            </el-descriptions-item>
                        </el-descriptions>
                    </div>

                    <div class="detail-section">
                        <h3 class="section-title">
                            <el-icon>
                                <Calendar/>
                            </el-icon>
                            有效期信息
                        </h3>
                        <el-descriptions :column="1" border class="dark-descriptions">
                            <el-descriptions-item label="颁发时间">{{ detailData.startDate }}</el-descriptions-item>
                            <el-descriptions-item label="过期时间">{{ detailData.expiryDate }}</el-descriptions-item>
                            <el-descriptions-item label="有效期">
            <span :class="{'text-warning': getRemainingDays(detailData.expiryDate) < 30}">
              {{ getRemainingDays(detailData.expiryDate) }} 天
            </span>
                            </el-descriptions-item>
                        </el-descriptions>
                    </div>

                    <div class="detail-section">
                        <h3 class="section-title">
                            <el-icon>
                                <Key/>
                            </el-icon>
                            指纹信息
                        </h3>
                        <el-descriptions :column="1" border class="dark-descriptions">
                            <el-descriptions-item label="SHA1指纹">
                                <span class="mono-text break-all">{{ detailData.sha1Fingerprint }}</span>
                            </el-descriptions-item>
                            <el-descriptions-item label="SHA256指纹">
                                <span class="mono-text break-all">{{ detailData.sha256Fingerprint }}</span>
                            </el-descriptions-item>
                        </el-descriptions>
                    </div>

                    <div class="detail-section">
                        <h3 class="section-title">
                            <el-icon>
                                <Connection/>
                            </el-icon>
                            扩展信息
                        </h3>
                        <el-descriptions :column="1" border class="dark-descriptions">
                            <el-descriptions-item label="密钥用法">{{ detailData.keyUsage }}</el-descriptions-item>
                            <el-descriptions-item label="主题备用名称">{{
                                detailData.sans || detailData.domain
                                }}
                            </el-descriptions-item>
                            <el-descriptions-item label="公钥">
                                <pre class="key-block"><code>{{ detailData.publicKey }}</code></pre>
                            </el-descriptions-item>
                        </el-descriptions>
                    </div>
                </div>
            </div>
        </el-drawer>
    </div>
</template>

<script setup lang="ts">
import {computed, onMounted} from 'vue';
import {ElMessage} from 'element-plus';
import {Plus, Search} from '@element-plus/icons-vue';
import {deleteDomain, listCert, toggleAutoRenew} from "../../api/lets.ts";
import {useRouter} from "vue-router";
import axios from "axios";
import {useUserStore} from "../../stores";

const router = useRouter()

// --- 类型定义 ---
interface Certificate {
    id: number;
    domain: string;
    status: 'VALID' | 'PENDING_CONFIG' | 'VERIFYING' | 'EXPIRED';
    issuer: string;
    expiryDate: string;
    isWildcard: boolean;
}

// --- 响应式数据 ---
const loading = ref(false);
const searchQuery = ref('');
const certList = ref<Certificate[]>([]);


const fetchCertList = async () => {
    loading.value = true;
    try {
        const res = await listCert();
        certList.value = res?.data || [];
    } catch (error) {
        console.error("获取列表失败:", error);
    } finally {
        loading.value = false;
    }
};

// --- 计算属性 ---
const filteredList = computed(() => {
    return certList.value.filter(item =>
        item.domain.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
});

// --- 功能方法 ---

const getStatusType = (status: string) => {
    const map: any = {
        VALID: 'success',
        PENDING_CONFIG: 'warning',
        VERIFYING: 'info',
        EXPIRED: 'danger'
    };
    return map[status] || 'info';
};

const getStatusText = (status: string) => {
    const map: any = {VALID: '已生效', PENDING_CONFIG: '待配置', VERIFYING: '验证中', EXPIRED: '已过期'};
    return map[status] || status;
};

const isNearExpiry = (dateStr: string) => {
    if (dateStr === '--') return false;
    const expiry = new Date(dateStr).getTime();
    const now = new Date().getTime();
    return expiry - now < 7 * 24 * 60 * 60 * 1000; // 距离过期小于7天
};
const handleGoToDeploy = (row: any) => {
    // 点击直接携带着当前证书数据的主键 ID 奔向部署配置中心
    router.push({ path: '/lets-deploy', query: { id: row.id } });
};
// 下载逻辑
const handleDownload = (row: Certificate) => {
    if (row.status !== 'VALID') {
        ElMessage.error('当前证书状态不可下载');
        return;
    }
    exportFun(row)
    ElMessage.success('下载完成')
};

// 删除逻辑
const confirmDelete = async (row: Certificate) => {
    try {
        await deleteDomain(row.id)
        await fetchCertList();
        ElMessage.success('证书已安全删除');
    } catch (err) {
        ElMessage.error('删除失败');
    }
};


const handleContinue = (row: Certificate) => {
    // 跳转到申请页面，并携带域名参数
    router.push({
        path: '/lets-add',
        query: {id: row.id, resume: 'true'}
    });
};
const goToApply = () => {
    router.push('/lets-add');
    ElMessage.info('跳转至申请页面');
};

/*const handleDetail = (row: Certificate) => {
    ElMessageBox.alert(`域名: ${row.domain}<br>签发者: ${row.issuer}<br>证书 ID: ${row.id}`, '证书详情', {
        confirmButtonText: '确定',
        dangerouslyUseHTMLString: true,
    });
};*/
const exportFun = async (row: Certificate) => {
    const userStore = useUserStore();
    const token = userStore.getExpireToken();
    let info = {
        id: row.id,
    }
    const response = await axios.post('/api/lets/download', info, {
        headers: {
            'Content-Type': 'application/json; application/octet-stream',
            'Authorization': `Bearer ${token}`
        },
        responseType: "blob"
    })
    const disposition = response.headers['content-disposition'] ?? response.headers['Content-Disposition'];
    let fileName = '下载文件';

    if (disposition) {
        const match = disposition.match(/filename[*]?=(?:UTF-8'')?([^;]+)/i);
        if (match?.[1]) {
            fileName = decodeURIComponent(match[1].replace(/"/g, ''));
        }
    }
    console.log(fileName)
    const blob = new Blob([response.data], {type: 'application/zip'});
    // 创建下载链接
    const url = URL.createObjectURL(blob);
    // 创建虚拟a标签进行下载
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    // 释放URL对象
    URL.revokeObjectURL(url);
    link.remove();
};

onMounted(() => {
    fetchCertList();
});

import {ref} from 'vue';
import {
    InfoFilled, User, Management, Cpu, Calendar, Key, Connection
} from '@element-plus/icons-vue';
// 导入获取详情的 API，假设名字叫 getCertDetailById
import {getLetsById} from "../../api/lets.ts";

// --- 详情抽屉控制状态 ---
const drawerVisible = ref(false);
const drawerLoading = ref(false);
const detailData = ref<any>(null);

// --- 替换原有的 handleDetail 方法 ---
const handleDetail = async (row: any) => {
    drawerVisible.value = true;
    drawerLoading.value = true;
    try {
        // 调用后端接口获取包含指纹、公钥等完整拓展信息的明细
        const res = await getLetsById(row.id);
        if (res.code === 200) {
            detailData.value = res.data;
        } else {
            ElMessage.error(res.message || '获取证书详情失败');
            drawerVisible.value = false;
        }
    } catch (err) {
        console.error(err);
        drawerVisible.value = false;
    } finally {
        drawerLoading.value = false;
    }
};

// 计算有效期天数工具
const getRemainingDays = (expiryDateStr: string) => {
    if (!expiryDateStr || expiryDateStr === '--') return 0;
    const expiry = new Date(expiryDateStr).getTime();
    const now = new Date().getTime();
    const diff = expiry - now;
    return diff > 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : 0;
};

// 切换自动续期开关
const handleToggleRenew = async (row: any, value: any) => {
    try {
        const res = await toggleAutoRenew(row.id, value);
        if (res.code === 200) {
            ElMessage.success(res.message);
        } else {
            // 如果后端失败，回滚前端开关状态
            row.autoRenew = value === 1 ? 0 : 1;
            ElMessage.error(res.message || '操作失败');
        }
    } catch (err) {
        row.autoRenew = value === 1 ? 0 : 1;
        console.error(err);
    }
};
</script>

<style scoped>
.jcloud-container {
    padding: 30px;
    background-color: #0d1117;
    min-height: 100vh;
    color: #c9d1d9;
}

.header-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
}

.title {
    font-size: 24px;
    color: #58a6ff;
    margin: 0;
}

.subtitle {
    color: #8b949e;
    margin-top: 5px;
}

.filter-card {
    background-color: #161b22 !important;
    border: 1px solid #30363d !important;
    margin-bottom: 20px;
}

.search-input {
    width: 300px;
}

.jcloud-table {
    background-color: #161b22 !important;
    border: 1px solid #30363d !important;
    border-radius: 8px;
    --el-table-border-color: #30363d;
    --el-table-header-bg-color: #21262d;
    --el-table-text-color: #c9d1d9;
    --el-table-row-hover-bg-color: #1c2128;
}

:deep(.el-table__inner-wrapper::before) {
    display: none;
}

.domain-name {
    font-weight: 600;
    color: #c9d1d9;
}

.text-danger {
    color: #f85149;
    font-weight: bold;
}

.ml-10 {
    margin-left: 10px;
}


:deep(.el-input__wrapper) {
    background-color: #0d1117 !important;
    box-shadow: 0 0 0 1px #30363d inset !important;
}

:deep(.el-button--primary.is-link) {
    color: #58a6ff;
}

:deep(.el-button--danger.is-link) {
    color: #f85149;
}

/* 抽屉整体适配暗黑 */
:deep(.jcloud-drawer) {
    background-color: #161b22 !important;
    color: #c9d1d9 !important;
    border-left: 1px solid #30363d;
}

:deep(.el-drawer__header) {
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid #30363d;
    color: #58a6ff !important;
    font-weight: bold;
}

.drawer-content {
    padding: 0 10px;
    height: 100%;
    overflow-y: auto;
}

.detail-section {
    margin-bottom: 30px;
}

.section-title {
    font-size: 15px;
    color: #58a6ff;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
    border-left: 3px solid #58a6ff;
    padding-left: 8px;
}

/* 彻底重塑 Descriptions 组件为界云暗黑系 */
.dark-descriptions :deep(.el-descriptions__table) {
    background-color: #0d1117 !important;
    border: 1px solid #30363d !important;
}

.dark-descriptions :deep(.el-descriptions__label) {
    background-color: #21262d !important;
    color: #8b949e !important;
    width: 140px;
    font-weight: 500;
    border-right: 1px solid #30363d !important;
    border-bottom: 1px solid #30363d !important;
}

.dark-descriptions :deep(.el-descriptions__content) {
    color: #c9d1d9 !important;
    background-color: #0d1117 !important;
    border-bottom: 1px solid #30363d !important;
}

/* 字体代码化与公钥块 */
.mono-text {
    font-family: 'JetBrains Mono', Consolas, monospace;
    color: #7ee787;
    font-size: 13px;
}

.break-all {
    word-break: break-all;
}

.link-text {
    color: #58a6ff;
    text-decoration: none;
}

.link-text:hover {
    text-transform: underline;
}

.key-block {
    background-color: #1c2128;
    border: 1px solid #30363d;
    border-radius: 6px;
    padding: 12px;
    max-height: 180px;
    overflow-y: auto;
    margin: 0;
}

.key-block code {
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    color: #ff7b72;
    white-space: pre-wrap;
    word-break: break-all;
}

.text-warning {
    color: #e3b341;
    font-weight: bold;
}
</style>