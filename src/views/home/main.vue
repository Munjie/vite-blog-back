<template>
    <div class="welcome-container">
        <div class="welcome-banner">
            <div class="banner-content">
                <div class="user-info">
                    <el-avatar :size="80" :src="avatarUrl" class="user-avatar" />
                    <div class="info-text">
                        <h1 class="greeting">{{username}} ,  {{ timeState.greeting }}</h1>
                        <p class="sub-title">
                            {{ timeState.dateStr }} · {{ timeState.weekStr }} |
                            <el-icon class="weather-icon"><Cloudy /></el-icon> 多云转晴，24℃
                        </p>
                    </div>
                </div>
                <div class="illustration">
                    <img src="https://undraw.co/api/illustrations/randomizer?tag=programming" alt="working" />
                </div>
            </div>
        </div>

        <el-row :gutter="20" class="main-content">
            <el-col :xs="24" :lg="16">
                <el-row :gutter="20">
                    <el-col :span="12" :xs="24">
                        <el-card shadow="hover" class="clock-card">
                            <div class="clock-box">
                                <div class="time">{{ timeState.timeStr }}</div>
                                <div class="second">{{ timeState.secondStr }}</div>
                            </div>
                            <div class="clock-desc">当前系统时间</div>
                        </el-card>
                    </el-col>
                    <el-col :span="12" :xs="24">
                        <el-card shadow="hover" class="quote-card">
                            <div class="quote-content">
                                <el-icon class="quote-icon"><chat-dot-square /></el-icon>
                                <p class="quote-text">“{{ dailyQuote.content }}”</p>
                                <p class="quote-author">—— {{ dailyQuote.author }}</p>
                            </div>
                        </el-card>
                    </el-col>
                </el-row>

                <el-card shadow="hover" class="mt-4 tools-card">
                    <template #header>
                        <div class="card-header">
                            <span><el-icon><Menu /></el-icon> 快捷工作台</span>
                        </div>
                    </template>
                    <div class="tools-grid">
                        <div class="tool-item" v-for="tool in tools" :key="tool.name">
                            <div class="icon-wrapper" :style="{ background: tool.bgColor }">
                                <el-icon :color="tool.color" :size="24"><component :is="tool.icon" /></el-icon>
                            </div>
                            <span class="tool-name">{{ tool.name }}</span>
                        </div>
                    </div>
                </el-card>

                <el-card shadow="hover" class="mt-4 calendar-card">
                    <el-calendar v-model="currentDate">
                        <template #header="{ date }">
                            <span>{{ date }}</span>
                            <el-button-group>
                                <el-button size="small" @click="selectDate('prev-month')">上月</el-button>
                                <el-button size="small" @click="selectDate('today')">今天</el-button>
                                <el-button size="small" @click="selectDate('next-month')">下月</el-button>
                            </el-button-group>
                        </template>
                    </el-calendar>
                </el-card>
            </el-col>

            <el-col :xs="24" :lg="8">
                <el-card shadow="hover" class="notice-card">
                    <template #header>
                        <div class="card-header">
                            <span><el-icon><Bell /></el-icon> 系统公告</span>
                            <el-button link type="primary">更多</el-button>
                        </div>
                    </template>
                    <div class="timeline-box">
                        <el-timeline>
                            <el-timeline-item
                                v-for="(activity, index) in notices"
                                :key="index"
                                :type="activity.type"
                                :color="activity.color"
                                :timestamp="activity.timestamp"
                                :hollow="index === 0"
                            >
                                <h4 class="notice-title">{{ activity.title }}</h4>
                                <p class="notice-desc">{{ activity.content }}</p>
                            </el-timeline-item>
                        </el-timeline>
                    </div>
                </el-card>

                <el-card shadow="hover" class="mt-4 version-card">
                    <div class="version-content">
                        <img src="https://element-plus.org/images/element-plus-logo.svg" class="logo" />
                        <h3>Vue3 Admin Pro</h3>
                        <p>当前版本：v2.5.0 (2025-01-09)</p>
                        <el-divider />
                        <div class="link-group">
                            <el-link :icon="Document" :underline="false">使用文档</el-link>
                            <el-link :icon="ChatLineRound" :underline="false">反馈问题</el-link>
                        </div>
                    </div>
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import {
    Cloudy, ChatDotSquare, Menu, Bell,
    Calendar, User, Setting, Lock, Service, Document, ChatLineRound
} from '@element-plus/icons-vue';

import {useUserStore} from '../../stores';
const store = useUserStore();
// --- 1. 时间逻辑 ---
const currentDate = ref(new Date());
const selectDate = (val: string) => {
    if (!currentDate.value) return;
    if(val === 'today') currentDate.value = new Date();
};

const timeState = reactive({
    greeting: '',
    dateStr: '',
    weekStr: '',
    timeStr: '',
    secondStr: ''
});

let timer: number | null = null;

const updateTime = () => {
    const now = new Date();
    const hour = now.getHours();

    if (hour < 6) timeState.greeting = '夜深了，注意休息';
    else if (hour < 9) timeState.greeting = '早上好，新的一天开始了';
    else if (hour < 12) timeState.greeting = '上午好，工作顺利';
    else if (hour < 14) timeState.greeting = '中午好，记得午休';
    else if (hour < 18) timeState.greeting = '下午好，继续加油';
    else timeState.greeting = '晚上好，愿你度过美好夜晚';


    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    timeState.dateStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;
    timeState.weekStr = days[now.getDay()];

    // 时间 HH:mm
    timeState.timeStr = [now.getHours(), now.getMinutes()].map(n => n < 10 ? '0' + n : n).join(':');
    timeState.secondStr = (now.getSeconds() < 10 ? '0' : '') + now.getSeconds();
};

