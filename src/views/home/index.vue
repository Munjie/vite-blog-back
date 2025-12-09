<template>
    <div>
        <TableSearch :query="query" :options="searchOpt" :search="handleSearch"/>
        <el-row :gutter="20" class="mgb20">
            <el-col :span="6">
                <el-card shadow="hover" body-class="card-body">
                    <el-icon class="card-icon bg1">
                        <Notebook/>
                    </el-icon>
                    <div class="card-content">
                        <countup class="card-num color1" :end="total"/>
                        <div>地理总分最高{{ maxTotalClass }}</div>
                    </div>
                </el-card>
            </el-col>
            <el-col :span="6">
                <el-card shadow="hover" body-class="card-body">
                    <el-icon class="card-icon bg2">
                        <School/>
                    </el-icon>
                    <div class="card-content">
                        <countup class="card-num color2" :end="avg"/>
                        <div>地理平均分最高{{ maxAvgClass }}</div>
                    </div>
                </el-card>
            </el-col>
            <el-col :span="6">
                <el-card shadow="hover" body-class="card-body">
                    <el-icon class="card-icon bg3">
                        <Top/>
                    </el-icon>
                    <div class="card-content">
                        <countup class="card-num color3" :end="maxGt"/>
                        <div>40分以上人数最多{{ maxGtClass }}</div>
                    </div>
                </el-card>
            </el-col>
            <el-col :span="6">
                <el-card shadow="hover" body-class="card-body">
                    <el-icon class="card-icon bg4">
                        <Star/>
                    </el-icon>
                    <div class="card-content">
                        <countup class="card-num color4" :end="maxLt"/>
                        <div>30分以下人数最多{{ maxLtClass }}</div>
                    </div>
                </el-card>
            </el-col>
        </el-row>

        <el-row :gutter="20" class="mgb20">
            <el-col :span="18">
                <el-card shadow="hover">
                    <div class="card-header">
                        <p class="card-header-title">成绩动态</p>
                    </div>
                    <BoxPlotChart
                            :data="data"
                            :loading="loading"
                            title="各班级成绩箱线图"
                    />
                </el-card>
            </el-col>
            <el-col :span="6">
                <el-card shadow="hover">
                    <div class="card-header">
                        <p class="card-header-title">成绩分布</p>
                    </div>
                    <v-chart class="chart" :option="scorePie"/>
                </el-card>
            </el-col>
        </el-row>
        <el-row :gutter="20">
            <el-col :span="7">
                <el-card shadow="hover" :body-style="{ height: '400px' }">
                    <div class="card-header">
                        <p class="card-header-title">平均分</p>
                    </div>
                    <!--                    <el-timeline>
                                            <el-timeline-item v-for="(activity, index) in activities" :key="index" :color="activity.color">
                                                <div class="timeline-item">
                                                    <div>
                                                        <p>{{ activity.content }}</p>
                                                        <p class="timeline-desc">{{ activity.description }}</p>
                                                    </div>
                                                    <div class="timeline-time">{{ activity.timestamp }}</div>
                                                </div>
                                            </el-timeline-item>
                                        </el-timeline>-->
                </el-card>
            </el-col>
            <el-col :span="10">
                <el-card shadow="hover" :body-style="{ height: '400px' }">
                    <div class="card-header">
                        <p class="card-header-title">中位数</p>
                    </div>
                    <!--                    <v-chart class="map-chart" :option="mapOptions" />-->
                </el-card>
            </el-col>
            <el-col :span="7">
                <el-card shadow="hover" :body-style="{ height: '400px' }">
                    <div class="card-header">
                        <p class="card-header-title">排行榜</p>
                    </div>
                    <div>
                        <!--                        <div class="rank-item" v-for="(rank, index) in ranks">
                                                    <div class="rank-item-avatar">{{ index + 1 }}</div>
                                                    <div class="rank-item-content">
                                                        <div class="rank-item-top">
                                                            <div class="rank-item-title">{{ rank.title }}</div>
                                                            <div class="rank-item-desc">分数：{{ rank.value }}</div>
                                                        </div>
                                                        <el-progress
                                                            :show-text="false"
                                                            striped
                                                            :stroke-width="10"
                                                            :percentage="rank.percent"
                                                            :color="rank.color"
                                                        />
                                                    </div>
                                                </div>-->
                    </div>
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>

<script setup lang="ts" name="dashboard">
import {use, registerMap} from 'echarts/core';
import {BarChart, LineChart, PieChart, MapChart, BoxplotChart} from 'echarts/charts';
import BoxPlotChart from '@/components/ScoreBoxPlot.vue';
import {
    GridComponent,
    TooltipComponent,
    LegendComponent,
    TitleComponent,
    VisualMapComponent,
} from 'echarts/components';
import {CanvasRenderer} from 'echarts/renderers';

;
// 引入 echarts 库
import VChart from 'vue-echarts'
import chinaMap from '../../utils/china';
import {nextTick, onMounted, ref} from "vue";
import {getHomeAllTask, getHomeData} from "../../api/home.ts";
import type {FormOptionList} from "../../types/form-option.ts";
import type {BoxPlotDataVO} from "../../types/BoxPlotData.ts";
import {ElMessage} from "element-plus";


