<template>
  <div class="dashboard-container">
    <el-row :gutter="20" class="mb-4">
      <el-col :xs="24" :sm="12" :md="6" v-for="(item, index) in statCards" :key="index">
        <el-card shadow="hover" class="stat-card" :body-style="{ padding: '20px' }">
          <div class="stat-content">
            <div class="stat-icon" :style="{ background: item.color }">
              <el-icon color="#fff" :size="24">
                <component :is="item.icon" />
              </el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-title">{{ item.title }}</div>
              <div class="stat-value">
                {{ item.value }}
              </div>
              <div class="stat-trend">
                <span :class="item.trend > 0 ? 'text-green' : 'text-red'">
                  {{ item.trend > 0 ? '+' : '' }}{{ item.trend }}%
                  <el-icon>
                    <component :is="item.trend > 0 ? 'Top' : 'Bottom'" />
                  </el-icon>
                </span>
                <span class="text-gray">较昨日</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mb-4">
      <el-col :xs="24" :lg="16">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <span>🗺️ 访客地域分布</span>
              <el-tag type="success" size="small" effect="dark">实时更新</el-tag>
            </div>
          </template>
          <div ref="mapChartRef" style="height: 450px;"></div>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="8">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header"><span>🔥 热门搜索词</span></div>
          </template>
          <div ref="wordCloudRef" style="height: 450px;"></div>
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="20" class="mb-4">
      <el-col :xs="24" :lg="16">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <span>📊 访问流量趋势</span>
              <el-radio-group v-model="timeRange" size="small">
                <el-radio-button label="week">本周</el-radio-button>
                <el-radio-button label="month">本月</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="lineChartRef" style="height: 350px;"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="8">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <span>📂 文章分类占比</span>
            </div>
          </template>
          <div ref="pieChartRef" style="height: 350px;"></div>
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :xs="24" :md="12">
        <el-card shadow="hover" class="list-card">
          <template #header>
            <div class="card-header">
              <span>🔔 最新评论</span>
              <el-link type="primary">查看全部</el-link>
            </div>
          </template>
          <div class="comment-list">
            <div v-for="i in 4" :key="i" class="comment-item">
              <el-avatar :size="36" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
              <div class="comment-content">
                <div class="comment-user">User_{{ i }} <span class="time">10分钟前</span></div>
                <div class="comment-text text-truncate">这篇文章写得太好了，帮我解决大问题...</div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :md="12">
        <el-card shadow="hover" class="list-card">
          <template #header>
            <div class="card-header">
              <span>🚀 快捷操作</span>
            </div>
          </template>
          <div class="quick-actions">
            <el-button type="primary" plain icon="Edit">发布文章</el-button>
            <el-button type="success" plain icon="Picture">图片管理</el-button>
            <el-button type="warning" plain icon="Setting">系统设置</el-button>
            <el-button type="info" plain icon="Link">友链管理</el-button>
          </div>
          <div class="mt-4">
            <h4>系统健康度</h4>
            <el-progress :percentage="85" :format="format" status="success" striped striped-flow />
            <div class="mt-2 text-gray text-sm">内存使用率 / JVM</div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, markRaw } from 'vue';
import * as echarts from 'echarts';
import 'echarts-wordcloud';
import {Document, View, ChatLineRound, Monitor} from '@element-plus/icons-vue';
import {getVisitMap, getVisitCount} from "../../api/home.ts";
import  geoJSONSample from "../../utils/china_all.ts"

// --- 状态数据 ---
const timeRange = ref('week');
const lineChartRef = ref<HTMLElement | null>(null);
const pieChartRef = ref<HTMLElement | null>(null);
const mapChartRef = ref<HTMLElement | null>(null);
const wordCloudRef = ref<HTMLElement | null>(null);
let charts: echarts.ECharts[] = [];
let lineChart: echarts.ECharts | null = null;
let pieChart: echarts.ECharts | null = null;

const format = (percentage: number) => (percentage === 100 ? 'Full' : `${percentage}%`);
const mapData = ref();
const statCards = ref();
const icons = [markRaw(Document), markRaw(View), markRaw(ChatLineRound), markRaw(Monitor)];
const colors = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #2af598 0%, #009efd 100%)',
  'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)'
];



const initStatCards = async () => {

  const response = await getVisitCount();
  statCards.value = response.map((item: any, index: any) => ({
    ...item,
    icon: icons[index],
    color: colors[index]
  }));
}
const initMap = async () => {
  if (!mapChartRef.value) return;
  const myChart = echarts.init(mapChartRef.value);

  try {
    const response = await getVisitMap()
    mapData.value = (response as any).data.map((item: any) => ({
      name: item.name,
      value: item.value
    }))
    echarts.registerMap('china', geoJSONSample as any);
    myChart.setOption({
      tooltip: { trigger: 'item', formatter: '{b}<br/>访客数: {c}' },
      visualMap: {
        min: 0, max: 1000, left: 'left', bottom: '10', text: ['高', '低'],
        inRange: { color: ['#e0ffff', '#006edd'] },
        calculable: true
      },
      geo: {
        map: 'china', roam: false, zoom: 1.2,
        itemStyle: { areaColor: '#f3f4f6', borderColor: '#fff' },
        emphasis: { itemStyle: { areaColor: '#a18cd1' }, label: { show: true, color: '#fff' } }
      },
      series: [{
        name: '访客地域分布', type: 'map', geoIndex: 0,
        data: mapData.value
      }]
    });
    charts.push(myChart);
  } catch (e) {
    console.error('地图数据加载失败', e);
  }
};

