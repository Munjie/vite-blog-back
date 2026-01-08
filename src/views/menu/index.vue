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
                <el-table-column prop="title" label="菜单名称" min-width="100"   align="center" show-overflow-tooltip />
                <el-table-column prop="icon" label="图标" min-width="100"   align="center" show-overflow-tooltip >
                    <template #default="scope">
                        <el-icon v-if="scope.row.icon"><component :is="scope.row.icon" /></el-icon>
                    </template>
                </el-table-column>
                <el-table-column prop="index" label="路由路径" min-width="100"   align="center" show-overflow-tooltip  />
                <el-table-column prop="sort" label="排序" min-width="100"   align="center" show-overflow-tooltip  />
                <el-table-column prop="createTime" label="创建时间" min-width="100"   align="center" show-overflow-tooltip  />
                <el-table-column label="操作" min-width="100"   align="center" show-overflow-tooltip >
                    <template #default="scope">
                        <el-button type="primary" link icon="Plus" @click="handleOpenDialog(scope.row.id)">新增子项</el-button>
                        <el-button type="primary" link icon="Edit" @click="handleEdit(scope.row)">编辑</el-button>
                        <el-button type="danger" link icon="Delete" @click="handleDelete(scope.row.id)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" destroy-on-close>
            <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
                <el-form-item label="上级菜单">
                    <el-tree-select
                        v-model="form.pid"
                        :data="menuOptions"
                        check-strictly
                        :render-after-expand="false"
                        props="{ label: 'title', value: 'id', children: 'children' }"
                        placeholder="选择上级菜单 (空则为顶级)"
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
                    <IconSelect v-model="form.icon" />
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
const menuOptions = ref<any[]>([]); // 包含根节点的TreeSelect数据
const dialogVisible = ref(false);
const dialogTitle = ref('');
const formRef = ref();

const form = reactive<Menu>({
    id: 0,
    pid: 0,
    title: '',
    index: '',
    icon: '',
    sort: 1
});

const rules = {
    title: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
    // index: [{ required: true, message: '请输入路由地址', trigger: 'blur' }]
};

// 获取数据
const fetchData = async () => {
    loading.value = true;
    try {
        const res = await getMenuTree();
        if (Array.isArray(res)) {
            console.error('返回数据格式错误');
            return;
        }
        const data = res.data || [];
        menuList.value = data;
        menuOptions.value = [{ id: 0, title: '顶级菜单', children: res.data || [] }];
    } finally {
        loading.value = false;
    }
};

const resetForm = () => {
    Object.assign(form, { id: 0, pid: 0, title: '', index: '', icon: '', sort: 1 });
};

// 打开新增弹窗
const handleOpenDialog = (pid: number) => {
    resetForm();
    form.pid = pid;
    dialogTitle.value = '新增菜单';
    dialogVisible.value = true;
};

// 打开编辑弹窗
const handleEdit = (row: Menu) => {
    resetForm();
    Object.assign(form, row);
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
                if (form.id) {
                    await updateMenu(form);
                    ElMessage.success('修改成功');
                } else {
                    await addMenu(form);
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
         )
        await deleteMenu(id);
        ElMessage.success("删除成功")
        await    fetchData();
    } catch (error) {
        console.log('用户取消操作')
    }
}

onMounted(fetchData);
</script>