<template>
    <el-card shadow="never" class="card">
        <template #header>
            <div class="card-header-wrapper">
                <div class="card-header-title">新增文章</div>
                <el-button
                    class="publish-btn"
                    type="primary"
                    size="small"
                    :loading="loading"
                    @click="submitAll"
                >
                    保存
                </el-button>
                <el-button type="primary" @click="aiVisible = true">
                    <el-icon><ChatDotRound /></el-icon>
                    AI助手
                </el-button>
                <!-- 全局 AI 助手对话框 -->
                <AiAssistantDialog v-model:visible="aiVisible" />
            </div>
        </template>

        <el-form ref="articleFormRef" :inline="true" class="bg-bg_color w-[99/100] h-[100%]" label-width="120">
            <el-form-item style="width: 65%" label-width="80" label="文章标题" prop="article_title">
                <el-input v-model="title" placeholder="请输入文章标题" clearable maxlength="55"/>
            </el-form-item>
            <el-form-item
                    style="width: 65%"
                    label-width="80"
                    label="文章摘要"
                    prop="article_summary"
            >
                <el-input
                        v-model="summary"
                        type="textarea"
                        :rows="3"
                        placeholder="请简要概括文章核心内容"
                        maxlength="150"
                        show-word-limit
                />
            </el-form-item>
            <el-form-item style="width: 25%">
            </el-form-item>
            <el-form-item style="width: 65%" label-width="80" label="文章标签" prop="tags">
                <el-select v-model="selectedTags" multiple filterable allow-create default-first-option
                           :reserve-keyword="false" placeholder="请选择或输入新标签" style="width: 100%">
                    <el-option v-for="item in tagOptions" :key="item.value" :label="item.label" :value="item.label"/>
                </el-select>
            </el-form-item>
            <el-form-item style="width: 65%" label-width="80" label="文章分类" prop="category">
                <el-select v-model="selectedCategory" placeholder="请选择文章分类" style="width: 100%">
                    <el-option v-for="item in categoryOptions" :key="item.value" :label="item.label"
                               :value="item.label"/>
                </el-select>
            </el-form-item>

            <el-form-item style="width: 65%" label-width="80" label="文章封面" prop="articleCover">
                <el-upload class="upload-demo" list-type="picture-card" :limit="1" :file-list="fileList"
                           :on-preview="handlePreview" :on-remove="handleRemove" :on-exceed="handleExceed"
                           :http-request="customUpload" :on-success="handleUploadSuccess" :on-error="handleUploadError"
                           accept="image/*">
                    <el-icon class="plus-icon">
                        <Plus/>
                    </el-icon>
                </el-upload>
                <el-dialog v-model="previewVisible" title="预览">
                    <img :src="previewUrl" style="width: 100%"/>
                </el-dialog>
            </el-form-item>
            <el-form-item style="width: 100%; height: auto" prop="article_content">
                <MdEditor v-model="content"/>
            </el-form-item>
        </el-form>
    </el-card>
</template>
<script setup lang="ts">
import {ref, onMounted} from 'vue'
import MdEditor from "md-editor-v3";
import "md-editor-v3/lib/style.css";
import {ElMessage} from "element-plus";
import {addArticle, deleteCoverImage, getAllTags, getAllCategory} from "../../api/article.ts";
import router from "../../router";
import AiAssistantDialog from '@/components/AiChatView.vue';
import {ElDialog, ElIcon} from 'element-plus'
import {Plus} from '@element-plus/icons-vue'
import axios from 'axios'

const aiVisible = ref(false)
// 文章数据
const title = ref('')
const summary = ref('')

const content = ref('')
const loading = ref(false)

// --- 标签相关 (新增) ---
const selectedTags = ref()// 选中的标签数组
const selectedCategory = ref<string | number>('') // 选中的分类
const tagOptions = ref()
const categoryOptions = ref()
const submitAll = async () => {
    loading.value = true
    try {
        let articleForm = {
            title: title.value,
            content: content.value,
            articleCover: articleCover.value,
            tags: selectedTags.value,
            category: selectedCategory.value,
            introduction: summary.value
        }
        await addArticle(articleForm);
        ElMessage.success('新增成功')
        router.replace('/article-list');


    } catch (error) {
        ElMessage.error('新增失败,请重试')
    } finally {
        loading.value = false
    }
}
// 封面图上传处理
// 表单数据（假设你的文章表单 ref 为 formRef，字段为 articleCover 存储图片 URL）
const articleCover = ref<string>('')  // 最终保存到文章的封面 URL

