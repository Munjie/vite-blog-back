<template>
    <div class="tags-view-container">
        <el-scrollbar class="tags-view-wrapper">
            <router-link
                    v-for="tag in tagsViewStore.visitedViews"
                    :key="tag.path"
                    :to="{ path: tag.path, query: tag.query }"
                    class="tag-item"
                    :class="{ active: isActive(tag) }"
            >
                {{ tag.meta?.title }}
                <el-icon
                        v-if="!tag.meta?.affix"
                        class="close-icon"
                        @click.prevent.stop="closeSelectedTag(tag)"
                >
                    <Close />
                </el-icon>
            </router-link>
        </el-scrollbar>
    </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { useTagsViewStore } from '../stores/tagsView.ts';
import {Close} from "@element-plus/icons-vue";
const route = useRoute();
const router = useRouter();
const tagsViewStore = useTagsViewStore();

const isActive = (tag: any) => tag.path === route.path;

const closeSelectedTag = (view: any) => {
    tagsViewStore.delView(view.path);
    if (isActive(view)) {
        const lastView = tagsViewStore.visitedViews.slice(-1)[0];
        if (lastView) {
            router.push(lastView.path);
        } else {
            router.push('/');
        }
    }
};
</script>

<style scoped>
.tags-view-container {
    height: 34px;
    width: 100%;
    background: #fff;
    border-bottom: 1px solid #d8dce5;
}
.tag-item {
    display: inline-block;
    height: 26px;
    line-height: 26px;
    border: 1px solid #d8dce5;
    color: #495060;
    background: #fff;
    padding: 0 8px;
    font-size: 12px;
    margin-left: 5px;
    margin-top: 4px;
    text-decoration: none;
}
.tag-item.active {
    background-color: #409eff;
    color: #fff;
    border-color: #409eff;
}
.close-icon {
    width: 16px;
    height: 16px;
    vertical-align: -3px;
    border-radius: 50%;
    text-align: center;
    transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
}
.close-icon:hover {
    background-color: #b4bccc;
    color: #fff;
}


</style>