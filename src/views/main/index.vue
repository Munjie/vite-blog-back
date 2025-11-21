<template>
    <div class="common-layout">
        <el-container>
            <el-aside>
                <MainAsideCont/>
            </el-aside>
            <el-container>
                <el-header>
                    <MainHdrCont/>
                </el-header>
                <MainTagsCont />
                <el-main>
                    <router-view></router-view>
                </el-main>
            </el-container>
        </el-container>
    </div>
</template>
<script lang="ts" setup>
import MainAsideCont from '@/components/MainAsideCont.vue';
import MainHdrCont from '@/components/MainHdrCont.vue';
import MainTagsCont from '@/components/MainTagsCont.vue';


</script>

<style lang="less" scoped>
.common-layout {
  height: 100%; /* 设置整个布局的高度为 100%，确保布局占满整个视口 */
  width: 100%; /* 设置整个布局的宽度为 100%，确保布局占满整个视口 */

  .el-container {
    height: 100%; /* 确保内部的 el-container 也占满整个父容器的高度 */
  }

  .el-header {
    background-color: #fff; /* 设置表头的背景色为深黑色 */
    color: #141515; /* 设置表头文字颜色为白色，以便在深色背景上更清晰 */
    display: flex; /* 使用 flex 布局，方便对齐内容 */
    align-items: center; /* 垂直居中对齐内容 */
    justify-content: center; /* 水平居中对齐内容 */
    font-size: 18px; /* 设置文字大小为 18px */
    font-weight: bold; /* 设置文字为加粗 */
  }

  .el-aside {
    background-color: rgba(242, 242, 242, 0.19); /* 设置侧边栏的背景色为浅灰色 */
    color: #333; /* 设置侧边栏文字颜色为深灰色 */
    display: flex; /* 使用 flex 布局，方便对齐内容 */
    align-items: center; /* 垂直居中对齐内容 */
    justify-content: center; /* 水平居中对齐内容 */
    font-size: 16px; /* 设置文字大小为 16px */
    font-weight: normal; /* 设置文字为正常粗细 */
    height: 100%; /* 确保侧边栏高度占满 */
    width: 200px;
  }

  .el-main {
    background-color: #fff; /* 设置主内容区域的背景色为白色 */
    color: #333; /* 设置主内容区域文字颜色为深灰色 */
    padding: 20px; /* 添加内边距，使内容不紧贴边缘 */
    font-size: 14px; /* 设置文字大小为 14px */
  }
}
</style>