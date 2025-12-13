<template>
    <div class="container">
        <div class="plugins-tips">
            wangEditor：轻量级 web 富文本编辑器，配置方便，使用简单。 访问地址：
            <a href="https://www.wangeditor.com/doc/" target="_blank">wangEditor</a>
        </div>
        <div style="border: 1px solid #ccc; margin-bottom: 10px">
            <Toolbar style="border-bottom: 1px solid #ccc" :editor="editorRef" :defaultConfig="toolbarConfig" />
            <Editor
                style="height: 500px; overflow-y: hidden"
                v-model="valueHtml"
                :defaultConfig="editorConfig"
                @onCreated="handleCreated"
                @onChange="handleChange"
            />
        </div>
        <el-button type="primary" @click="syncHTML">提交</el-button>
    </div>
</template>

<script setup lang="ts" name="editor">
import '@wangeditor/editor/dist/css/style.css'; // 引入 css
import {onBeforeUnmount, shallowRef, onMounted, watch} from 'vue';
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'

// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef();

const props = defineProps<{
    modelValue: string          // 接收父组件传来的内容
}>()
const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void
}>()
// 内容 HTML
// const valueHtml = ref('<p>hello</p>');

const valueHtml = shallowRef<string>(props.modelValue || '<p></p>')

// 模拟 ajax 异步获取内容
onMounted(() => {
    setTimeout(() => {
        valueHtml.value = '<p>模拟 Ajax 异步设置内容</p>';
    }, 1500);
});

const toolbarConfig = {};
const editorConfig = {
    placeholder: '请输入内容...',
    MENU_CONF: {}
};

// 【关键1】监听父组件传入的内容变化（支持父组件主动设置）
watch(() => props.modelValue, (newVal) => {
    if (newVal !== valueHtml.value) {
        valueHtml.value = newVal || ''
    }
})

// 【关键2】编辑器内容变化 → 通知父组件
const handleChange = (editor: any) => {
    const html = editor.getHtml()
    valueHtml.value = html
    emit('update:modelValue', html)   // ← 这一行最重要！
}

// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
    const editor = editorRef.value;
    if (editor == null) return;
    editor.destroy();
});

const handleCreated = (editor: any) => {
    editorRef.value = editor; // 记录 editor 实例，重要！
};
// 关键：监听内容变化，手动同步到 valueHtml（v-model 在新版中依赖这个）

const syncHTML = () => {
    console.log(valueHtml.value);
};
</script>

<style></style>
