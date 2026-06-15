<template>
    <div class="jcloud-container">
        <div class="header-section">
            <div class="actions">
                <el-button type="primary" class="tech-btn" @click="handleSyncWechat" :loading="syncLoading">
                    <el-icon><Refresh /></el-icon> 同步微信官方模板
                </el-button>
            </div>
        </div>

        <el-table :data="tableData" v-loading="loading" class="dark-table" style="width: 100%">
            <el-table-column prop="templateCode" label="系统内部编码" width="180">
                <template #default="scope">
                    <el-input v-if="scope.row.isEdit" v-model="scope.row.templateCode" size="small" class="dark-input"/>
                    <span v-else class="code-text">{{ scope.row.templateCode }}</span>
                </template>
            </el-table-column>

            <el-table-column prop="title" label="模板名称" width="180" />

            <el-table-column prop="msgType" label="通道类型" width="120">
                <template #default="scope">
                    <el-tag :type="scope.row.msgType === 'WECHAT' ? 'success' : 'info'" effect="dark">
                        {{ scope.row.msgType }}
                    </el-tag>
                </template>
            </el-table-column>

            <el-table-column prop="templateId" label="微信官方TemplateID" show-overflow-tooltip />

            <el-table-column prop="content" label="模板结构内容" show-overflow-tooltip>
                <template #default="scope">
                    <pre class="content-preview">{{ scope.row.content }}</pre>
                </template>
            </el-table-column>

            <el-table-column label="操作" width="150">
                <template #default="scope">
                    <el-button v-if="!scope.row.isEdit" type="text" class="edit-link" @click="scope.row.isEdit = true">编辑Code</el-button>
                    <el-button v-else type="text" class="save-link" @click="handleSave(scope.row)">保存</el-button>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Refresh } from '@element-plus/icons-vue';
import {listTemplate, syncTemplate, updateTemplate} from "../../api/system.ts";

interface TemplateItem {
    id: number;
    templateCode: string;
    templateId: string;
    title: string;
    content: string;
    msgType: string;
    isEdit?: boolean;
}

const tableData = ref<TemplateItem[]>([]);
const loading = ref(false);
const syncLoading = ref(false);

// 加载列表
const loadTemplates = async () => {
    loading.value = true;
    try {
        const res = await listTemplate();
        tableData.value = res.data.map((item: TemplateItem) => ({ ...item, isEdit: false }));
    } catch (err) {
        ElMessage.error('加载本地模板失败');
    } finally {
        loading.value = false;
    }
};

// 同步微信侧模板
const handleSyncWechat = async () => {
    syncLoading.value = true;
    try {
        const res = await syncTemplate();
        ElMessage.success(res.data || '同步成功');
        loadTemplates();
    } catch (err) {
        ElMessage.error('微信侧同步发生异常');
    } finally {
        syncLoading.value = false;
    }
};

// 保存本地编辑
const handleSave = async (row: TemplateItem) => {
    try {
        await updateTemplate(row);
        ElMessage.success('配置更新成功');
        row.isEdit = false;
    } catch (err) {
        ElMessage.error('保存失败');
    }
};

onMounted(() => {
    loadTemplates();
});
</script>

<style scoped>
.jcloud-container {
    color: #e0e0e0;
    padding: 24px;
    min-height: 100vh;
}
.header-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    border-bottom: 1px solid #262626;
    padding-bottom: 16px;
}
.title {
    font-weight: 400;
    text-shadow: 0 0 8px rgba(0, 255, 204, 0.3);
}
.tech-btn {
    background: linear-gradient(45deg, #0055ff, #00ffcc);
    border: none;
    color: #fff;
}
.dark-table {
    color: #b3b3b3;
}
.code-text {
    font-family: 'Courier New', Courier, monospace;
    color: #ff9900;
}
.content-preview {
    font-size: 11px;
    color: #888;
    margin: 0;
}
.edit-link { color: #0077ff; }
.save-link { color: #00ffcc; }
</style>