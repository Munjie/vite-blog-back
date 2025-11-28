<template>
    <div>
        <div class="table-toolbar" v-if="hasToolbar">
            <div class="table-toolbar-left">
                <slot name="toolbarBtn"></slot>
            </div>
            <div class="table-toolbar-right flex-center">
<!--                <template v-if="multipleSelection.length > 0">
                    <el-tooltip effect="dark" content="删除选中" placement="top">
                        <el-icon class="columns-setting-icon" @click="delSelection(multipleSelection)">
                            <Delete />
                        </el-icon>
                    </el-tooltip>
                    <el-divider direction="vertical" />
                </template>-->
                <el-tooltip effect="dark" content="刷新" placement="top">
                    <el-icon class="columns-setting-icon" @click="refresh">
                        <Refresh />
                    </el-icon>
                </el-tooltip>
                <el-divider direction="vertical" />
                <el-tooltip effect="dark" content="列设置" placement="top">
                    <el-dropdown :hide-on-click="false" size="small" trigger="click">
                        <el-icon class="columns-setting-icon">
                            <Setting />
                        </el-icon>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item v-for="c in visibleColumns">
                                    <el-checkbox v-model="c.visible" :label="c.label" />
                                </el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </el-tooltip>
            </div>
        </div>
        <!-- 表格 -->
        <el-table class="mgb20" ref="table"  :data="tableData" border :style="{ width: '100%' } " :row-key="rowKey" table-layout="auto">
            <template v-for="item in tableColumns">
                <el-table-column  :prop="item.prop" :label="item.label" :width="item.width"
                                 :type="item.type" :align="item.align || 'center'">
                    <template #default="{ row, column, $index }" v-if="!item.type">
                        <slot :name="item.prop" :rows="row" :index="$index">
                            <template v-if="item.prop == 'operator'">
                                <el-button type="warning" size="small" :icon="View" @click="viewFunc(row)">
                                    查看
                                </el-button>
                                <el-button type="primary" size="small" :icon="Edit" @click="editFunc(row)">
                                    编辑
                                </el-button>
                                <el-button type="danger" size="small" :icon="Delete" @click="handleDelete(row)">
                                    删除
                                </el-button>
                            </template>
                            <span v-else-if="item.formatter">
                                {{ item.formatter(row[item.prop]) }}
                            </span>
                            <span v-else>
                                {{ row[item.prop] }}
                            </span>
                        </slot>
                    </template>
                </el-table-column>
            </template>
        </el-table>

<!--        <el-table class="mgb20" :style="{ width: '100%' }"
                  ref="tableRef"
                  :key="currentPage"
                :data="tableData"
                style="width: 100%"
                border
                @selection-change="handleSelectionChange"
        >
            &lt;!&ndash; 选择列 &ndash;&gt;
            <el-table-column
                    v-if="showSelection"
                    type="selection"
                    align="center"
            ></el-table-column>

            &lt;!&ndash; 序号列 &ndash;&gt;
            <el-table-column
                    type="index"
                    label="序号"
                    align="center"
            ></el-table-column>

            &lt;!&ndash; 动态列 &ndash;&gt;
            <el-table-column
                    v-for="column in visibleColumns"
                    :key="column.prop"
                    :prop="column.prop"
                    :label="column.label"
                    :align="column.align || 'center'"
            ></el-table-column>
        </el-table>-->

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
import { Delete, Edit, View, Refresh } from '@element-plus/icons-vue';
const props = defineProps({
    rowKey: {
        type: String,
        default: 'id'
    },
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
    hasToolbar: {
        type: Boolean,
        default: true
    },
    delSelection: {
        type: Function,
        default: () => { }
    },
});

const emit = defineEmits(['update:currentPage', 'update:pageSize', 'selection-change']);
const currentPage = ref(1);

const visibleColumns = computed(() => {
    return props.tableColumns.filter((column) => !column.hide);
});

const visibless = computed(() => {
    tableColumns.value.forEach((item) => {
     if (item.visible === undefined) {
         item.visible = true
     }
 })
});


const getIndex = (index) => {
    return index + 1 + (currentPage.value - 1) * props.pageSize.value
}


/*visibleColumns.value.forEach((item) => {
    if (item.visible === undefined) {
        item.visible = true
    }
})*/

// 当选择项发生变化时会触发该事件
const multipleSelection = ref([])
const handleSelectionChange = ([]) => {
    multipleSelection.value = selection
}

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

/*
const handleSelectionChange = (selection) => {
    emit('selection-change', selection);
};
*/

// 监听 currentPage 和 pageSize 的变化并记录日志
watch(currentPage, (newVal, oldVal) => {
    console.log(`currentPage changed from ${oldVal} to ${newVal}`);
});

watch(() => props.pageSize, (newVal, oldVal) => {
    console.log(`pageSize changed from ${oldVal} to ${newVal}`);
});
 // deep: true 处理数组变化
</script>



<style scoped>
.table-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 10px;
}

.columns-setting-icon {
    display: block;
    font-size: 18px;
    cursor: pointer;
    color: #676767;
}
</style>
<style>
.table-header .cell {
    color: #333;
}
</style>