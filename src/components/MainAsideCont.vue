<template>
    <el-menu
        :default-active="activeIndex"
        class="el-menu-vertical-demo"
        :collapse="isCollapse"
    >
        <h3 :key="TitleText">{{TitleText}}</h3>
        <!-- 渲染没有子菜单的项 -->
        <el-menu-item
            v-for="item in noChilden"
            :key="item.index"
            :index="item.index"
            @click="handlemenu(item)"
        >
            <component class="icon" :is="item.icon"></component>
            <span>{{ item.label }}</span>
        </el-menu-item>

        <!-- 渲染有子菜单的项 -->
        <el-sub-menu
            v-for="item in hasChilden"
            :key="item.index"
            :index="item.index"
        >
            <template #title>
                <component class="icon" :is="item.icon"></component>
                <span>{{ item.label }}</span>
            </template>
            <el-menu-item
                v-for="subItem in item.children"
                :key="subItem.index"
                :index="subItem.index"
                @click="handlemenuchild(item, subItem)"
            >
                <span>{{ subItem.label }}</span>
            </el-menu-item>
        </el-sub-menu>
    </el-menu>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores';
import type { MenuItem } from '../types/user.ts'
const store = useUserStore();


// 确保 menuAPI 是一个数组，并赋值给 menuData
const menuData = ref<MenuItem[]>([]); // 初始化为空数组

// 封装数据获取和处理逻辑
const fetchMenuData = async () => {
    try {
         let menu = store.getMenuData;
        console.info('menuAPI :', menu);
        if (Array.isArray(menu)) {
            menuData.value = menu
        } else {
            console.error('menuAPI 返回的数据不是数组:', menu);
        }
    } catch (error) {
        console.error('获取菜单数据失败:', error);
    }
};

onMounted(() => {
    menuData.value = store.getMenuData;
    debugger
    if (!menuData.value.length) {
        console.warn('菜单数据为空，尝试重新获取');
        fetchMenuData();
    } else {
        console.log('菜单数据已存在，无需重新获取');
        menuData.value = store.getMenuData;
        console.log('menuData.value:', menuData.value);
    }
});



const hasChilden = computed(() => menuData.value.filter(item => item.children && item.children.length > 0));
const noChilden = computed(() => menuData.value.filter(item => !item.children || item.children.length === 0));

const activeIndex = ref('Home');
const router = useRouter();

const handlemenu = (item: MenuItem) => {
    router.push(item.index);
    console.log('item:', item);
    store.setTabsData(item)
};

const handlemenuchild = (item: MenuItem, subItem: MenuItem) => {
    router.push(subItem.index);
    console.log('subItem:', subItem);
    store.setTabsData(subItem)
};



const TitleText = computed(() => {
    return store.isCollapse ? '平台' : '测试平台';
});

const isCollapse = computed(() => store.isCollapse);
/*
// 使用 defineComponent 显式命名组件
export const MainAsideCont = defineComponent({
  name: 'MainAsideCont'
});
*/

</script>

<style>
.el-menu {
    height: 100%; /* 设置整个布局的高度为 100%，确保布局占满整个视口 */
    border-right: none; /* 去掉右边框 */
}
.el-menu-vertical-demo:not(.el-menu--collapse) {
    width: 180px;
    min-height: 400px;
}
.el-menu-vertical-demo.el-menu--collapse {
    width: 60px; /* 收缩时的宽度 */
}

.icon {
    margin-right: 8px; /* 图标与文字之间的间距 */
    font-size: 18px;   /* 图标的大小 */
    width:18px;
    height:18px;
    size:8px;
    color: #606266;    /* 图标的默认颜色 */
    vertical-align: middle; /* 垂直居中对齐 */
}

/* 鼠标悬停时的样式 */
.icon:hover {
    color: #409eff; /* 鼠标悬停时图标的颜色 */
}

</style>