// 文件列表（用于显示已上传的图片，编辑时可回显）
const fileList = ref<Array<{ name: string; url: string }>>([])

// 预览相关
const previewVisible = ref(false)
const previewUrl = ref('')

// 处理预览（点击已上传图片）
const handlePreview = (file: any) => {
    previewUrl.value = file.url
    previewVisible.value = true
}

// 处理移除（关键修改）
const handleRemove = async () => {
    // 如果当前有封面 URL，才需要删除服务器文件
    if (articleCover.value) {
        try {
            await deleteCoverImage(articleCover.value)
            ElMessage.success('封面图片已删除')
        } catch (err) {
            ElMessage.error('删除服务器图片失败，可手动清理')
            console.error(err)
            // 即使删除失败，也继续清除前端显示（避免用户卡住）
        }
    }
    // 清空表单字段和文件列表
    articleCover.value = ''
    fileList.value = []
}

// 超出限制
const handleExceed = () => {
    ElMessage.warning('只能上传一张封面图片')
}

// 自定义上传（覆盖默认行为）
const customUpload = async (options: any) => {
    const formData = new FormData()
    formData.append('file', options.file)  // 后端接收参数名为 file
    try {
        const res = await axios.post('/api/article/upload-cover', formData, {
            headers: {'Content-Type': 'multipart/form-data'}
        })
        return res.data.data
    } catch (err) {
        throw err
    }
}

// 上传成功
const handleUploadSuccess = (response: any) => {
    articleCover.value = response  // 保存返回的图片访问 URL 到表单
    ElMessage.success('封面上传成功')
}

// 上传失败
const handleUploadError = (err: any) => {
    ElMessage.error('封面上传失败：' + err.message)
}

// 如果是编辑文章，回显已有封面时可以这样初始化 fileList
// onMounted(() => {
//   if (props.article?.articleCover) {
//     fileList.value = [{ name: 'cover', url: props.article.articleCover }]
//     articleCover.value = props.article.articleCover
//   }
// })
onMounted(async () => {
    const res = await getAllTags()
    // tagOptions.value = res.data.map(tag => ({ value: tag.id, label: tag.name }))
    tagOptions.value = (res as any).data.map((item: any) => ({
        label: item.name,
        value: item.id
    }))
    const response = await getAllCategory()
    categoryOptions.value = (response as any).data.map((item: any) => ({
        label: item.name,
        value: item.id
    }))
})
</script>


<style lang="scss" scoped>
.card {
  height: calc(100vh - 110px);
  overflow: hidden;
}

/*.publish-btn {
  !*  display: flex;
    align-items: center;
    flex-wrap: nowrap;*!
  padding-right: 10px;
  margin-bottom: 20px;
}*/

.flex_r {
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
}

.form-item {
  &45 {
    width: 45%;
    font-weight: bold;
  }

  &100 {
    width: 100%;
    font-weight: bold;
  }
}

:deep(.el-select-dropdown__item) {
  padding: 0 5px;
}

:deep(.el-dialog.is-fullscreen) {
  width: 800px;
  overflow-y: auto;
  overflow-x: hidden;
}

:deep(.el-dialog__footer) {
  position: absolute;
  bottom: 0;
  right: 5%;
}

.md-editor {
  height: calc(100vh - 260px);
}

.article-cover {
  :deep(.el-form-item__content) {
    width: 260px !important;
    height: 150px !important;
  }

  :deep(.el-upload-list__item) {
    width: 260px !important;
    height: 150px !important;
    margin: 0 !important;
    border: none !important;
  }

  :deep(.el-upload--picture-card) {
    width: 260px !important;
    height: 150px !important;
  }

  :deep(.el-upload-list--picture-card) {
    width: 260px !important;
    height: 150px !important;
    margin: 0 !important;
    border: none !important;
  }
}

.plus-icon {
  font-size: 28px;
  color: #8c939d;
}

:deep(.el-upload-list--picture-card .el-upload-list__item) {
  width: 148px;
  height: 148px;
}

:deep(.el-upload--picture-card) {
  width: 148px;
  height: 148px;
  line-height: 148px;
}

.card-header-wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.card-header-title {
    font-size: 16px;
    font-weight: 600;
}

.publish-btn {
    /* 可选：保证按钮不被压缩 */
    flex-shrink: 0;
}

</style>