<template>
    <div class="sidebar">
        <el-menu
            class="sidebar-el-menu"
            :default-active="onRoutes"
            :collapse="sidebar.collapse"
            :background-color="sidebar.bgColor"
            :text-color="sidebar.textColor"
            router
        >
            <el-menu-item
                v-for="it in noChilden"
                :key="it.index"
                :index="it.index"
            >
                <el-icon>
                    <component :is="it.icon"></component>
                </el-icon>
                    <span>{{ it.title }}</span>
            </el-menu-item>
            <!-- 渲染有子菜单的项 -->
            <el-sub-menu
                v-for="item in hasChilden"
                :key="item.index"
                :index="item.index"
            >
                <template #title>
                    <el-icon>
                        <component :is="item.icon"></component>
                    </el-icon>
                    <span>{{ item.title }}</span>
                </template>
                <el-menu-item
                    v-for="subItem in item.children"
                    :key="subItem.index"
                    :index="subItem.index"
                >
                    <span>{{ subItem.title }}</span>
                </el-menu-item>
            </el-sub-menu>
        </el-menu>
    </div>
</template>

<script setup lang="ts">
import {computed, onMounted, ref} from 'vue';
import { useSidebarStore } from '../stores/sidebar';
import { useRoute } from 'vue-router';
import {useUserStore} from '../stores';
import type {Menus} from "../types/menu.ts";
import {getUserMenu} from "../api/menu.ts";


const store = useUserStore();

const route = useRoute();
const onRoutes = computed(() => {
    return route.path;
});

const sidebar = useSidebarStore();
const menuData = ref<Menus[]>([]);
onMounted(async () => {
    const menus: Menus[] = await getUserMenu(store.getUserid)
    store.setMenus(menus)
    menuData.value = menus;
});
const noChilden = computed(() => {
    return menuData.value.filter(item => !item.children || item.children.length === 0);
});
const hasChilden = computed(() => {
    return menuData.value.filter(item => item.children && item.children.length > 0);
});
</script>

<style scoped>
.sidebar {
    display: block;
    position: absolute;
    left: 0;
    top: 70px;
    bottom: 0;
    overflow-y: scroll;
}

.sidebar::-webkit-scrollbar {
    width: 0;
}

.sidebar-el-menu:not(.el-menu--collapse) {
    width: 250px;
}

.sidebar-el-menu {
    min-height: 100%;
}
</style>
