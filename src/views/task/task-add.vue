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

            <div class="section-title">2.标题信息</div>

            <el-row :gutter="20">

                    <el-col :span="8">
                        <el-form-item label="学年">
                            <div style="display: flex; align-items: center;">
                                <el-date-picker
                                    v-model="form.startYear"
                                    type="year"
                                    placeholder="选择起始年份"
                                    format="YYYY"
                                    value-format="YYYY"
                                    :clearable="false"
                                    style="width: 120px"
                                />
                                <span class="year-suffix-inline" v-if="form.startYear">
          - {{ Number(form.startYear!) + 1 }} 学年度
        </span>
                            </div>
                        </el-form-item>
                    </el-col>
                <el-col :span="8">
                    <el-form-item label="学期">
                        <el-select v-model="form.semester" style="width: 100%">
                            <el-option label="第一学期" value="第一学期" />
                            <el-option label="第二学期" value="第二学期" />
                        </el-select>
                    </el-form-item>
                </el-col>

                <el-col :span="8">
                    <el-form-item label="考试类型">
                        <el-select v-model="form.examType" style="width: 100%">
                            <el-option label="期末" value="期末" />
                            <el-option label="期中" value="期中" />
                            <el-option label="月考" value="月考" />
                        </el-select>
                    </el-form-item>
                </el-col>
            </el-row>

            <el-alert
                v-if="fullTitle"
                :title="`当前生成的标题：${fullTitle}`"
                type="info"
                :closable="false"
                show-icon
                style="margin-bottom: 20px"
            />

            <div class="section-title">2. 上传Excel文件(支持多选)</div>

            <el-form-item label="上传附件">
                <el-upload
                    ref="uploadRef"
                    v-model:file-list="fileList"
                    action="#"
                    multiple
                    :auto-upload="false"
                    :limit="50"
                    :on-exceed="handleExceed"
                    accept=".xlsx, .xls"
                    drag
                >
                    <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                    <div class="el-upload__text">
                       拖拽文件到此处或<em>点击上传</em>
                    </div>
                    <template #tip>
                        <div class="el-upload__tip">
                            支持.xlsx/.xls格式,单次最多上传50个文件, 文件名是学生成绩和试题分析的文件
                        </div>
                    </template>
                </el-upload>
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
import { UploadFilled } from '@element-plus/icons-vue'
import { ElMessage, type UploadUserFile, type UploadInstance, type UploadProps } from 'element-plus'
import axios from 'axios' // 假设你使用 axios

import router from "../../router";
// Upload 实例 ref (用于操作清空等)
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
    // 1. 校验
    if (!form.startYear) {
        ElMessage.error('请选择学年')
        return
    }
    if (fileList.value.length === 0) {
        ElMessage.warning('请至少上传一个 Excel 文件')
        return
    }

    loading.value = true

    try {
        // 2. 构建 FormData 对象 (用于同时传输文件和文本)
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
        // const res = await uploadTask(formData);
        // 3. 发送请求 (模拟 axios)
        const res = await axios.post('/api/task/create-score-task', formData, {
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