use([
    BoxplotChart,
    CanvasRenderer,
    BarChart,
    GridComponent,
    LineChart,
    PieChart,
    TooltipComponent,
    LegendComponent,
    TitleComponent,
    VisualMapComponent,
    MapChart,
]);
registerMap('china', chinaMap);
// 查询相关
const query = ref({
    name: '',
    lesson: '',
    taskName: '',
});
const searchOpt = ref<FormOptionList[]>([])
// 查询相关
// const taskOptions = ref<{ label: string; value: number; }[]>([]);
const taskOptions = ref();
// loading 状态
const taskLoading = ref(false)
const handleSearch = () => {
    fetchHomeData()
};
const classScoreChartOptions = ref<any>({});
const scorePie = ref<any>({});
const total = ref(0.0);
const avg = ref(0.0);
const data = ref<BoxPlotDataVO[]>([]);
const loading = ref(true);

const maxTotalClass = ref();
const maxAvgClass = ref();

const maxGtClass = ref();
const maxLtClass = ref();
const maxGt = ref();
const maxLt = ref();

searchOpt.value = [
    {
        type: 'input',
        label: '姓名：',
        prop: 'name',
        placeholder: '请输入姓名'
    },
    {
        type: 'input',
        label: '班级：',
        prop: 'lesson',
        placeholder: '请输入班级'
    },
    {
        type: 'select',
        label: '任务名称：',
        prop: 'taskName',
        placeholder: '选择统计任务',
        opts:taskOptions
        /*opts: [
            {label:'任务1',value:'1'},
            {label:'任务2',value:'2'},
        ]*/
    }
];
const fetchHomeData = async () => {
    try {
        let homeForm = {
            name: query.value.name,
            lesson: query.value.lesson,
            taskName: query.value.taskName,
        }
        const res = await getHomeData(homeForm);
        maxTotalClass.value = res.data.maxSumClass
        maxAvgClass.value = res.data.maxAvgClass
        //
        maxGtClass.value = res.data.maxGtClass
        maxLtClass.value = res.data.maxLtClass
        maxGt.value = res.data.maxGt
        maxLt.value = res.data.maxLt
        //
        total.value = res.data.total
        avg.value = res.data.avg
        classScoreChartOptions.value = generateDashOpt(res.data.scoresBar);
        scorePie.value = generatePie(res.data.scorePies);
        data.value = res.data.boxPlotDataVOS;
        console.log(classScoreChartOptions.value)
    } catch (error) {
        console.log('登录请求失败，请稍后再试' + error);

    }
};

const fetchHomeAllTask = async () => {
    taskLoading.value = true
    try {
        // 替换成你的真实接口
        const res = await getHomeAllTask();
        taskOptions.value = (res as any).data.map((item: any) => ({
            label: item.label,
            value: String(item.value)
        }))
        query.value.taskName = taskOptions.value[0]?.value ?? ''
        // 自动触发搜索（关键！）
        await nextTick()
        await fetchHomeData()

    } catch (error) {
        console.error('加载任务列表失败', error)
        taskOptions.value = []
        ElMessage.error('加载任务列表失败')
    } finally {
        taskLoading.value = false
    }
}
onMounted(async () => {
    await fetchHomeAllTask();
    console.log("656565"+taskOptions.value)
});


const generateDashOpt = (data: any) => {
    return {
        // --- X 轴配置 ---
        xAxis: {
            type: 'category',
            data: data.categories,
        },
        yAxis: {
            type: 'value',
        },
        series: [
            {
                type: 'bar',
                smooth: true,
                data: data.value,
            },
        ],
        tooltip: {
            trigger: 'axis',
        }
    };
};

const generatePie = (data: any) => {
    return {
        legend: {
            left: 'center',
        },
        tooltip: {
            trigger: 'item'
        },
        series: [
            {
                type: 'pie',
                data: data
            },
        ],
    };
};
</script>

<style>
.card-body {
    display: flex;
    align-items: center;
    height: 100px;
    padding: 0;
}
</style>
<style scoped>
.card-content {
    flex: 1;
    text-align: center;
    font-size: 14px;
    color: #999;
    padding: 0 20px;
}

.card-num {
    font-size: 30px;
}

.card-icon {
    font-size: 50px;
    width: 100px;
    height: 100px;
    text-align: center;
    line-height: 100px;
    color: #fff;
}

.bg1 {
    background: #2d8cf0;
}

.bg2 {
    background: #64d572;
}

.bg3 {
    background: #f25e43;
}

.bg4 {
    background: #e9a745;
}

.color1 {
    color: #2d8cf0;
}

.color2 {
    color: #64d572;
}

.color3 {
    color: #f25e43;
}

.color4 {
    color: #e9a745;
}

.chart {
    width: 100%;
    height: 400px;
}

.card-header {
    padding-left: 10px;
    margin-bottom: 20px;
}

.card-header-title {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 5px;
}

.card-header-desc {
    font-size: 14px;
    color: #999;
}

.timeline-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 16px;
    color: #000;
}

.timeline-time,
.timeline-desc {
    font-size: 12px;
    color: #787878;
}

.rank-item {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
}

.rank-item-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #f2f2f2;
    text-align: center;
    line-height: 40px;
    margin-right: 10px;
}

.rank-item-content {
    flex: 1;
}

.rank-item-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #343434;
    margin-bottom: 10px;
}

.rank-item-desc {
    font-size: 14px;
    color: #999;
}

.map-chart {
    width: 100%;
    height: 350px;
}
</style>
