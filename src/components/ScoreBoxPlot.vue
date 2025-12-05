<script setup lang="ts">
import { ref, watch } from 'vue';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import {
    BoxplotChart,
    ScatterChart,
} from 'echarts/charts';
import {
    TitleComponent,
    TooltipComponent,
    GridComponent,
    DataZoomComponent,
} from 'echarts/components';
import VChart from 'vue-echarts';
import type { BoxPlotDataVO } from '../types/BoxPlotData.ts';

// 注册 ECharts 所需模块（只注册用到的，树摇优化）
use([
    CanvasRenderer,
    BoxplotChart,
    ScatterChart,
    TitleComponent,
    TooltipComponent,
    GridComponent,
    DataZoomComponent,
]);

const props = defineProps<{
    data: BoxPlotDataVO[];   // 父组件传入的数据
    loading?: boolean;       // 可选：加载状态
    title?: string;          // 可选：图表标题
}>();

const chartOption = ref<any>({});

const transformData = (list: BoxPlotDataVO[]) => {
    if (!list || list.length === 0) return { classNames: [], boxData: [], outlierData: [] };

    const classNames = list.map(item => item.className);

    const boxData = list.map(item => [
        item.min,
        item.q1,
        item.median,
        item.q3,
        item.max,
    ]);

    // 异常值需要 [xIndex, value] 形式
    const outlierData = list.map((item, index) =>
        (item.outliers || []).map(value => [index, value])
    );

    return { classNames, boxData, outlierData: outlierData.flat() };
};

watch(
    () => props.data,
    (newData) => {
        if (!newData || newData.length === 0) {
            chartOption.value = {};
            return;
        }

        const { classNames, boxData, outlierData } = transformData(newData);

        chartOption.value = {
            backgroundColor: '#fff',
            title: {
                text: props.title || '各班级成绩箱线图',
                left: 'center',
                top: 10,
            },
            tooltip: {
                trigger: 'item',
                axisPointer: { type: 'shadow' },
            },
            grid: {
                left: '10%',
                right: '10%',
                bottom: '15%',
                containLabel: true,
            },
            xAxis: {
                type: 'category',
                data: classNames,
                name: '班级',
                axisLabel: {
                    rotate: classNames.length > 10 ? 30 : 0,
                    interval: 0,
                },
            },
            yAxis: {
                type: 'value',
                name: '分数',
            },
            series: [
                {
                    name: '箱体',
                    type: 'boxplot',
                    data: boxData,
                    itemStyle: {
                        color: '#b8c5f2',
                        borderColor: '#4a6ee0',
                    },
                    tooltip: {
                        formatter: (param: any) => {
                            const d = param.data;
                            return [
                                `<strong>${classNames[param.dataIndex]}</strong>`,
                                `最大值: ${d[4]}`,
                                `上四分位数(Q3): ${d[3]}`,
                                `中位数: ${d[2]}`,
                                `下四分位数(Q1): ${d[1]}`,
                                `最小值: ${d[0]}`,
                            ].join('<br/>');
                        },
                    },
                },
                {
                    name: '异常值',
                    type: 'scatter',
                    data: outlierData,
                    symbolSize: 8,
                    itemStyle: {
                        color: '#c23531',
                        borderColor: '#fff',
                        borderWidth: 1,
                    },
                    tooltip: {
                        formatter: (param: any) => `异常值: ${param.data[1]}`,
                    },
                },
            ],
        };
    },
    { immediate: true }
);
</script>

<template>
    <div class="boxplot-container">
        <v-chart  :option="chartOption" autoresize class="echart" />
    </div>
</template>

<style scoped>
.boxplot-container {
    position: relative;
    width: 100%;
    height: 560px;
}
.echart {
    width: 100%;
    height: 100%;
}
.loading {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 18px;
    color: #666;
}
</style>