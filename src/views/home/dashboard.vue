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
import {
  Document, View, ChatLineRound, Monitor,
} from '@element-plus/icons-vue';

// --- 类型定义 ---
interface StatCardItem {
  title: string;
  value: string | number;
  icon: any;
  color: string;
  trend: number;
}

// --- 状态数据 ---
const timeRange = ref('week');
const lineChartRef = ref<HTMLElement | null>(null);
const pieChartRef = ref<HTMLElement | null>(null);
let lineChart: echarts.ECharts | null = null;
let pieChart: echarts.ECharts | null = null;

// 模拟顶部卡片数据
const statCards = ref<StatCardItem[]>([
  { title: '总文章数', value: 128, icon: markRaw(Document), color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', trend: 12 },
  { title: '总访问量', value: '45.2k', icon: markRaw(View), color: 'linear-gradient(135deg, #2af598 0%, #009efd 100%)', trend: 5.4 },
  { title: '总评论数', value: 342, icon: markRaw(ChatLineRound), color: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)', trend: -2.1 },
  { title: '系统负载', value: '24%', icon: markRaw(Monitor), color: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)', trend: 0.5 },
]);

const format = (percentage: number) => (percentage === 100 ? 'Full' : `${percentage}%`);

// --- 图表初始化 ---
const initCharts = () => {
  // 1. 折线图配置
  if (lineChartRef.value) {
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
  }

  // 2. 饼图配置
  if (pieChartRef.value) {
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
  }
};

// 响应式调整
const handleResize = () => {
  lineChart?.resize();
  pieChart?.resize();
};

onMounted(() => {
  initCharts();
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