// --- 初始化词云 ---
const initWordCloud = () => {
  if (!wordCloudRef.value) return;
  const myChart = echarts.init(wordCloudRef.value);
  myChart.setOption({
    series: [{
      type: 'wordCloud',
      shape: 'circle',
      sizeRange: [14, 50],
      rotationRange: [-45, 90],
      gridSize: 10,
      textStyle: {
        fontFamily: 'sans-serif',
        fontWeight: 'bold',
        color: () => `rgb(${Math.round(Math.random()*160)}, ${Math.round(Math.random()*160)}, ${Math.round(Math.random()*160)})`
      },
      data: [
        { name: 'Vue3', value: 100 }, { name: 'TypeScript', value: 80 },
        { name: 'SpringBoot', value: 95 }, { name: 'ElementPlus', value: 70 },
        { name: 'Redis', value: 50 }, { name: 'Docker', value: 45 },
        { name: 'MyBatis', value: 40 }, { name: '算法', value: 30 }
      ]
    }]
  });
  charts.push(myChart);
};
// --- 初始化折线图 ---
const initLine = () => {
  if (!lineChartRef.value) return;
    lineChart = echarts.init(lineChartRef.value);
    lineChart.setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        axisLine: { lineStyle: { color: '#999' } }
      },
      yAxis: { type: 'value', splitLine: { lineStyle: { type: 'dashed' } } },
      series: [
        {
          name: '访问量',
          type: 'line',
          smooth: true,
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(64, 158, 255, 0.5)' },
              { offset: 1, color: 'rgba(64, 158, 255, 0.01)' }
            ])
          },
          itemStyle: { color: '#409EFF' },
          data: [120, 132, 101, 134, 90, 230, 210]
        },
        {
          name: '独立访客',
          type: 'line',
          smooth: true,
          itemStyle: { color: '#67C23A' },
          data: [220, 182, 191, 234, 290, 330, 310]
        }
      ]
    });
  charts.push(lineChart);
};

// --- 初始化饼图 ---
const initPie = () => {
  if (!pieChartRef.value) return;
    pieChart = echarts.init(pieChartRef.value);
    pieChart.setOption({
      tooltip: { trigger: 'item' },
      legend: { bottom: '0%' },
      series: [
        {
          name: '分类占比',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: { show: false, position: 'center' },
          emphasis: {
            label: { show: true, fontSize: '20', fontWeight: 'bold' }
          },
          data: [
            { value: 1048, name: '前端技术' },
            { value: 735, name: '后端架构' },
            { value: 580, name: '随笔杂谈' },
            { value: 484, name: '算法' },
            { value: 300, name: 'DevOps' }
          ]
        }
      ]
    });
  charts.push(pieChart);
};
// 响应式调整
const handleResize = () => charts.forEach(c => c.resize());
onMounted(async () => {
  initStatCards();
  initWordCloud();
  initLine();
  initPie();
  await initMap();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  lineChart?.dispose();
  pieChart?.dispose();
});
</script>

<style scoped lang="scss">
.dashboard-container {
  padding: 20px;
  background-color: #f5f7fa; // 浅灰背景，突出卡片
  min-height: 100vh;
}

// 通用卡片样式优化
.el-card {
  border: none;
  border-radius: 12px; // 更圆润的边角
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px); // 悬停上浮效果
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
  }
}

.mb-4 {
  margin-bottom: 20px;
}

// 统计卡片特定样式
.stat-content {
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.stat-info {
  flex: 1;
  .stat-title {
    color: #909399;
    font-size: 14px;
    margin-bottom: 8px;
  }
  .stat-value {
    font-size: 28px;
    font-weight: 700;
    color: #303133;
    margin-bottom: 4px;
    font-family: 'DIN Alternate', sans-serif; // 如果有数字字体更好
  }
  .stat-trend {
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 4px;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: #303133;
}

// 评论列表
.comment-item {
  display: flex;
  align-items: flex-start;
  padding: 12px 0;
  border-bottom: 1px solid #ebeef5;

  &:last-child {
    border-bottom: none;
  }

  .comment-content {
    margin-left: 12px;
    flex: 1;
  }

  .comment-user {
    font-size: 14px;
    font-weight: 500;
    color: #303133;
    display: flex;
    justify-content: space-between;

    .time {
      color: #909399;
      font-size: 12px;
      font-weight: normal;
    }
  }

  .comment-text {
    font-size: 13px;
    color: #606266;
    margin-top: 4px;
    line-height: 1.4;
  }
}

// 辅助样式
.text-green { color: #67C23A; }
.text-red { color: #F56C6C; }
.text-gray { color: #909399; }
.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 300px;
}
.quick-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;

  .el-button {
    margin-left: 0;
    margin-bottom: 10px;
  }
}
</style>