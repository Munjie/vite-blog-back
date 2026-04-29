<template>
    <div class="jcloud-container">
        <div class="header-section">
            <div class="header-left">
                <h2 class="title">证书管理控制台</h2>
            </div>
            <el-button type="primary" size="large" @click="goToApply">
                <el-icon><Plus /></el-icon> 申请新证书
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
            <el-table-column prop="domain" label="绑定域名" min-width="200">
                <template #default="{ row }">
                    <span class="domain-name">{{ row.domain }}</span>
                    <el-tag v-if="row.isWildcard" size="small" effect="plain" class="ml-10">泛域名</el-tag>
                </template>
            </el-table-column>

            <el-table-column prop="status" label="状态" width="120">
                <template #default="{ row }">
                    <el-tag :type="getStatusType(row.status)" effect="dark">
                        {{ getStatusText(row.status) }}
                    </el-tag>
                </template>
            </el-table-column>

            <el-table-column prop="issuer" label="签发者" width="150" />

            <el-table-column prop="expiryDate" label="到期时间" width="180">
                <template #default="{ row }">
          <span :class="{ 'text-danger': isNearExpiry(row.expiryDate) }">
            {{ row.expiryDate }}
          </span>
                </template>
            </el-table-column>

            <el-table-column label="操作" width="240" fixed="right">
                <template #default="{ row }">
                    <el-dropdown trigger="click" @command="(cmd: string) => handleDownload(row, cmd)">
                        <el-button type="primary" link>
                            下载 <el-icon class="el-icon--right"><arrow-down /></el-icon>
                        </el-button>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item command="cert">证书文件 (PEM)</el-dropdown-item>
                                <el-dropdown-item command="key">私钥文件 (KEY)</el-dropdown-item>
                                <el-dropdown-item command="all">完整压缩包 (ZIP)</el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>

                    <el-button type="primary" link @click="handleDetail(row)">详情</el-button>

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
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Search, ArrowDown } from '@element-plus/icons-vue';
import {deleteDomain, listCert} from "../../api/lets.ts";
import {useRouter} from "vue-router";
const router = useRouter()
// --- 类型定义 ---
interface Certificate {
    id: number;
    domain: string;
    status: 'VALID' | 'PENDING' | 'EXPIRED';
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
         certList.value = res.data;
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
    const map: any = { VALID: 'success', PENDING: 'warning', EXPIRED: 'danger' };
    return map[status] || 'info';
};

const getStatusText = (status: string) => {
    const map: any = { VALID: '已生效', PENDING: '审核中', EXPIRED: '已过期' };
    return map[status] || status;
};

const isNearExpiry = (dateStr: string) => {
    if (dateStr === '--') return false;
    const expiry = new Date(dateStr).getTime();
    const now = new Date().getTime();
    return expiry - now < 7 * 24 * 60 * 60 * 1000; // 距离过期小于7天
};

// 下载逻辑
const handleDownload = (row: Certificate, type: string) => {
    if (row.status !== 'VALID') {
        ElMessage.error('当前证书状态不可下载');
        return;
    }
    // 实际集成时：window.open(`/api/cert/download?id=${row.id}&type=${type}`)
    ElMessage.success(`开始下载 ${row.domain} 的 ${type} 文件`);
};

// 删除逻辑
const confirmDelete = async (row: Certificate) => {
    try {
        await deleteDomain(row.id)
        await  fetchCertList();
        ElMessage.success('证书已安全删除');
    } catch (err) {
        ElMessage.error('删除失败');
    }
};

const goToApply = () => {
    router.push('/lets-add');
    ElMessage.info('跳转至申请页面');
};

const handleDetail = (row: Certificate) => {
    ElMessageBox.alert(`域名: ${row.domain}<br>签发者: ${row.issuer}<br>证书 ID: ${row.id}`, '证书详情', {
        confirmButtonText: '确定',
        dangerouslyUseHTMLString: true,
    });
};

onMounted(() => {
    fetchCertList();
});
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

.title { font-size: 24px; color: #58a6ff; margin: 0; }
.subtitle { color: #8b949e; margin-top: 5px; }

.filter-card {
    background-color: #161b22 !important;
    border: 1px solid #30363d !important;
    margin-bottom: 20px;
}

.search-input { width: 300px; }

.jcloud-table {
    background-color: #161b22 !important;
    border: 1px solid #30363d !important;
    border-radius: 8px;
    --el-table-border-color: #30363d;
    --el-table-header-bg-color: #21262d;
    --el-table-text-color: #c9d1d9;
    --el-table-row-hover-bg-color: #1c2128;
}

:deep(.el-table__inner-wrapper::before) { display: none; }

.domain-name {
    font-weight: 600;
    color: #c9d1d9;
}

.text-danger {
    color: #f85149;
    font-weight: bold;
}

.ml-10 { margin-left: 10px; }

/* 适配 Element Plus 暗黑样式 */
:deep(.el-input__wrapper) {
    background-color: #0d1117 !important;
    box-shadow: 0 0 0 1px #30363d inset !important;
}

:deep(.el-button--primary.is-link) { color: #58a6ff; }
:deep(.el-button--danger.is-link) { color: #f85149; }
</style>