
<script setup lang="ts">
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'

const md = new MarkdownIt({
    highlight: (str: any, lang: any) => {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return '<pre class="hljs"><code>' +
                    hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
                    '</code></pre>'
            } catch (__) {}
        }
        return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>'
    }
} as any)

defineProps<{
    content: string
}>()
</script>

<template>
    <div v-html="md.render(content)" class="markdown-body"></div>
</template>

<style scoped>
.markdown-body pre {
    border-radius: 6px;
    padding: 16px;
}

/* 确保整体容器背景透明或暗色，与聊天框融合 */
.markdown-body {
    background-color: transparent;
    color: #f0f6fc;  /* 浅色文本，如果没引入 github-markdown-dark */
    padding: 16px;
}
</style>