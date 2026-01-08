<template>
    <div class="app-container">
        <el-card shadow="never">
            <div class="filter-container mb-4 flex justify-between">
                <div>
                    <el-input v-model="queryParams.roleName" placeholder="输入角色名称搜索" style="width: 200px;"
                              class="mr-2" @keyup.enter="handleQuery"/>
                    <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
                    <el-button type="primary" icon="Plus" @click="handleAdd">新增角色</el-button>
                </div>
            </div>

            <el-table v-loading="loading" :data="roleList" border stripe highlight-current-row>
                <el-table-column label="ID" prop="id" min-width="100"   align="center" show-overflow-tooltip/>
                <el-table-column label="角色名称" prop="roleName" min-width="100"   align="center" show-overflow-tooltip/>
                <el-table-column label="状态" prop="status"min-width="100"   align="center" show-overflow-tooltip>
                    <template #default="scope">
                        <el-switch
                                v-model="scope.row.status"
                                :active-value="0"
                                :inactive-value="1"
                                @change="handleStatusChange(scope.row)"
                        />
                    </template>
                </el-table-column>
                <el-table-column label="创建时间" prop="createTime" min-width="100"   align="center" show-overflow-tooltip/>
                <el-table-column label="更新时间" prop="updateTime" min-width="100"   align="center" show-overflow-tooltip/>
                <el-table-column label="操作" min-width="100"   align="center" show-overflow-tooltip>
                    <template #default="scope">
                        <el-button link type="primary" icon="Key" @click="handleMenuScope(scope.row)">菜单权限
                        </el-button>
                        <el-button link type="primary" icon="Edit" @click="handleEdit(scope.row)">编辑</el-button>
                        <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <div class="flex justify-end mt-4">
                <el-pagination
                        v-if="total > 0"
                        v-model:current-page="queryParams.pageNum"
                        v-model:page-size="queryParams.pageSize"
                        :total="total"
                        :page-sizes="[10, 20, 50, 100]"
                        layout="total, sizes, prev, pager, next, jumper"
                        @size-change="handleQuery"
                        @current-change="handleQuery"
                />
            </div>
        </el-card>

        <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
            <el-form ref="roleFormRef" :model="form" :rules="rules" label-width="80px">
                <el-form-item label="角色名称" prop="roleName">
                    <el-input v-model="form.roleName" placeholder="请输入角色名称"/>
                </el-form-item>
                <el-form-item label="状态" prop="status">
                    <el-radio-group v-model="form.status">
                        <el-radio :label="0">正常</el-radio>
                        <el-radio :label="1">停用</el-radio>
                    </el-radio-group>
                </el-form-item>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="dialog.visible = false">取 消</el-button>
                    <el-button type="primary" @click="submitForm" :loading="dialog.loading">确 定</el-button>
                </div>
            </template>
        </el-dialog>

        <el-dialog title="分配菜单权限" v-model="permDialog.visible" width="500px" append-to-body>
            <div class="dialog-body" style="max-height: 500px; overflow-y: auto;">
                <el-tree
                        ref="menuTreeRef"
                        :data="menuOptions"
                        show-checkbox
                        node-key="id"
                        :props="{ label: 'title', children: 'children' }"
                        default-expand-all
                        :check-strictly="false"
                />
            </div>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="permDialog.visible = false">取 消</el-button>
                    <el-button type="primary" @click="submitPerms" :loading="permDialog.loading">确 定</el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import {ref, reactive, nextTick, onMounted} from 'vue';
import {ElMessage, ElMessageBox, ElTree} from 'element-plus';
import {
    getRoleList,
    addUpdateRole,
    deleteRole,
    getMenuTree,
    getRoleMenuIds,
    assignRolePermissions
} from '../../api/system.ts';
import type {Role, Menu} from '../../types/system';

// --- 状态定义 ---
const loading = ref(false);
const total = ref(0);
const roleList = ref<Role[]>([]);
const menuOptions = ref<Menu[]>([]);
const roleFormRef = ref();
const menuTreeRef = ref<InstanceType<typeof ElTree>>();

const queryParams = reactive({
    pageNum: 1,
    pageSize: 10,
    roleName: ''
});

// 角色表单弹窗状态
const dialog = reactive({
    visible: false,
    title: '',
    loading: false
});

// 权限弹窗状态
const permDialog = reactive({
    visible: false,
    loading: false,
    roleId: 0
});

// 角色表单数据
const form = reactive<Role>({
    id: 0,
    roleName: '',
    status: 0
});

const rules = {
    roleName: [{required: true, message: '请输入角色名称', trigger: 'blur'}]
};



/** 1. 获取角色列表 */
const handleQuery = async () => {
    loading.value = true;
    try {
        const res = await getRoleList(queryParams);
        roleList.value = res.data.records || [];
        total.value = res.data.total || 0;
    } finally {
        loading.value = false;
    }
};

