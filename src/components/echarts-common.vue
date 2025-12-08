
<template>
    <div class="chart-container">
        <div ref="chartRef" style="width: 100%; height: 400px;"></div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import * as echarts from 'echarts';


// 3. 定义响应式变量
const chartRef = ref<HTMLElement | null>(null); // 绑定 DOM 的引用
let chartInstance: echarts.ECharts | null = null; // 存储图表实例

// 4. 定义图表配置项 (使用 EChartsOption 类型，确保类型安全)
const chartOptions: {
    yAxis: { type: string };
    xAxis: { data: string[]; type: string };
    legend: { data: string[]; top: number };
    series: { data: number[]; name: string; itemStyle: { color: string }; type: string }[];
    tooltip: { trigger: string };
    title: { left: string; text: string; textStyle: { color: string } }
} = {
    title: {
        text: 'Vue3 + TypeScript ECharts 示例',
        left: 'center',
        textStyle: {
            color: '#333'
        }
    },
    tooltip: {
        trigger: 'axis' // 鼠标悬停时显示轴上数据
    },
    legend: {
        data: ['销量'],
        top: 35
    },
    xAxis: {
        type: 'category',
        data: ['衬衫', '羊毛衫', '雪纺衫', '裤子', '高跟鞋', '袜子']
    },
    yAxis: {
        type: 'value'
    },
    series: [
        {
            name: '销量',
            type: 'bar', // 柱状图
            data: [5, 20, 36, 10, 10, 20],
            itemStyle: {
                color: '#5470C6'
            }
        }
    ]
};

// 5. 初始化图表函数
const initChart = () => {
    if (chartRef.value) {
        // 初始化 ECharts 实例
        chartInstance = echarts.init(chartRef.value);

        // 设置配置项
        chartInstance.setOption(chartOptions);
    }
};

// 6. 响应式处理：调整窗口大小时，图表自动重绘
const resizeChart = () => {
    chartInstance?.resize();
};

// 7. 生命周期钩子
onMounted(() => {
    initChart();
    // 监听窗口大小变化
    window.addEventListener('resize', resizeChart);
});

onUnmounted(() => {
    // 在组件销毁时，移除事件监听和销毁图表实例，防止内存泄漏
    window.removeEventListener('resize', resizeChart);
    chartInstance?.dispose();
});

</script>

<style scoped>
.chart-container {
    /* 确保容器有足够的空间 */
    padding: 20px;
    border: 1px solid #eee;
}
</style>