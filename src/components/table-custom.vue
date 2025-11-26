<template>
    <div>
        <div class="table-toolbar" v-if="hasToolbar">
            <div class="table-toolbar-left">
                <slot name="toolbarBtn"></slot>
            </div>
            <div class="table-toolbar-right flex-center">
                <template v-if="multipleSelection.length > 0">
                    <el-tooltip effect="dark" content="删除选中" placement="top">
                        <el-icon class="columns-setting-icon" @click="delSelection?.(multipleSelection)">
                            <Delete />
                        </el-icon>
                    </el-tooltip>
                    <el-divider direction="vertical" />
                </template>
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
                                <el-dropdown-item v-for="c in columns">
                                    <el-checkbox v-model="c.visible" :label="c.label" />
                                </el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </el-tooltip>
            </div>
        </div>
        <el-table class="mgb20" :style="{ width: '100%' }" border :data="tableData" :row-key="rowKey"
            @selection-change="handleSelectionChange" table-layout="auto">
            <template v-for="item in columns" :key="item.prop">
                <el-table-column v-if="item.visible" :prop="item.prop" :label="item.label" :width="item.width"
                    :type="item.type" :align="item.align || 'center'">

                    <template #default="{  $index }" v-if="item.type === 'index'">
                        {{ getIndex($index) }}
                    </template>
                    <template #default="{ row, $index }" v-if="!item.type">
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
                        </slot>
                    </template>
                </el-table-column>
            </template>
        </el-table>
        <el-pagination v-if="hasPagination" :current-page="currentPage" :page-size="pageSize" :background="true"
            :layout="layout" :total="total" @current-change="handleCurrentChange" />
    </div>
</template>

<script setup lang="ts">
import { toRefs, ref } from 'vue'
import { Delete, Edit, View, Refresh } from '@element-plus/icons-vue';
// 1. 定义 Props 接口（精确 TS 类型）
interface Props {
    // 表格相关
    tableData?: any[];  // 可选，但默认确保非 undefined
    columns?: { prop: string; label: string; [key: string]: any }[];  // 示例列类型，调整为你的
    rowKey?: string;
    hasToolbar?: boolean;

    // 分页相关
    hasPagination?: boolean;
    total?: number;
    currentPage?: number;
    pageSize?: number;
    layout?: string;

    // 函数 props（精确签名）
    delFunc?: (row: any) => void;
    viewFunc?: (row: any) => void;  // 示例：假设 viewFunc 接收 row 参数，调整为实际
    editFunc?: (row: any) => void;
    delSelection?: (selection: any[]) => void;  // 如你的原代码
    refresh?: () => void;
    changePage?: (page: number) => void;  // 示例：分页回调参数
}

// 2. 用 withDefaults 应用默认值（TS 推断非空）
// @ts-ignore
const props = withDefaults(defineProps<Props>(), {
    // 表格相关
    tableData: () => [],
    columns: () => [],
    rowKey: 'id',
    hasToolbar: true,

    // 分页相关
    hasPagination: true,
    total: 0,
    currentPage: 1,
    pageSize: 10,
    layout: 'total, prev, pager, next',

    // 函数默认（空函数）
    delFunc: () => () => {},
    viewFunc: () => () => {},
    editFunc: () => () => {},
    delSelection: () => () => {},
    refresh: () => () => {},
    changePage: () => () => {},
});

let {
    tableData,
    columns,
    rowKey,
    hasToolbar,
    hasPagination,
    total,
    currentPage,
    pageSize,
    layout,
} = toRefs(props)

if (columns) {
    columns.value.forEach((item) => {
        if (item.visible === undefined) {
            item.visible = true
        }
    })
}

// 当选择项发生变化时会触发该事件
const multipleSelection = ref<any[]>([]);
const handleSelectionChange = (selection: any[]) => {
    multipleSelection.value = selection
}

// 当前页码变化的事件
const handleCurrentChange = (val: number) => {
    props.changePage(val)
}

const handleDelete = (row:any) => {
    props.delFunc(row);
};

const editFunc = (row:any) => {
    props.editFunc(row);
};

const viewFunc = (row:any) => {
    props.viewFunc(row);
};

const getIndex = (index: number) => {
    return index + 1 + (currentPage.value - 1) * pageSize.value
}

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