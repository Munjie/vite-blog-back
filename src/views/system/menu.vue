<template>
    <div>
        <!-- 表格 -->
        <CustomTable
            :tableColumns="columns"
            :tableData="data"
            :pageSize="pageSize"
            :total = "total"
            :pageSizes="[5, 10, 15, 20, 30]"
            :showSelection="true"
            @update:current-page="handlePageChange"
            @update:page-size="handlePageSizeChange"
            @selection-change="handleSelectionChange"
        />
    </div>
</template>

<script setup>
import {onMounted, ref, watch} from 'vue';
import CustomTable from '@/components/ActionTableCont.vue';
import {getTaskList} from "@/api/task";


const data = ref([]);
const total =  ref(0);
const currentPage = ref(1);
const pageSize = ref(5);

const columns = ref([
    {
        prop: 'taskName',
        label: '任务名称',
    },
    {
        prop: 'status',
        label: '任务状态',
    },
    {
        prop: 'createTime',
        label: '创建日期',
    },
]);

const getList = async () => {
    try {
        let taskForm = {
            pageSize: pageSize.value,
            pageNum: currentPage.value
        }
        const res = await getTaskList(taskForm);
        data.value = res.data.records,
            total.value = res.data.total
        console.log('API数据:', data.value);

    } catch (error) {
        console.log('登录请求失败，请稍后再试'+error);

    }
};

onMounted(() => {
    getList()
})

// 分页变化处理（替换原 @update 事件，避免直接赋值导致 watch 延迟）
const handlePageChange = (page) => {
    currentPage.value = page;
    getList();  // 立即加载新页
};

const handlePageSizeChange = (size) => {
    pageSize.value = size;
    getList();  // 页大小变化也重新加载
};
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
const handleSelectionChange = (selection) => {
    selectedData.value = selection;
};

// 获取选中数据
const handleDelete = () => {
    console.log('Selected Data:', selectedData.value);
    console.log('Selected  Data length:', selectedData.value.length);
    if (selectedData.value.length > 0) {
        // 删除逻辑
        console.log('Deleting selected data...');
        selectedData.value = [];
    } else {
        console.log('No selected data to delete.');
    }

};
</script>