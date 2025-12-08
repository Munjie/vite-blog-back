<template>
    <div>
        <!-- 表格 -->
        <div class="container">
            <CustomTable
                    :tableColumns="tableColumns"
                    :tableData="tableData"
                    :pageSize="pageSize"
                    :total="total"
                    :pageSizes="[5, 10, 15, 20, 30]"
                    :showSelection="true"
                    :viewFunc="handleView"
                    :deleteFunc="deleteFun"
                    :exportFunc="exportFun"
                    :showExport="true"
                    @update:current-page="handlePageChange"
                    @update:page-size="handlePageSizeChange"
                    @selection-change="handleSelectionChange"
            >
                <template #toolbarBtn>
                    <el-button type="warning" :icon="CirclePlusFilled" @click="handleAdd">新增任务</el-button>
                </template>
            </CustomTable>
        </div>
    </div>
</template>

<script setup lang="ts">
import {onMounted, ref, watch} from 'vue';
import CustomTable from '@/components/ActionTableCont.vue';
import {getTaskList, deleteTask} from "../../api/task.ts";
import {CirclePlusFilled} from '@element-plus/icons-vue';
import {useRouter} from "vue-router";

const router = useRouter()
import {useRoute} from 'vue-router';
import {ElMessage, ElMessageBox} from "element-plus";
import axios from "axios";

const route = useRoute();
// 2. 定义点击事件处理函数
const handleAdd = () => {
    router.push('/task-add');
}
const taskId = ref();
const title = ref();
const tableData = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const tableColumns = ref([
    {type: 'index', label: '序号', align: 'center', width: 80},
    {
        prop: 'taskName',
        label: '任务名称',
    },
    {
        prop: 'title',
        label: '标题',
    },
    {
        prop: 'status',
        label: '任务状态',
    },
    {
        prop: 'createTime',
        label: '创建日期',
    },
    {prop: 'operator', label: '操作', width: 260},
]);

// 查询相关
const handleView = (row: { id: string | number }) => {
    console.log(row.id)
    router.push({
        path: '/score-list',
        query: {
            taskId: row.id
        }
    });
};

/*const deleteFun = async (row: { id: string | number }) => {
    taskId.value = row.id;
    await deleteTask(taskId.value);
    ElMessage.success("删除成功")
    await fetchList();

};*/


const deleteFun = async (row: { id: string | number }) => {
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
        // 用户点击确定后
        taskId.value = row.id
        await deleteTask(taskId.value)
        ElMessage.success("删除成功")
        await fetchList()
    } catch (error) {
        console.log('用户取消操作')
    }
}
const exportFun = async (row: { id: string | number, title: string }) => {
    // GET 方法不设置header  解压报错，使用post
    taskId.value = row.id;
    title.value = row.title;
    debugger
    let info = {
        taskId: taskId.value,
        title: title.value,
    }
    const response = await axios.post('/api/task/export-report', info, {
        headers: {'Content-Type': 'application/json; application/octet-stream'},
        responseType: "blob"
    })
    const fileName = name || (response.headers['content-disposition'] &&
        decodeURI(response.headers['content-disposition'])
            .split('filename=')[1]);
    console.log(fileName)
    const blob = new Blob([response.data], {type: 'application/zip'});
    // 创建下载链接
    const url = URL.createObjectURL(blob);
    // 创建虚拟a标签进行下载
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    // 释放URL对象
    URL.revokeObjectURL(url);
    link.remove();
    ElMessage.success('下载完成')

};


const fetchList = async () => {
    try {
        let taskForm = {
            pageSize: pageSize.value,
            pageNum: currentPage.value
        }
        const res = await getTaskList(taskForm);
        tableData.value = res.data.records,
            total.value = res.data.total
        console.log('API数据:', tableData.value);

    } catch (error) {
        console.log('登录请求失败，请稍后再试' + error);

    }
};

onMounted(() => {
    fetchList()
})

// 分页变化处理（替换原 @update 事件，避免直接赋值导致 watch 延迟）
const handlePageChange = (page:any) => {
    currentPage.value = page;
    fetchList();  // 立即加载新页
};

const handlePageSizeChange = (size:any) => {
    pageSize.value = size;
    fetchList();  // 页大小变化也重新加载
};

watch(
    () => route.path, // 监听路由路径
    () => {
        // 确保只有在当前组件是活跃状态时才重新查询
        if (route.path === '/task-list') {
            fetchList();
        }
    },
    {immediate: false} // 初始时不执行，onMounted已经执行过了
);
// 监听页码或页大小变化，重新查询
/*watch(
    [currentPage, pageSize],
    () => {
        getList();
    },
);*/

// 用于存储选中的数据
const selectedData = ref([]);

// 处理选中数据变化
const handleSelectionChange = (selection:any) => {
    selectedData.value = selection;
};

// 获取选中数据
/*const handleDelete = () => {
    console.log('Selected Data:', selectedData.value);
    console.log('Selected  Data length:', selectedData.value.length);
    if (selectedData.value.length > 0) {
        // 删除逻辑
        console.log('Deleting selected data...');
        selectedData.value = [];
    } else {
        console.log('No selected data to delete.');
    }

};*/
</script>