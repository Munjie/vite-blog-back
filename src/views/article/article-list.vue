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
                    @update:current-page="handlePageChange"
                    @update:page-size="handlePageSizeChange"
                    @selection-change="handleSelectionChange"
            >
                <template #toolbarBtn>
                    <el-button type="warning" :icon="CirclePlusFilled" @click="handleAdd">新增文章</el-button>
                </template>
            </CustomTable>
        </div>
    </div>
</template>

<script setup lang="ts">
import {onMounted, ref, watch} from 'vue';
import CustomTable from '@/components/ActionTableCont.vue';
import {getArticleList,deleteArticle} from "../../api/article";
import {CirclePlusFilled} from '@element-plus/icons-vue';
import {useRouter} from "vue-router";

const router = useRouter()
import {useRoute} from 'vue-router';
import {ElMessage, ElMessageBox} from "element-plus";

const route = useRoute();
// 2. 定义点击事件处理函数
const handleAdd = () => {
    router.push('/task-add');
}
const id = ref();
const tableData = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const tableColumns = ref([
    {type: 'index', label: '序号', align: 'center', width: 80},
    {
        prop: 'title',
        label: '文章标题',
    },
    {
        prop: 'image',
        label: '封面',
    },
    {
        prop: 'status',
        label: '是否发布',
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
        await deleteArticle(id.value)
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
        const res = await getArticleList(articleForm);
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
        if (route.path === '/article-list') {
            fetchList();
        }
    },
    {immediate: false} // 初始时不执行，onMounted已经执行过了
);

// 用于存储选中的数据
const selectedData = ref([]);

// 处理选中数据变化
const handleSelectionChange = (selection:any) => {
    selectedData.value = selection;
};


</script>