/** 重置表单 */
const resetForm = () => {
    form.id = 0;
    form.roleName = '';
    form.status = 0;
    if (roleFormRef.value) roleFormRef.value.resetFields();
};

/** 新增按钮 */
const handleAdd = () => {
    resetForm();
    dialog.title = '新增角色';
    dialog.visible = true;
};

/** 编辑按钮 */
const handleEdit = (row: Role) => {
    resetForm();
    Object.assign(form, row); // 复制数据
    dialog.title = '编辑角色';
    dialog.visible = true;
};

/** 提交角色表单 (新增/修改) */
const submitForm = async () => {
    if (!roleFormRef.value) return;
    await roleFormRef.value.validate(async (valid: boolean) => {
        if (valid) {
            dialog.loading = true;
            try {
                if (form.id) {
                    await addUpdateRole(form);
                    ElMessage.success('修改成功');
                } else {
                    await addUpdateRole(form);
                    ElMessage.success('新增成功');
                }
                dialog.visible = false;
                await handleQuery();
            } finally {
                dialog.loading = false;
            }
        }
    });
};

/** 修改状态 Switch */
const handleStatusChange = async (row: Role) => {
    const text = row.status === 0 ? '启用' : '停用';
    try {
        await ElMessageBox.confirm(`确认要${text}"${row.roleName}"角色吗?`, '警告',
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning' as 'warning',
            }
        );
        await addUpdateRole(row);
        ElMessage.success(`${text}成功`);
    } catch {
        row.status = row.status === 0 ? 1 : 0;
    }
};

/** 删除角色 */
const handleDelete = async (row: Role) => {
    try {
        await ElMessageBox.confirm(
            '确定要删除这条数据吗？',
            '警告',
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning' as 'warning',
            }
        )
        await deleteRole(row.id);
        ElMessage.success("删除成功")
        await handleQuery();
    } catch (error) {
        console.log('用户取消操作')
    }
};


/** 打开权限弹窗 */
const handleMenuScope = async (row: Role) => {
    permDialog.roleId = row.id;
    permDialog.visible = true;

    // 1. 获取完整的菜单树
    if (menuOptions.value.length === 0) {
        const res = await getMenuTree();
        if (Array.isArray(res)) {
            console.error('返回数据格式错误');
            return;
        }
        menuOptions.value = res.data;
    }
    // 2. 获取该角色已有的菜单ID
    const resIds = await getRoleMenuIds(row.id);
    if (Array.isArray(resIds)) {
        console.error('返回数据格式错误');
        return;
    }
    const checkedIds = resIds.data;

    // 3. 回显选中状态
    // 【关键点】：Element Plus 的 Tree 如果勾选了父节点，子节点会全选。
    // 但数据库里存的往往包含父节点ID。如果直接 setCheckedKeys(父节点ID)，会导致前端显示错误（全选了）。
    // 解决方案：只将“叶子节点”的ID设置给 Tree，父节点会根据子节点的选中状态自动变成“半选”或“全选”。
    await nextTick(() => {
        if (menuTreeRef.value) {
            // 先清空
            menuTreeRef.value.setCheckedKeys([], false);
            // 筛选叶子节点
            const leafKeys = getLeafKeys(menuOptions.value, checkedIds);
            menuTreeRef.value.setCheckedKeys(leafKeys);
        }
    });
};

/** 提交权限分配 */
const submitPerms = async () => {
    if (!menuTreeRef.value) return;
    permDialog.loading = true;

    try {
        // 1. 获取全选的节点 (叶子 + 全选的父级)
        const checkedKeys = menuTreeRef.value.getCheckedKeys(false) as number[];
        // 2. 获取半选的节点 (父级)
        const halfCheckedKeys = menuTreeRef.value.getHalfCheckedKeys() as number[];
        // 3. 合并发送给后端
        const finalIds = [...checkedKeys, ...halfCheckedKeys];
        await assignRolePermissions(permDialog.roleId, finalIds);
        ElMessage.success('权限分配成功');
        permDialog.visible = false;
    } finally {
        permDialog.loading = false;
    }
};

/** 辅助函数：从所有选中的ID中，过滤出只是叶子节点的ID */
const getLeafKeys = (treeData: Menu[], allCheckedIds: number[]): number[] => {
    const leafKeys: number[] = [];

    const traverse = (nodes: Menu[]) => {
        nodes.forEach(node => {
            const isLeaf = !node.children || node.children.length === 0;
            if (isLeaf) {
                if (allCheckedIds.includes(node.id)) {
                    leafKeys.push(node.id);
                }
            } else {
                // 如果有子节点，继续递归
                if (node.children) traverse(node.children);
            }
        });
    };

    traverse(treeData);
    return leafKeys;
};

// 初始化
onMounted(() => {
    handleQuery();
});
</script>

<style scoped>
.mr-2 {
    margin-right: 8px;
}

.mb-4 {
    margin-bottom: 16px;
}

.mt-4 {
    margin-top: 16px;
}
</style>