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
                    :deleteFunc="deleteFun"
                    @update:current-page="handlePageChange"
                    @update:page-size="handlePageSizeChange"
                    @selection-change="handleSelectionChange"
            >
            </CustomTable>
        </div>
    </div>
</template>

<script setup lang="ts">
import {onMounted, ref, watch} from 'vue';
import CustomTable from '@/components/ActionTableCont.vue';
import {useRoute} from 'vue-router';
import {ElMessage, ElMessageBox} from "element-plus";
import {deleteComment, getAllComment} from "../../api/comment.ts";

const route = useRoute();
// 2. 定义点击事件处理函数
const id = ref();
const tableData = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const tableColumns = ref([
    {type: 'index', label: '序号', align: 'center', width: 80},
    {
        prop: 'content',
        label: '评论内容',
    },
    {
        prop: 'likes',
        label: '点赞',
    },
    {
        prop: 'createTime',
        label: '创建日期',
    },
    {prop: 'operator', label: '操作', width: 260},
]);


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
        id.value = row.id
        await deleteComment(id.value)
        ElMessage.success("删除成功")
        await fetchList()
    } catch (error) {
        console.log('用户取消操作')
    }
}


const fetchList = async () => {
    try {
        let articleForm = {
            pageSize: pageSize.value,
            pageNum: currentPage.value
        }
        const res = await getAllComment(articleForm);
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

// 分页变化处理
const handlePageChange = (page:any) => {
    currentPage.value = page;
    fetchList();
};

const handlePageSizeChange = (size:any) => {
    pageSize.value = size;
    fetchList();
};

watch(
    () => route.path,
    () => {
        if (route.path === '/comment-list') {
            fetchList();
        }
    },
    {immediate: false}
);

// 用于存储选中的数据
const selectedData = ref([]);

// 处理选中数据变化
const handleSelectionChange = (selection:any) => {
    selectedData.value = selection;
};





</script>