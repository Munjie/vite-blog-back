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
                <MdEditor v-model="content" :on-upload-img="onUploadImg"/>
            </el-form-item>
        </el-form>
    </el-card>
</template>
<script setup lang="ts">
import {ref, onMounted} from 'vue'
import MdEditor from "md-editor-v3";
import "md-editor-v3/lib/style.css";
import {ElMessage} from "element-plus";
import {addArticle, deleteCoverImage, getAllTags, getAllCategory, getArticle} from "../../api/article.ts";
import router from "../../router";
import {ElDialog, ElIcon} from 'element-plus'
import {Plus} from '@element-plus/icons-vue'
import axios from 'axios'
import {useRoute} from 'vue-router'

const route = useRoute()
// 文章数据
const id = ref(null)
const title = ref('')
const summary = ref('')
const content = ref('')
const articleId = ref()
const loading = ref(false)
const selectedTags = ref()
const selectedCategory = ref<string | number>('')
const tagOptions = ref()
const categoryOptions = ref()
const submitAll = async () => {
    loading.value = true
    try {
        let articleForm = {
            id: route.query.articleId,
            title: title.value,
            content: content.value,
            articleCover: articleCover.value,
            tags: selectedTags.value,
            category: selectedCategory.value,
            introduction: summary.value
        }
        await addArticle(articleForm);
        ElMessage.success('新增成功')
        await router.push('/article-list');
    } catch (error) {
        ElMessage.error('新增失败,请重试')
    } finally {
        loading.value = false
    }
}
// 封面图上传处理
const articleCover = ref<string>('')

// 文件列表
const fileList = ref<Array<{ name: string; url: string }>>([])

// 预览相关
const previewVisible = ref(false)
const previewUrl = ref('')


// 新增：图片上传处理函数（支持多图、拖拽、粘贴）
const onUploadImg = async (files: File[], callback: (urls: string[]) => void) => {
    // 并行上传，提高速度
    const uploadPromises = files.map(async (file) => {
        try {
            const formData = new FormData()
            formData.append('file', file)
            const res = await axios.post('/api/back/upload-cover', formData, {
                headers: {'Content-Type': 'multipart/form-data'}
            })
            if (!res.data.data) {
                throw new Error('上传成功但未返回有效 URL')
            }
            return res.data.data;
        } catch (err) {
            console.error('图片上传失败:', err)
            ElMessage.error(`图片 "${file.name}" 上传失败`)
            return ''
        }
    })
    try {
        const urls = await Promise.all(uploadPromises)
        const validUrls = urls.filter(url => url)
        if (validUrls.length > 0) {
            ElMessage.success('图片上传成功')
        }
        // 回调插入图片 Markdown 语法（会自动加上 alt 文本，通常是文件名）
        callback(validUrls)
    } catch {
        ElMessage.error('批量上传图片出错')
    }
}

// 处理预览
const handlePreview = (file: any) => {
    previewUrl.value = file.url
    previewVisible.value = true
}

// 处理移除
const handleRemove = async () => {
    if (articleCover.value) {
        try {
            await deleteCoverImage(articleCover.value)
            ElMessage.success('封面图片已删除')
        } catch (err) {
            ElMessage.error('删除服务器图片失败，可手动清理')
            console.error(err)
        }
    }
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
    formData.append('file', options.file)
    try {
        const res = await axios.post('/api/back/upload-cover', formData, {
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


onMounted(async () => {
    articleId.value = route.query.articleId
    if (articleId.value) {
        const article = getArticle(articleId.value);
        let data = (await article).data;
        title.value = data.title;
        summary.value = data.introduction;
        content.value = data.content;
        if (data.image) {
            fileList.value = [{name: 'cover', url: data.image}]
            articleCover.value = data.image
        }
    } else {
        const res = await getAllTags();
        tagOptions.value = (res as any).data.map((item: any) => ({
            label: item.name,
            value: item.id
        }))
        const response = await getAllCategory()
        categoryOptions.value = (response as any).data.map((item: any) => ({
            label: item.name,
            value: item.id
        }))
    }
})
</script>


<style lang="scss" scoped>
.card {
  height: calc(100vh - 110px);
  overflow: hidden;
}


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