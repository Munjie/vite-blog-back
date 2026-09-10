<template>
    <div class="app-container">
        <el-card>
            <div class="mb-4">
                <el-button type="primary" icon="Plus" @click="handleOpenDialog(0)">新增根菜单</el-button>
                <el-button icon="Refresh" @click="fetchData">刷新</el-button>
            </div>

            <el-table
                v-loading="loading"
                :data="menuList"
                row-key="id"
                border
                default-expand-all
                :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
            >
                <el-table-column prop="title" label="菜单名称" min-width="100" align="center" show-overflow-tooltip />
                <el-table-column prop="icon" label="图标" min-width="100" align="center" show-overflow-tooltip>
                    <template #default="scope">
                        <el-icon v-if="scope.row.icon"><component :is="scope.row.icon" /></el-icon>
                        <span v-else class="text-gray-400">-</span>
                    </template>
                </el-table-column>
                <el-table-column prop="index" label="路由路径" min-width="100" align="center" show-overflow-tooltip />
                <el-table-column prop="sort" label="排序" min-width="100" align="center" show-overflow-tooltip />
                <el-table-column prop="createTime" label="创建时间" min-width="100" align="center" show-overflow-tooltip />
                <el-table-column label="操作" min-width="100" align="center" show-overflow-tooltip>
                    <template #default="scope">
                        <el-button type="primary" link icon="Plus" @click="handleOpenDialog(scope.row.id)">新增子项</el-button>
                        <el-button type="primary" link icon="Edit" @click="handleEdit(scope.row)">编辑</el-button>
                        <el-button type="danger" link icon="Delete" @click="handleDelete(scope.row.id)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <!-- 关键改进：增加 v-if，确保每次打开弹窗组件状态都是最新重置的 -->
        <el-dialog
            v-if="dialogVisible"
            v-model="dialogVisible"
            :title="dialogTitle"
            width="600px"
            destroy-on-close
        >
            <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
                <el-form-item label="上级菜单">
                    <el-tree-select
                        v-model="form.pid"
                        :data="menuOptions"
                        check-strictly
                        :render-after-expand="false"
                        :props="treeProps"
                        placeholder="选择上级菜单"
                        class="w-full"
                    />
                </el-form-item>
                <el-form-item label="菜单名称" prop="title">
                    <el-input v-model="form.title" placeholder="例如：用户管理" />
                </el-form-item>
                <el-form-item label="路由路径" prop="index">
                    <el-input v-model="form.index" placeholder="例如：/system/user" />
                </el-form-item>
                <el-form-item label="图标" prop="icon">
                    <div class="flex items-center gap-2 w-full">
                        <IconSelect v-model="form.icon" class="flex-1" />
                        <!-- 核心解决手段：增加显式的“无图标/清空”按钮 -->
                        <el-button
                            v-if="form.icon"
                            type="danger"
                            link
                            icon="Delete"
                            @click="form.icon = ''"
                        >
                            清空图标
                        </el-button>
                    </div>
                </el-form-item>
                <el-form-item label="排序" prop="sort">
                    <el-input-number v-model="form.sort" :min="0" />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="submitForm" :loading="btnLoading">确定</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getMenuTree, addMenu, updateMenu, deleteMenu } from '../../api/system.ts';
import type { Menu } from '../../types/system';
import IconSelect from '../../components/IconSelect.vue';

const loading = ref(false);
const btnLoading = ref(false);
const menuList = ref<Menu[]>([]);
const menuOptions = ref<any[]>([]); // 下拉树选项
const dialogVisible = ref(false);
const dialogTitle = ref('');
const formRef = ref();

// 绑定树选择器的配置
const treeProps = {
    label: 'title',
    value: 'id',
    children: 'children',
    disabled: 'disabled'
};

const form = reactive<Menu>({
    id: 0,
    pid: 0,
    title: '',
    index: '',
    icon: '',
    sort: 1
});

const rules = {
    title: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }]
};

// 递归禁用自身及子节点（防止上级菜单选择自身或自身子集）
const filterTreeDisabled = (nodes: any[], currentId: number): any[] => {
    return nodes.map(node => {
        const isSelf = node.id === currentId;
        const newNode = {
            ...node,
            disabled: isSelf
        };
        if (node.children && node.children.length > 0) {
            newNode.children = filterTreeDisabledWithParentState(node.children, currentId, isSelf);
        }
        return newNode;
    });
};

const filterTreeDisabledWithParentState = (nodes: any[], currentId: number, parentDisabled: boolean): any[] => {
    return nodes.map(node => {
        const isDisabled = parentDisabled || node.id === currentId;
        const newNode = {
            ...node,
            disabled: isDisabled
        };
        if (node.children && node.children.length > 0) {
            newNode.children = filterTreeDisabledWithParentState(node.children, currentId, isDisabled);
        }
        return newNode;
    });
};

// 获取数据
const fetchData = async () => {
    loading.value = true;
    try {
        const res: any = await getMenuTree();
        const data = res.data || [];
        menuList.value = data;
    } finally {
        loading.value = false;
    }
};

// 刷新并生成带有顶级"无"选项的树列表
const updateMenuOptions = (currentEditId: number = 0) => {
    let treeData = JSON.parse(JSON.stringify(menuList.value));

    if (currentEditId > 0) {
        treeData = filterTreeDisabled(treeData, currentEditId);
    }

    menuOptions.value = [
        {
            id: 0,
            title: '无',
            children: treeData
        }
    ];
};

const resetForm = () => {
    Object.assign(form, { id: 0, pid: 0, title: '', index: '', icon: '', sort: 1 });
};

// 打开新增弹窗
const handleOpenDialog = (pid: number) => {
    resetForm();
    form.pid = pid;
    updateMenuOptions(0);
    dialogTitle.value = '新增菜单';
    dialogVisible.value = true;
};

// 打开编辑弹窗
const handleEdit = (row: Menu) => {
    resetForm();
    // 确保传递给表单的 icon 字段至少是空字符串，避免 null/undefined 导致的响应问题
    Object.assign(form, {
        ...row,
        icon: row.icon || ''
    });
    updateMenuOptions(row.id);
    dialogTitle.value = '编辑菜单';
    dialogVisible.value = true;
};

// 提交表单
const submitForm = async () => {
    if (!formRef.value) return;
    await formRef.value.validate(async (valid: boolean) => {
        if (valid) {
            btnLoading.value = true;
            try {
                // 确保清空图标时提交给后端的始终是空字符串 ''，而不是 undefined
                const submitData = {
                    ...form,
                    icon: form.icon || ''
                };

                if (submitData.id) {
                    await updateMenu(submitData);
                    ElMessage.success('修改成功');
                } else {
                    await addMenu(submitData);
                    ElMessage.success('新增成功');
                }
                dialogVisible.value = false;
                await fetchData();
            } finally {
                btnLoading.value = false;
            }
        }
    });
};

// 删除
const handleDelete = async (id: number) => {
    try {
        await ElMessageBox.confirm(
            '确定要删除这条数据吗？',
            '警告',
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning' as 'warning',
            }
        );
        await deleteMenu(id);
        ElMessage.success('删除成功');
        await fetchData();
    } catch (error) {
        console.log('用户取消操作');
    }
};

onMounted(fetchData);
</script>