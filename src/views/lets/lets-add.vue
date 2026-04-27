<template>
    <el-card class="upload-card">
        <template #header>
            <div class="card-header">
                <span>新增上传</span>
            </div>
        </template>
        <el-form :model="form" label-width="100px">
            <div class="section-title">1.任务名称</div>
            <el-form-item label="任务名称">
                <el-input
                    v-model="form.taskName"
                    placeholder="随便填"
                    clearable
                />
            </el-form-item>
            <el-form-item>
                <el-button
                    type="primary"
                    :loading="loading"
                    @click="submitAll"
                >
                    确定
                </el-button>
                <el-button @click="resetForm"    type="warning" >重置</el-button>
            </el-form-item>

        </el-form>
    </el-card>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { ElMessage, type UploadUserFile, type UploadInstance, type UploadProps } from 'element-plus'
import axios from 'axios'

import router from "../../router";
const uploadRef = ref<UploadInstance>()
// 文件列表
const fileList = ref<UploadUserFile[]>([])
// Loading 状态
const loading = ref(false)

// 表单数据
const form = reactive({
    taskName: '',
    startYear: new Date().getFullYear().toString(),
    semester: '第一学期',
    examType: '期末'
});

// --- 2. 核心计算逻辑 (标题生成) ---
const fullTitle = computed(() => {
    if (!form.startYear) return ''
    const endYear = Number(form.startYear) + 1
    return `${form.startYear}-${endYear}学年度${form.semester}${form.examType}考试成绩质量分析表`
})

// --- 3. 文件处理逻辑 ---
// 当文件超出限制时的回调
const handleExceed: UploadProps['onExceed'] = (files) => {
    ElMessage.warning(`最多只能选择50个文件，你当前选择了 ${files.length} 个文件。`)
}

// --- 4. 提交逻辑 (FormData) ---
const submitAll = async () => {
    loading.value = true
    try {
        const formData = new FormData()
        let infoForm = {
            taskName: form.taskName,
            title: fullTitle.value
        }
        formData.append('info', new Blob([JSON.stringify(infoForm)], {type: "application/json"}));


        fileList.value.forEach((file) => {
            if (file.raw) {
                formData.append('files', file.raw)
            }
        })
        const res = await axios.post('/api/score-manage/create-score-task', formData, {
          headers: {
            'Content-Type': 'multipart/form-data' // 必须指定
          }
        })
        if (res.data.code === 200) {
            ElMessage.success(res.data.data)
            try {
                resetForm();
            } catch (e) {
                console.error("重置表单失败", e);
            }
            await router.replace('/task-list');
        }else {
            ElMessage.error(res.data.message)
        }
    } catch (error) {
        console.error(error)
        ElMessage.error('上传失败，请重试')
    } finally {
        loading.value = false
    }
}

// 重置表单
const resetForm = () => {
    form.startYear = new Date().getFullYear().toString()
    form.semester = '第一学期'
    form.examType = '期末'
    fileList.value = [] // 清空文件数组
    uploadRef.value?.clearFiles() // 清空 UI 显示的文件
}
</script>

<style scoped>
.upload-card {
    max-width: 900px;
    margin: 20px auto;
}

.section-title {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 20px;
    border-left: 4px solid #409eff;
    padding-left: 10px;
    line-height: 1;
}

.year-hint {
    font-size: 12px;
    color: #909399;
    position: absolute;
    top: 100%;
    left: 0;
    line-height: 1.2;
    margin-top: 4px;
}

.section-title {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 20px;
    border-left: 4px solid #409eff;
    padding-left: 10px;
    line-height: 1;
}

/* 新增或替换之前的 year-hint 样式 */
.year-suffix-inline {
    /* 确保文本靠在输入框右侧 */
    margin-left: 8px;
    /* 调整字体，使其看起来清晰 */
    color: #606266;
    font-weight: bold;
    white-space: nowrap; /* 确保不自动换行 */
}
</style>