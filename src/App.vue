<template>
    <el-config-provider :locale="zhCn">
        <router-view v-slot="{ Component, route }">
            <transition name="fade-transform" mode="out-in">
                <keep-alive :include="cachedViews">
                    <component :is="Component" :key="route.path" />
                </keep-alive>
            </transition>
        </router-view>
    </el-config-provider>
</template>

<script setup lang="ts">
import { ElConfigProvider } from 'element-plus';
import zhCn from 'element-plus/es/locale/lang/zh-cn';

import { computed } from 'vue';
import { useTagsViewStore } from './stores/tagsView.ts';
const tagsViewStore = useTagsViewStore();
const cachedViews = computed(() =>
    tagsViewStore.visitedViews.map(v => v.name as string)
);
</script>
<style>
@import './assets/css/main.css';
</style>

