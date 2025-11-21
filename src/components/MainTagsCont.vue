<template>
    <div class="tabs">
<!--        <el-tag v-for="(item,index) in tabs"
                :key="index"
                :label="item.label"
                :name="item.index"
                :icon="item.icon"
                :path="item.path"
                :closable="item.index !== 'Home'"
                :effect="route.name===item.label?'dark':'plain'"
                @click="handleTagClick(item)"
                @close="handleTagClose(item,index)"
                round
        >
            {{ item.label }}
        </el-tag>-->
    </div>
</template>
<script lang="ts" setup>





</script>
<style scoped>
.tabs{
    margin: 20px 0 0 20px;
}
.el-tag{
    margin-right: 10px;
}
</style>