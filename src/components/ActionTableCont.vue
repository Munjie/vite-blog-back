<template>
    <div>
        <!-- 表格 -->
        <el-table
                :data="currentPageData"
                style="width: 100%"
                border
                @selection-change="handleSelectionChange"
        >
            <!-- 选择列 -->
            <el-table-column
                    v-if="showSelection"
                    type="selection"
                    align="center"
            ></el-table-column>

            <!-- 序号列 -->
            <el-table-column
                    type="index"
                    label="序号"
                    align="center"
            ></el-table-column>

            <!-- 动态列 -->
            <el-table-column
                    v-for="column in visibleColumns"
                    :key="column.prop"
                    :prop="column.prop"
                    :label="column.label"
                    :align="column.align || 'center'"
            ></el-table-column>
        </el-table>

        <!-- 分页 -->
        <el-pagination
                :current-page="currentPage"
                :page-size="pageSize"
                :page-sizes="pageSizes"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                style="margin-top: 20px"
        ></el-pagination>
    </div>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits, watch } from 'vue';

const props = defineProps({
    tableColumns: {
        type: Array,
        required: true,
        default: () => [],
    },
    tableData: {
        type: Array,
        required: true,
        default: () => [],
    },
    pageSize: {
        type: Number,
        default: 10,
    },
    pageSizes: {
        type: Array,
        default: () => [5, 10, 20, 30],
    },
    showSelection: {
        type: Boolean,
        default: false,
    },
    total: {
        type: Number,
        required: true,
        default: 0,
    },
});

const emit = defineEmits(['update:currentPage', 'update:pageSize', 'selection-change']);

const currentPage = ref(1);

const currentPageData = computed(() => {
    const start = (currentPage.value - 1) * props.pageSize;
    const end = start + props.pageSize;
    return props.tableData.slice(start, end);
});

const visibleColumns = computed(() => {
    return props.tableColumns.filter((column) => !column.hide);
});

const handleSizeChange = (newSize) => {
    console.log(`分页大小改变，新的分页大小为: ${newSize}`);
    emit('update:pageSize', newSize);
    currentPage.value = 1; // 重置当前页为第一页
    emit('update:currentPage', currentPage.value);
};

const handleCurrentChange = (newPage) => {
    console.log(`当前页码改变，新的页码为: ${newPage}`);
    currentPage.value = newPage;
    emit('update:currentPage', currentPage.value);
};

const handleSelectionChange = (selection) => {
    emit('selection-change', selection);
};

// 监听 currentPage 和 pageSize 的变化并记录日志
watch(currentPage, (newVal, oldVal) => {
    console.log(`currentPage changed from ${oldVal} to ${newVal}`);
});

watch(() => props.pageSize, (newVal, oldVal) => {
    console.log(`pageSize changed from ${oldVal} to ${newVal}`);
});
</script>