
<template>
    <el-card shadow="never" class="card">
        <template #header>
            <div class="card-header">新增文章</div>
        </template>
        <el-form
            ref="articleFormRef"
            :inline="true"
            class="bg-bg_color w-[99/100] h-[100%]"
            label-width="120"
        >
            <el-form-item
                style="width: 65%"
                label-width="80"
                label="文章标题"
                prop="article_title"
            >
                <el-input
                    v-model="title"
                    placeholder="请输入文章标题"
                    clearable
                    maxlength="55"
                />
            </el-form-item>
            <el-form-item style="width: 25%">
                <div class="publish-btn">
                    <el-button
                        type="primary"
                        size="small"
                        :loading="loading"
                        @click="submitAll"
                    >发布文章
                    </el-button>
                </div>
            </el-form-item>
            <el-form-item style="width: 100%; height: auto" prop="article_content">
                <MdEditor
                    v-model="content"
                />
            </el-form-item>
        </el-form>
    </el-card>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import  MdEditor  from "md-editor-v3";
import "md-editor-v3/lib/style.css";
import {ElMessage} from "element-plus";
import {addArticle} from "../../api/article.ts";
// 文章数据
const title = ref('')
// const coverUrl = ref('') // 封面图地址
const content = ref('')
const indexImage = ref('')

const loading = ref(false)
const submitAll = async () => {
    loading.value = true
    try {
        let articleForm = {
            title: title.value,
            content: content.value,
            indexImage: indexImage.value
        }
        const res = await addArticle(articleForm);
        if (res.code === 200) {
          /*  await router.push({
                path: '/article-view',
                query: {
                    id: res.data
                }
            });*/
        }

    } catch (error) {
        ElMessage.error('新增失败,请重试')
    } finally {
        loading.value = false
    }
}
// 封面图上传处理
/*const handleCoverUpload = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return

    // 简单校验
    if (!file.type.startsWith('image/')) {
        alert('请上传图片文件')
        return
    }

    const reader = new FileReader()
    reader.onload = (ev) => {
        coverUrl.value = ev.target?.result as string
    }
    reader.readAsDataURL(file)
}*/

// 拖拽上传封面
/*const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer?.files[0]
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (ev) => {
            coverUrl.value = ev.target?.result as string
        }
        reader.readAsDataURL(file)
    }
}*/
/*const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
}*/

// 如果你有真实上传接口，可替换这里
// const uploadCover = async (file: File): Promise<string> => {
//   const form = new FormData()
//   form.append('file', file)
//   const res = await fetch('/api/upload-cover', { method: 'POST', body: form })
//   const { url } = await res.json()
//   return url
// }
</script>
<style lang="scss" scoped>
.card {
    height: calc(100vh - 110px);
    overflow: hidden;
}
.publish-btn {
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
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
</style>
