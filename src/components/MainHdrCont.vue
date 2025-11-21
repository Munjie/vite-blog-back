<template>
  <!-- 顶部导航栏 -->
    <div class="header-layout">
        <div class="header-left">
            <div class="mb-4">
                <el-button type="primary" :key="bntMenuText" @click="handleMenu">{{ bntMenuText }}</el-button>
            </div>
        </div>
        <div class="header-right">
            <el-switch
                    class="ml-2"
                    inline-prompt
                    active-icon-class="el-icon-zh"
                    inactive-icon-class="el-icon-en"
                    active-text="中文"
                    inactive-text="English"
                    style="--el-switch-off-color: #13ce66"
            />
            <el-dropdown>
        <span class="el-dropdown-link">
          <el-avatar :size="30" src="../assets/vue.svg" />
          <el-icon><ArrowDown /></el-icon>
        </span>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item>个人中心</el-dropdown-item>
                        <el-dropdown-item>设置</el-dropdown-item>
                        <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useUserStore,useAppStore} from '../stores';


const userStore = useUserStore();
const store = useAppStore();

// 定义按钮文本，根据 store.isCollapse 的值动态设置
const bntMenuText = computed(() => {
    return store.isCollapse ? 'expand' : 'collapse';
});

// 定义单击事件的处理函数
function handleMenu() {
    store.isCollapse = !store.isCollapse;
}
function handleLogout() {
    userStore.logout();
}




</script>

<style scoped>
.header-layout {
    display: flex;
    justify-content: space-between; /* 使 header-left 和 header-right 分别靠左和靠右 */
    align-items: center;
    width: 100%; /* 确保 header 占据整个容器宽度 */
}

.header-left {
    display: flex;
    align-items: center;
}

.header-right {
    display: flex;
    align-items: center;
}

/* 自定义图标样式 */
.el-icon-zh::before {
    content: '\e70a'; /* 中文图标 */
    font-family: 'element-icons' !important;
}

.el-icon-en::before {
    content: '\e70b'; /* 英文图标 */
    font-family: 'element-icons' !important;
}
</style>