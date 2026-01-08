<template>
    <div class="app-container">
        <el-card shadow="never">
            <div class="filter-container mb-4 flex justify-between">
                <div class="flex gap-2">
                    <el-input
                            v-model="queryParams.userName"
                            placeholder="请输入用户名"
                            clearable
                            style="width: 200px"
                            @keyup.enter="handleQuery"
                            @clear="handleQuery"
                    />
                    <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
                    <el-button icon="Refresh" @click="resetQuery">重置</el-button>
                </div>
                <el-button type="primary" icon="Plus" @click="handleAdd">新增用户</el-button>
            </div>

            <el-table v-loading="loading" :data="userList" border stripe>
                <el-table-column label="ID" prop="id" min-width="100"   align="center" show-overflow-tooltip />

                <el-table-column label="头像" min-width="100"   align="center" show-overflow-tooltip>
                    <template #default="scope">
                        <el-avatar :size="40" :src="scope.row.avatar">
                            {{ scope.row.userName.charAt(0).toUpperCase() }}
                        </el-avatar>
                    </template>
                </el-table-column>

                <el-table-column label="用户名" prop="userName" min-width="100"   align="center" show-overflow-tooltip />

                <el-table-column label="所属角色" min-width="100"  align="center" show-overflow-tooltip>
                    <template #default="scope">
                        <div class="flex gap-1 flex-wrap">
                            <el-tag
                                    v-for="role in scope.row.roles"
                                    :key="role.id"
                                    size="small"
                                    type="info"
                            >
                                {{ role.roleName }}
                            </el-tag>
                        </div>
                    </template>
                </el-table-column>

                <el-table-column label="创建时间" prop="createTime" min-width="100"   align="center" show-overflow-tooltip />

                <el-table-column label="操作" min-width="100"   align="center" show-overflow-tooltip>
                    <template #default="scope">
                        <el-button link type="primary" icon="Edit" @click="handleEdit(scope.row)">编辑</el-button>
                        <el-button link type="warning" icon="Key" @click="handleResetPwd(scope.row)">重置密码</el-button>
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
                        :page-sizes="[10, 20, 50]"
                        layout="total, sizes, prev, pager, next, jumper"
                        @size-change="handleQuery"
                        @current-change="handleQuery"
                />
            </div>
        </el-card>

        <el-dialog
                :title="dialog.title"
                v-model="dialog.visible"
                width="500px"
                destroy-on-close
                append-to-body
        >
            <el-form ref="userFormRef" :model="form" :rules="rules" label-width="80px">
                <el-form-item label="用户名" prop="userName">
                    <el-input v-model="form.userName" placeholder="请输入用户名" />
                </el-form-item>

                <el-form-item
                        label="密码"
                        prop="password"
                        v-if="!form.id"
                >
                    <el-input
                            v-model="form.password"
                            type="password"
                            show-password
                            placeholder="请输入登录密码"
                    />
                </el-form-item>

                <el-form-item label="角色" prop="roleIds">
                    <el-select
                            v-model="form.roleIds"
                            multiple
                            placeholder="请选择角色"
                            style="width: 100%"
                    >
                        <el-option
                                v-for="item in roleOptions"
                                :key="item.id"
                                :label="item.roleName"
                                :value="item.id"
                        />
                    </el-select>
                </el-form-item>

                <el-form-item label="头像地址" prop="avatar">
                    <el-input v-model="form.avatar" placeholder="请输入图片URL (可选)" />
                </el-form-item>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="dialog.visible = false">取 消</el-button>
                    <el-button type="primary" @click="submitForm" :loading="dialog.loading">确 定</el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getUserList, addUser, updateUser, deleteUser, getAllRoles } from '../../api/system.ts';
import type { User, UserForm, Role } from '../../types/system';


// --- 状态定义 ---
const loading = ref(false);
const total = ref(0);
const userList = ref<User[]>([]);
const roleOptions = ref<Role[]>([]); // 角色下拉框数据
const userFormRef = ref();

// 查询参数
const queryParams = reactive({
    pageNum: 1,
    pageSize: 10,
    userName: ''
});

// 弹窗状态
const dialog = reactive({
    visible: false,
    title: '',
    loading: false
});

// 表单数据
const form = reactive<UserForm>({
    id: 0,
    userName: '',
    password: '',
    avatar: '',
    roleIds: []
});

// 表单校验规则
const rules = {
    userName: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
    ],
    roleIds: [
        { required: true, message: '请至少选择一个角色', trigger: 'change' }
    ]
};

// --- 方法实现 ---

/** 加载用户列表 */
const handleQuery = async () => {
    loading.value = true;
    try {
        const res = await getUserList(queryParams);
        userList.value = res.data.records || [];
        total.value = res.data.total || 0;
    } finally {
        loading.value = false;
    }
};

/** 重置搜索 */
const resetQuery = () => {
    queryParams.userName = '';
    queryParams.pageNum = 1;
    handleQuery();
};

/** 加载所有角色 (用于下拉框) */
const loadRoles = async () => {
    const res = await getAllRoles();
    roleOptions.value = res.data || [];
};

/** 重置表单 */
const resetForm = () => {
    form.id = undefined;
    form.userName = '';
    form.password = '';
    form.avatar = '';
    form.roleIds = [];
    // 清除校验结果
    if (userFormRef.value) userFormRef.value.resetFields();
};

/** 新增按钮 */
const handleAdd = () => {
    resetForm();
    dialog.title = '新增用户';
    dialog.visible = true;
};

/** 编辑按钮 */
const handleEdit = (row: User) => {
    resetForm();
    form.id = row.id;
    form.userName = row.userName;
    form.avatar = row.avatar;
    if (row.roles && row.roles.length > 0) {
        form.roleIds = row.roles.map(r => r.id);
    } else {
        form.roleIds = [];
    }
    dialog.title = '编辑用户';
    dialog.visible = true;
};

/** 提交表单 */
const submitForm = async () => {
    if (!userFormRef.value) return;
    await userFormRef.value.validate(async (valid: boolean) => {
        if (valid) {
            dialog.loading = true;
            try {
                if (form.id) {
                    // 编辑模式
                    await updateUser(form);
                    ElMessage.success('修改成功');
                } else {
                    // 新增模式
                    await addUser(form);
                    ElMessage.success('新增成功');
                }
                dialog.visible = false;
                handleQuery();
            } finally {
                dialog.loading = false;
            }
        }
    });
};

/** 删除用户 */
const handleDelete = (row: User) => {
    ElMessageBox.confirm(`确认删除用户 "${row.userName}" 吗?`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(async () => {
        await deleteUser(row.id);
        ElMessage.success('删除成功');
        handleQuery();
    });
};

/** 重置密码 (可选功能) */
const handleResetPwd = (row: User) => {
    ElMessageBox.prompt(`请输入用户 "${row.userName}" 的新密码`, '重置密码', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^.{6,}$/,
        inputErrorMessage: '密码长度至少6位'
    }).then(async ({ value }) => {
        await updateUser({ id: row.id, password: value } as any);
        ElMessage.success('密码重置成功');
    });
};

// 初始化
onMounted(() => {
    handleQuery();
    loadRoles(); // 页面加载时获取角色列表
});
</script>

<style scoped>
.mb-4 { margin-bottom: 16px; }
.mt-4 { margin-top: 16px; }
.flex { display: flex; }
.gap-2 { gap: 8px; }
.gap-1 { gap: 4px; }
.flex-wrap { flex-wrap: wrap; }
.justify-between { justify-content: space-between; }
.justify-end { justify-content: flex-end; }
</style>