

<template>
    <div class="article-editor-container">
        <el-card shadow="never" class="editor-card">
            <template #header>
                <div class="card-header">
                    <h2>发布文章</h2>
                </div>
            </template>

            <el-form label-width="80px" label-position="top">
                <!-- 标题 -->
                <el-form-item label="文章标题" required>
                    <el-input
                            v-model="title"
                            placeholder="请输入文章标题（建议 6-40 个字）"
                            size="large"
                            clearable
                    />
                </el-form-item>

                <!-- 封面图 -->
                <el-form-item label="文章封面" required>
                    <div
                            class="cover-uploader"
                            @drop="handleDrop"
                            @dragover="handleDragOver"
                            :class="{ 'has-cover': coverUrl }"
                    >
                        <input
                                type="file"
                                accept="image/*"
                                class="file-input"
                                @change="handleCoverUpload"
                        />

                        <!-- 有封面时显示预览 -->
                        <div v-if="coverUrl" class="cover-preview">
                            <img :src="coverUrl" alt="封面预览" />
                            <div class="mask">
                                <el-icon size="24"><UploadFilled /></el-icon>
                                <span>替换封面</span>
                            </div>
                        </div>

                        <!-- 无封面时显示提示 -->
                        <div v-else class="upload-hint">
                            <el-icon size="48" color="#c0c4cc"><Picture /></el-icon>
                            <p>点击或拖拽上传封面图</p>
                            <span>建议尺寸 800×450px，JPG/PNG</span>
                        </div>
                    </div>
                </el-form-item>

                <!-- 富文本编辑器 -->
                <el-form-item label="文章正文" required>
                    <WangEditor v-model="content" :height="600" />
                </el-form-item>
            </el-form>
        </el-card>

        <!-- 实时预览区 -->
        <el-card shadow="never" class="preview-card" style="margin-top: 24px">
            <template #header>
                <h3>实时预览</h3>
            </template>

            <div class="preview-content">
                <h1 class="preview-title">{{ title || '请填写文章标题' }}</h1>
                <img
                        v-if="coverUrl"
                        :src="coverUrl"
                        class="preview-cover"
                        alt="文章封面"
                />
                <div class="preview-body" v-html="content"></div>
            </div>
        </el-card>
    </div>

</template>
<script setup lang="ts">
import { ref } from 'vue'
import WangEditor from '../pages/editor.vue'

// 文章数据
const title = ref('')
const coverUrl = ref('') // 封面图地址
const content = ref('')

// 封面图上传处理
const handleCoverUpload = (e: Event) => {
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
}

// 拖拽上传封面
const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer?.files[0]
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (ev) => {
            coverUrl.value = ev.target?.result as string
        }
        reader.readAsDataURL(file)
    }
}
const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
}

// 如果你有真实上传接口，可替换这里
// const uploadCover = async (file: File): Promise<string> => {
//   const form = new FormData()
//   form.append('file', file)
//   const res = await fetch('/api/upload-cover', { method: 'POST', body: form })
//   const { url } = await res.json()
//   return url
// }
</script>

<style scoped>
.article-editor-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 20px;
    display: grid;
    grid-template-columns: 1fr 420px;
    gap: 24px;
}

.editor-card {
    height: fit-content;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

/* 封面上传样式 */
.cover-uploader {
    width: 100%;
    height: 200px;
    border: 2px dashed #d9d9d9;
    border-radius: 8px;
    position: relative;
    overflow: hidden;
    background: #fafafa;
    cursor: pointer;
    transition: all 0.3s;
}

.cover-uploader:hover {
    border-color: #409eff;
    background: #f5faff;
}

.cover-uploader.has-cover:hover .mask {
    opacity: 1;
}

.file-input {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
    z-index: 2;
}

.upload-hint {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #999;
    font-size: 14px;
}

.cover-preview {
    width: 100%;
    height: 100%;
}

.cover-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.mask {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    color: white;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s;
}

/* 预览区 */
.preview-card {
    position: sticky;
    top: 20px;
    height: fit-content;
}

.preview-content {
    padding: 10px;
}

.preview-title {
    margin: 0 0 20px 0;
    font-size: 28px;
    color: #1a1a1a;
    text-align: center;
}

.preview-cover {
    width: 100%;
    border-radius: 8px;
    margin-bottom: 24px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.preview-body :deep(img) {
    max-width: 100%;
    border-radius: 4px;
}

.preview-body :deep(pre) {
    background: #f6f8fa;
    padding: 16px;
    border-radius: 6px;
    overflow-x: auto;
}

/* 响应式 */
@media (max-width: 1200px) {
    .article-editor-container {
        grid-template-columns: 1fr;
    }
    .preview-card {
        position: static;
    }
}
</style>