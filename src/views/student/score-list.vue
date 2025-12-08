<template>
    <div>
        <!-- 表格 -->
        <TableSearch :query="query" :options="searchOpt" :search="handleSearch" />
        <div class="container">
        <CustomTable
            :tableColumns="tableColumns"
            :tableData="tableData"
            :pageSize="pageSize"
            :total = "total"
            :pageSizes="[10, 20, 40, 60]"
            :showSelection="true"
            @update:current-page="handlePageChange"
            @update:page-size="handlePageSizeChange"
            @selection-change="handleSelectionChange"
        >
        </CustomTable>
        </div>
    </div>
</template>

<script setup lang="ts">
import {onMounted, reactive, ref} from 'vue';
import CustomTable from '@/components/ActionTableCont.vue';
import TableSearch from '@/components/table-search.vue';
import {getScoreList} from "../../api/student.ts";
import {useRoute} from 'vue-router'
import type {FormOptionList} from "../../types/form-option.ts";
const route = useRoute()
const taskId = ref()

// 查询相关
const searchOpt = ref<FormOptionList[]>([
    { type: 'input', label: '姓名：', prop: 'name' },
    { type: 'input', label: '班级：', prop: 'lesson' }
])
const handleSearch = () => {
    taskId.value = route.query.taskId
    getList(taskId.value)
};

onMounted(() => {
    taskId.value = route.query.taskId
    getList(taskId.value)
})


const tableData = ref([]);
const total =  ref(0);
const currentPage = ref(1);
const pageSize = ref(20);
const tableColumns = ref([
    { type: 'index', label: '序号', align: 'center' ,width: 80},
    {
        prop: 'studentId',
        label: '学号',
    },
    {
        prop: 'name',
        label: '姓名',
    },
    {
        prop: 'lesson',
        label: '班级',
    },
    {
        prop: 'school',
        label: '学校',
    },
    {
        prop: 'geographyScore',
        label: '地理成绩',
    },
    { prop: 'operator', label: '操作', width: 260},
]);

// 查询相关
const query = reactive({
    name: '',
    lesson: '',
});



const getList = async (any: any) => {
    try {
        let taskForm = {
            pageSize: pageSize.value,
            pageNum: currentPage.value,
            taskId : any,
            name : query.name,
            lesson : query.lesson
        }
        const res = await getScoreList(taskForm);
        tableData.value = res.data.records,
            total.value = res.data.total
        console.log('API数据:', tableData.value);

    } catch (error) {
        console.log('登录请求失败，请稍后再试'+error);

    }
};


// 分页变化处理（替换原 @update 事件，避免直接赋值导致 watch 延迟）
const handlePageChange = (page: any) => {
    taskId.value = route.query.taskId
    currentPage.value = page;
    getList(taskId.value);  // 立即加载新页
};

const handlePageSizeChange = (size: any) => {
    taskId.value = route.query.taskId
    pageSize.value = size;
    getList(taskId.value);  // 页大小变化也重新加载
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
const handleSelectionChange = (selection: any) => {
    taskId.value = route.query.taskId
    selectedData.value = selection;
};

// 获取选中数据
</script>