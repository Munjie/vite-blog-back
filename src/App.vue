<template>
    <el-config-provider :locale="zhCn">
        <router-view />
    </el-config-provider>
    <AiAssistantDialog />
</template>

<script setup lang="ts">
import { ElConfigProvider } from 'element-plus';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import AiAssistantDialog from '@/components/AiChatView.vue';
</script>
<style>
@import './assets/css/main.css';
</style>
