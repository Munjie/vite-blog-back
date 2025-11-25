<template>
    <div>
        <ActionButtonGroup
            :show-add="hasPermission('demo2:create')"
            :show-delete="true"
            :disabled-add="false"
            :disabled-edit="!selectedData.length"
            :disabled-delete="!selectedData.length"
            @add="handleAdd"
            @edit="handleEdit"
            @delete="handleDelete"
        />
        <!-- 表格 -->
        <CustomTable
            :tableColumns="columns"
            :tableData="data"
            :pageSize="pageSize"
            :total = "total"
            :pageSizes="[5, 10, 15, 20, 30]"
            :showSelection="true"
            @update:currentPage="currentPage = $event"
            @update:pageSize="pageSize = $event"
            @selection-change="handleSelectionChange"
        />


        <!-- 显示选中数据 -->
        <div v-if="selectedData.length > 0" style="margin-top: 20px">
            <h3>选中的数据：</h3>
            <pre>{{ selectedData }}</pre>
        </div>
    </div>
</template>

<script setup>
import {ref} from 'vue';
import CustomTable from '@/components/ActionTableCont.vue';
import {usePermission} from "@/utils/permissionUtils";
import ActionButtonGroup from "@/components/ActionBtnHdrCont.vue";
import {pageTask} from "@/api/task.js";
import {ElMessage} from "element-plus";

const hasPermission = usePermission();
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
        const res = await pageTask(taskForm);
        data.value = res.data.records,
        total.value = res.data.total
        console.log("sadad"+  data.value)

    } catch (error) {
        console.log('登录请求失败，请稍后再试'+error);

    }
};

onMounted(() => {
    getList()
})


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