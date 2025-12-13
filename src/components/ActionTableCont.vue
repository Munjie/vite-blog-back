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

        <!-- new -->
        <el-table class="mgb20" ref="table" :data="tableData" border :style="{ width: '100%' } " :row-key="rowKey"
            table-layout="auto">
            <template v-for="item in tableColumns">
                <el-table-column :prop="item.prop" :label="item.label" :width="item.width" :type="item.type"
                    :align="item.align || 'center'">
                    <template #default="{ row, column, $index }" v-if="!item.type">
                        <!-- 插槽允许父组件覆盖特定列 -->
                        <slot :name="item.prop" :rows="row" :index="$index">

                            <!-- 1. 操作栏逻辑 (保持不变) -->
                            <template v-if="item.prop == 'operator'">
                                <el-button type="warning" size="small" :icon="View"
                                    @click="viewFunc(row)">查看</el-button>
                                <el-button v-if="showEdit" type="primary" size="small" :icon="Edit"
                                    @click="editFunc(row)">编辑</el-button>
                                <el-button type="danger" size="small" :icon="Delete"
                                    @click="deleteFunc(row)">删除</el-button>
                                <el-button v-if="showExport" type="info" size="small" :icon="View"
                                    @click="exportFunc(row)">导出</el-button>
                            </template>

                            <!-- 2. 图片处理逻辑 (新增部分) -->
                            <!-- 判断条件：配置了 isImage: true 或者 字段名就是 'image' -->
                            <div v-else-if="item.isImage || item.prop === 'image'"
                                style="display: flex; justify-content: center; align-items: center;">
                                <el-image v-if="row[item.prop]" style="width: 50px; height: 50px; border-radius: 4px;"
                                    :src="row[item.prop]" :preview-src-list="[row[item.prop]]" fit="cover"
                                    preview-teleported hide-on-click-modal>
                                    <!-- 图片加载失败占位 -->
                                    <template #error>
                                        <div class="image-slot">
                                            <el-icon>
                                                <Picture />
                                            </el-icon>
                                        </div>
                                    </template>
                                </el-image>
                                <span v-else>-</span>
                            </div>
                            <!-- 3. 新增：开关列（是否发布等状态） -->
                            <div v-else-if="item.label === '是否发布'" style="display: flex; justify-content: center;">
                                <el-switch v-model="row.status" :active-value="1" :inactive-value="0" active-text="已发布"
                                    inactive-text="未发布" @change="handleSwitchChange(row.id, $event)" />
                            </div>



                            <!-- 3. 格式化逻辑 (保持不变) -->
                            <span v-else-if="item.formatter">
                                {{ item.formatter(row[item.prop]) }}
                            </span>

                            <!-- 4. 默认文本 (保持不变) -->
                            <span v-else>
                                {{ row[item.prop] }}
                            </span>

                        </slot>
                    </template>
                </el-table-column>
            </template>
        </el-table>
        <!-- 分页 -->
        <el-pagination :current-page="currentPage" :page-size="pageSize" :page-sizes="pageSizes"
            layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="handleSizeChange"
            @current-change="handleCurrentChange" style="margin-top: 20px"></el-pagination>
    </div>
</template>

<script setup>
    import { ref, computed, defineProps, defineEmits, watch, onMounted } from 'vue';
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
            default: () => [20, 30, 50],
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
        delFunc: {
            type: Function,
            default: () => { }
        },
        viewFunc: {
            type: Function,
            default: () => { }
        },
        editFunc: {
            type: Function,
            default: () => { }
        },
        deleteFunc: {
            type: Function,
            default: () => { }
        },
        exportFunc: {
            type: Function,
            default: () => { }
        },
        showEdit: {
            type: Boolean,
            default: false
        },
        showExport: {
            type: Boolean,
            default: false
        },
    });

    const emit = defineEmits(['update:currentPage', 'update:pageSize', 'selection-change']);
    const currentPage = ref(1);
    const isInitializing = ref(true)
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
    };


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

    // 新增：开关变更处理       
    const handleSwitchChange = (id, newVal) => {
        if (isInitializing.value) return
        emit('switch-change', { id, status: newVal })
    }

    // 监听 currentPage 和 pageSize 的变化并记录日志
    watch(currentPage, (newVal, oldVal) => {
        console.log(`currentPage changed from ${oldVal} to ${newVal}`);
    });

    watch(() => props.pageSize, (newVal, oldVal) => {
        console.log(`pageSize changed from ${oldVal} to ${newVal}`);
    });
    // deep: true 处理数组变化
    // 初始化完成
    onMounted(() => {
        isInitializing.value = false

    })
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