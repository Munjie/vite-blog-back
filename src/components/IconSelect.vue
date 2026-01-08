<template>
    <div class="icon-select-container">
        <el-popover placement="bottom-start" :width="450" trigger="click">
            <template #reference>
                <el-input
                        v-model="modelValue"
                        placeholder="点击选择图标"
                        readonly
                        class="icon-input"
                >
                    <template #prefix>
                        <el-icon v-if="modelValue" class="el-input__icon">
                            <component :is="modelValue" />
                        </el-icon>
                        <el-icon v-else class="el-input__icon"><Search /></el-icon>
                    </template>
                </el-input>
            </template>

            <div class="icon-select-popover">
                <el-input
                        v-model="searchText"
                        placeholder="搜索图标名称"
                        prefix-icon="Search"
                        clearable
                        class="mb-2"
                />

                <el-scrollbar height="300px">
                    <div class="icon-list">
                        <div
                                v-for="name in filteredIcons"
                                :key="name"
                                class="icon-item"
                                @click="selectIcon(name)"
                        >
                            <el-icon class="text-xl mb-1">
                                <component :is="name" />
                            </el-icon>
                            <span class="text-xs text-gray-500 truncate w-full text-center px-1">{{ name }}</span>
                        </div>
                    </div>
                </el-scrollbar>
            </div>
        </el-popover>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import * as Icons from '@element-plus/icons-vue';
import {Search} from "@element-plus/icons-vue";
const modelValue = defineModel<string>();
const emit = defineEmits(['update:modelValue']);

const searchText = ref('');
const iconList = Object.keys(Icons);

// 过滤搜索
const filteredIcons = computed(() => {
    if (!searchText.value) return iconList;
    return iconList.filter(name =>
        name.toLowerCase().includes(searchText.value.toLowerCase())
    );
});

// 选择图标
const selectIcon = (name: string) => {
    emit('update:modelValue', name);
};
</script>

<style scoped>
.icon-list {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 10px;
}
.icon-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    height: 70px;
    cursor: pointer;
    transition: all 0.3s;
}
.icon-item:hover {
    border-color: #409eff;
    color: #409eff;
    background-color: #f0f9eb;
}
.mb-2 {
    margin-bottom: 8px;
}
</style>