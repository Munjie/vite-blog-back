
<template>
    <div class="wrapper">
        <Header />
        <Sidebar />
        <div class="content-box" :class="{ 'content-collapse': sidebar.collapse }">
            <div class="content">
                <Navbar />
                <TagsView />
                <RouterView></RouterView>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { useSidebarStore } from '../../stores/sidebar';
const sidebar = useSidebarStore();
import { useTagsViewStore } from '../../stores/tagsView.ts';
const tagsViewStore = useTagsViewStore();
import { watch } from 'vue';
import { useRoute } from 'vue-router';
const route = useRoute();
watch(
    () => route.path,
    () => {
        tagsViewStore.addView(route);
    },
    { immediate: true }
);
</script>

<style>
.wrapper {
    height: 100vh;
    overflow: hidden;
}
.content-box {
    position: absolute;
    left: 250px;
    right: 0;
    top: 70px;
    bottom: 0;
    padding-bottom: 30px;
    -webkit-transition: left 0.3s ease-in-out;
    transition: left 0.3s ease-in-out;
    background: #eef0fc;
    overflow: hidden;
}

.content {
    width: auto;
    height: 100%;
    padding: 20px;
    overflow-y: scroll;
    box-sizing: border-box;
}

.content::-webkit-scrollbar {
    width: 0;
}

.content-collapse {
    left: 65px;
}
</style>