// --- 2. 静态数据 ---
const avatarUrl = store.getAvatar;
const username = store.getUsername;

const dailyQuote = ref({
    content: '复杂的事情简单做，简单的事情重复做，重复的事情用心做。',
    author: '佚名'
});

const tools = [
    { name: '个人中心', icon: User, color: '#409EFF', bgColor: '#ecf5ff' },
    { name: '修改密码', icon: Lock, color: '#F56C6C', bgColor: '#fef0f0' },
    { name: '系统设置', icon: Setting, color: '#909399', bgColor: '#f4f4f5' },
    { name: '日程安排', icon: Calendar, color: '#E6A23C', bgColor: '#fdf6ec' },
    { name: '帮助文档', icon: Document, color: '#67C23A', bgColor: '#f0f9eb' },
    { name: '联系客服', icon: Service, color: '#8e44ad', bgColor: '#f9f0ff' },
];

const notices = [
    {
        title: '系统维护通知',
        content: '为了提供更好的服务，系统将于本周六凌晨 02:00 进行服务器升级。',
        timestamp: '2024-05-20',
        type: 'primary',
        color: '#409EFF'
    },
    {
        title: '五一放假安排',
        content: '请各位同事提前安排好工作，祝大家假期愉快！',
        timestamp: '2024-04-28',
        type: 'success',
        color: '#67C23A'
    },
    {
        title: '新功能上线：暗黑模式',
        content: '点击右上角设置图标即可体验全新的夜间模式。',
        timestamp: '2024-04-15',
        type: '',
        color: ''
    }
];

// --- 生命周期 ---
onMounted(() => {
    updateTime();
    timer = setInterval(updateTime, 1000);
});

onUnmounted(() => {
    if (timer) clearInterval(timer);
});
</script>

<style scoped lang="scss">
.welcome-container {
    // 1. Banner Area
    .welcome-banner {
        background: linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%);
        border-radius: 12px;
        padding: 30px 40px;
        margin-bottom: 20px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);

        .banner-content {
            display: flex;
            justify-content: space-between;
            align-items: center;

            .user-info {
                display: flex;
                align-items: center;
                gap: 20px;

                .user-avatar {
                    border: 4px solid rgba(255, 255, 255, 0.5);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }

                .greeting {
                    font-size: 28px;
                    color: #2c3e50;
                    margin: 0 0 8px 0;
                    font-weight: 600;
                }

                .sub-title {
                    font-size: 16px;
                    color: rgba(44, 62, 80, 0.7);
                    margin: 0;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
            }

            .illustration {
                height: 120px;
                img {
                    height: 100%;
                    object-fit: contain;
                    opacity: 0.9;
                }
                // 移动端隐藏插图
                @media (max-width: 768px) {
                    display: none;
                }
            }
        }
    }

    .mt-4 { margin-top: 20px; }

    // 2. Clock & Quote
    .clock-card {
        height: 100%;
        background: #2c3e50; // 深色背景，突出时间
        color: #fff;
        border: none;

        .clock-box {
            display: flex;
            align-items: baseline;
            justify-content: center;
            gap: 5px;

            .time {
                font-size: 48px;
                font-weight: bold;
                line-height: 1.2;
                font-family: 'Courier New', Courier, monospace; // 等宽字体更有时钟感
            }
            .second {
                font-size: 20px;
                color: #909399;
            }
        }
        .clock-desc {
            text-align: center;
            color: rgba(255,255,255,0.6);
            font-size: 13px;
        }
    }

    .quote-card {
        height: 100%;
        background: #fff;

        .quote-content {
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            position: relative;
            padding-left: 20px;

            .quote-icon {
                font-size: 32px;
                color: #E6A23C;
                opacity: 0.3;
                position: absolute;
                top: -10px;
                left: 0;
            }

            .quote-text {
                font-size: 15px;
                color: #303133;
                font-style: italic;
                line-height: 1.6;
                margin-bottom: 10px;
            }

            .quote-author {
                text-align: right;
                color: #909399;
                font-size: 13px;
            }
        }
    }

    // 3. Tools Grid
    .tools-card {
        .tools-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
            gap: 20px;

            .tool-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                padding: 15px 0;
                border-radius: 8px;
                transition: transform 0.2s;

                &:hover {
                    background: #f8f9fa;
                    transform: translateY(-3px);
                }

                .icon-wrapper {
                    width: 50px;
                    height: 50px;
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 10px;
                }

                .tool-name {
                    font-size: 13px;
                    color: #606266;
                }
            }
        }
    }

    // 4. Calendar styling
    .calendar-card {
        // 强制缩小日历尺寸以适应 Dashboard 布局
        :deep(.el-calendar-table .el-calendar-day) {
            height: 40px;
            text-align: center;
            line-height: 40px;
            padding: 0;
        }
        :deep(.el-calendar__body) {
            padding: 12px 20px;
        }
    }

    // 5. Timeline Notice
    .notice-card {
        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            span {
                display: flex;
                align-items: center;
                gap: 6px;
                font-weight: 600;
            }
        }

        .timeline-box {
            padding: 10px 0;

            .notice-title {
                margin: 0;
                font-size: 14px;
                color: #303133;
            }
            .notice-desc {
                margin: 5px 0 0;
                font-size: 12px;
                color: #909399;
            }
        }
    }

    // 6. Version Card
    .version-card {
        .version-content {
            text-align: center;
            padding: 10px 0;

            .logo { width: 50px; margin-bottom: 10px; }
            h3 { margin: 0; font-size: 16px; color: #303133; }
            p { color: #909399; font-size: 12px; margin: 5px 0 15px; }

            .link-group {
                display: flex;
                justify-content: center;
                gap: 20px;
            }
        }
    }
}
</style>