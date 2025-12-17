<!-- MarkdownPreview.vue -->
<script setup lang="ts">
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'

const md = new MarkdownIt({
    highlight: (str:any, lang:any) => {
        if (lang && hljs.getLanguage(lang)) {
            return hljs.highlight(str, { language: lang }).value
        }
        return ''
    }
})

defineProps<{
    content: string
}>()
</script>

<template>
    <div v-html="md.render(content)" class="markdown-body"></div>
</template>

<style>
.markdown-body pre code { background: #f6f8fa; padding: 16px; border-radius: 6px; }
</style>