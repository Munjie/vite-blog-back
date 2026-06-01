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
      <el-dialog v-model="progressVisible" title="分析报告生成中" width="400px" center :close-on-click-modal="false" :show-close="false">
        <div style="text-align: center">
          <el-progress type="circle" :percentage="exportPercentage" />
          <p style="margin-top: 15px; font-size: 14px; color: #666">{{ progressStatusText }}</p>
        </div>
      </el-dialog>
    </div>
</template>

<script setup lang="ts">
import {onMounted, ref, watch} from 'vue';
import CustomTable from '@/components/ActionTableCont.vue';
import {getTaskList, deleteTask, progress} from "../../api/task.ts";
import {CirclePlusFilled} from '@element-plus/icons-vue';
import {useRouter} from "vue-router";

const router = useRouter()
import {useRoute} from 'vue-router';
import {ElMessage, ElMessageBox} from "element-plus";
import axios from "axios";
import http from '../../api/http.ts';
import {useUserStore} from "../../stores";

const route = useRoute();
// 2. 定义点击事件处理函数
const handleAdd = () => {
    router.push('/task-add');
}
const taskId = ref();
const tableData = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);

const progressVisible = ref(false);
const exportPercentage = ref(0);
const progressStatusText = ref('');
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

const exportFun = async (row: { id: string | number, title: string }) => {
  try {
      const res = await http.post('/api/export/export-report', {
          taskId: row.id,
          title: row.title
      })
    if (res.status === 429) {
      ElMessage.warning('该报告正在生成中，请不要重复点击');
      return;
    }
    const jobId = res.data;

    console.log("000000000"+jobId);
    // 2. 初始化进度条
    progressVisible.value = true;
    exportPercentage.value = 0;
    progressStatusText.value = '正在排队分析各班级成绩...';
    // 3. 轮询进度接口
    const timer = setInterval(async () => {
      const { data } = await progress(jobId);
      if (data.status === 'processing') {
        exportPercentage.value = data.percent;
        progressStatusText.value = data.currentStage || '正在处理数据...';
      }
      else if (data.status === 'completed') {
        clearInterval(timer);
        exportPercentage.value = 100;
        progressStatusText.value = '生成完毕，正在下载文件...';

        // 4. 调用最终下载接口
        await allDownload(row.title,data.fileId);
        setTimeout(() => { progressVisible.value = false; }, 1000);
      }
      else if (data.status === 'failed') {
        clearInterval(timer);
        progressVisible.value = false;
        ElMessage.error('生成失败：' + data.errorMsg);
      }
    }, 1000);

  } catch (err) {
    ElMessage.error('导出系统繁忙，请稍后再试');
  }
};


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
        taskId.value = row.id
        await deleteTask(taskId.value)
        ElMessage.success("删除成功")
        await fetchList()
    } catch (error) {
        console.log('用户取消操作')
    }
}


const allDownload = async (title: string, filePath: string) => {
    const userStore = useUserStore();
    const token = userStore.getExpireToken();
    let info = {
        title: title,
        filePath: filePath,
    };
    try {
        const response = await axios.post('/api/export/download-excel', info, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            responseType: "blob"
        });
        if (response.data.type === 'application/json') {
            const text = await response.data.text();
            const errorObj = JSON.parse(text);
            ElMessage.error(errorObj.message || '下载失败，服务器内部错误');
            return;
        }
        const disposition = response.headers['content-disposition'] ?? response.headers['Content-Disposition'];
        let fileName = `${title || '下载文件'}.xlsx`;

        if (disposition) {
            const match = disposition.match(/filename[*]?=(?:UTF-8'')?([^;]+)/i);
            if (match?.[1]) {
                fileName = decodeURIComponent(match[1].replace(/"/g, ''));
            }
        }
        console.log('解析出的文件名:', fileName);
        const blob = new Blob([response.data]);
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        URL.revokeObjectURL(url);
        link.remove();
        ElMessage.success('下载完成');
    } catch (error: any) {
        console.error('下载过程中发生网络或系统异常:', error);
        ElMessage.error('网络连接失败或服务器无响应');
    }
};


const fetchList = async () => {
    try {
        let taskForm = {
            pageSize: pageSize.value,
            pageNum: currentPage.value
        }
        const res = await getTaskList(taskForm);
        tableData.value = res.data.records
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


</script>