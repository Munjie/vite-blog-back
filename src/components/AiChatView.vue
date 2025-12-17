<template>
    <el-button
        type="primary"
        circle
        size="large"
        class="floating-btn"
        @click="toggleDrawer"
    >
        <el-icon size="24"><ChatDotRound /></el-icon>
    </el-button>
    <el-drawer
        v-model="drawerVisible"
        title="AI 助手"
        direction="rtl"
    size="800px"
    :with-header="true"

    >
    <div class="chat-container" >
        <aside class="chat-sidebar glass-panel" :class="{ 'collapsed': !showSidebar }">
            <el-button class="new-chat-btn" @click="createNewChat" :icon="Plus">新对话</el-button>

            <div class="history-list">
                <div
                    v-for="item in sessions"
                    :key="item.id"
                    :class="['history-item', { active: currentSessionId === item.id }]"
                    @click="switchSession(item.id)"
                >
                    <el-icon><ChatLineRound /></el-icon>
                    <span class="title">{{ item.title }}</span>
                    <el-icon class="del-btn" @click="deleteSession(item.id, $event)"><Delete /></el-icon>
                </div>
            </div>
        </aside>
        <main class="chat-main" v-if="currentSession">
            <div class="messages-wrapper" ref="scrollRef">
                <div v-for="(msg, index) in currentSession.messages" :key="index" :class="['message-row', msg.role]">
                    <div class="avatar">
                        <el-icon v-if="msg.role === 'assistant'"><Cpu /></el-icon>
                        <el-icon v-else><User /></el-icon>
                    </div>
                    <div class="message-content glass-panel">
                        <div class="text">
                            <MarkdownPreview :content="msg.content" />
                        </div>
                        <div class="message-actions" v-if="msg.role === 'assistant' && msg.content">
                            <el-icon class="copy-icon" @click="copyText(msg.content)"><DocumentCopy /></el-icon>
                        </div>
                    </div>
                </div>
                <div v-if="isTyping" class="message-row assistant">
                        AI 正在思考
                    <div class="typing-indicator"><span>.</span><span>.</span><span>.</span></div>
                </div>
            </div>

            <div class="input-area glass-panel">
                <el-input
                        v-model="userInput"
                        type="textarea"
                        :autosize="{ minRows: 1, maxRows: 5 }"
                        placeholder="给 DeepSeek 发送消息..."
                        @keyup.enter.prevent="sendMessage"
                />
                <el-button
                        class="send-btn"
                        type="primary"
                        :disabled="!userInput || isTyping"
                        @click="sendMessage"
                        icon="Promotion"
                />
            </div>
        </main>
    </div>
    </el-drawer>
</template>

<script setup lang="ts">

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface ChatSession {
    id: string;
    title: string;
    messages: Message[];
    updateTime: number;
}
import { ref, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {Cpu, User, DocumentCopy, Plus} from '@element-plus/icons-vue'
import MarkdownPreview from '@/components/MarkdownPreview.vue'
// --- 状态定义 ---
const drawerVisible = ref(false)
// const visible = defineModel<boolean>('visible', { required: true })
const STORAGE_KEY = 'nocturne_chat_history'
const sessions = ref<ChatSession[]>([])
const currentSessionId = ref<string>('')
const isTyping = ref(false)
const userInput = ref('')
const scrollRef = ref<HTMLElement | null>(null)
const showSidebar = ref(true)
const isDevelopment = import.meta.env.MODE === 'development'
// --- 计算当前活动的会话 ---
const currentSession = ref<ChatSession | null>(null)

const baseURL = isDevelopment ? 'http://localhost:8090/blog/chat/completions' : '/api/chat/completions'



// 切换函数
const toggleDrawer = () => {
    drawerVisible.value = !drawerVisible.value
}
// --- 核心：初始化加载 ---
onMounted(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
        sessions.value = JSON.parse(saved)
        // 修复：显式判断数组长度
        if (sessions.value.length > 0 && sessions.value[0]) {
            switchSession(sessions.value[0].id)
        } else {
            createNewChat()
        }
    } else {
        createNewChat()
    }
})

// --- 核心：保存到本地 ---
const saveToLocal = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.value))
}

// --- 创建新对话 ---
const createNewChat = () => {
    const newId = Date.now().toString()
    const newSession: ChatSession = {
        id: newId,
        title: '新对话',
        messages: [{ role: 'assistant', content: '你好！我是 AI 助手，今天想聊点什么？' }],
        updateTime: Date.now()
    }
    sessions.value.unshift(newSession)
    switchSession(newId)
    saveToLocal()
}

// --- 切换会话 ---
const switchSession = (id: string) => {
    currentSessionId.value = id
    const session = sessions.value.find(s => s.id === id)
    if (session) {
        currentSession.value = session
        scrollToBottom()
    }
}

const deleteSession = (id: string, event: Event) => {
    event.stopPropagation()
    ElMessageBox.confirm('确定要删除这段对话吗？', '提示').then(() => {
        sessions.value = sessions.value.filter(s => s.id !== id)
        if (sessions.value.length === 0) {
            createNewChat()
        } else if (currentSessionId.value === id) {
            // 修复：安全访问第一个元素的 ID
            const firstSession = sessions.value[0]
            if (firstSession) {
                switchSession(firstSession.id)
            }
        }
        saveToLocal()
    })
}
// --- 发送消息 ---
const sendMessage = async () => {
    if (!userInput.value || isTyping.value || !currentSession.value) return

    const userContent = userInput.value

    // 1. 如果是新对话的第一条消息，更新标题
    if (currentSession.value.messages.length === 1 && currentSession.value.title === '新对话') {
        currentSession.value.title = userContent.substring(0, 15) + (userContent.length > 15 ? '...' : '')
    }

    currentSession.value.messages.push({ role: 'user', content: userContent })
    currentSession.value.updateTime = Date.now()
    userInput.value = ''
    isTyping.value = true
    await scrollToBottom()

    // 2. 准备 AI 占位
    currentSession.value.messages.push({ role: 'assistant', content: '' })
    const lastIndex = currentSession.value.messages.length - 1

    try {
        const response = await fetch(baseURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: "DeepSeek-R1-0528-Qwen3-8B",
                stream: true,
                messages: currentSession.value.messages.slice(0, -1)
            })
        })

        if (!response.body) return
        const reader = response.body.getReader()
        const decoder = new TextDecoder()

        while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value)
            const lines = chunk.split('\n')
            lines.forEach(line => {
                if (line.startsWith('data:')) {
                    const dataStr = line.slice(5).trim()
                    if (dataStr === '[DONE]') return
                    try {
                        const data = JSON.parse(dataStr)
                        const delta = data.choices[0].delta.content

                        // --- sendMessage 内部的流式解析部分 ---
                        if (delta && currentSession.value) {
                            // 修复：获取目标消息引用并进行空值判断
                            const targetMessage = currentSession.value.messages[lastIndex]
                            if (targetMessage) {
                                targetMessage.content += delta
                                scrollToBottom()
                            }
                        }

                    } catch (e) {}
                }
            })
        }
        // 成功结束后保存一次
        saveToLocal()
    } catch (error) {
        ElMessage.error('网络错误')
        isTyping.value = false
    } finally {
        isTyping.value = false
    }
}

const copyText = (text: string) => {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text)
            .then(() => ElMessage.success('已复制到剪贴板'))
            .catch(() => fallbackCopy(text));
    } else {
        // 2. 兜底方案解决线上不能复制问题
        fallbackCopy(text);
    }
}


const scrollToBottom = async () => {
    await nextTick()
    if (scrollRef.value) {
        scrollRef.value.scrollTop = scrollRef.value.scrollHeight
    }
}

// 兜底方案实现
const fallbackCopy = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;

    // 确保 textarea 在页面上不可见但可操作
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "0";
    document.body.appendChild(textArea);

    textArea.focus();
    textArea.select();

    try {
        const successful = document.execCommand('copy');
        if (successful) {
            ElMessage.success('已复制到剪贴板');
        } else {
            ElMessage.error('复制失败，请手动选择复制');
        }
    } catch (err) {
        ElMessage.error('浏览器不支持自动复制');
    }

    document.body.removeChild(textArea);
}

</script>

<style scoped lang="scss">
.chat-container {
  display: flex;
  height: calc(100vh - var(--header-height));
  background: var(--bg-color);
}

.chat-sidebar {
  width: 100px;
  border-right: 1px solid var(--glass-border);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  @media (max-width: 768px) { display: none; }
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
}

.messages-wrapper {
  flex: 1;
  overflow-y: auto;
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.message-row {
  display: flex;
  gap: 20px;
  max-width: 85%;
  &.user {
    align-self: flex-end;
    flex-direction: row-reverse;
    .message-content { background: var(--accent-color); color: white; }
  }
}

.avatar {
  width: 35px;
  height: 35px;
  border-radius: 8px;
  background: #333;
  display: flex;
  align-items: center;
  justify-content: center;
}

.message-content {
  padding: 2px 15px;
  border-radius: 12px;
  position: relative;
  .message-actions {
    position: absolute;
    bottom: -25px;
    right: 5px;
    cursor: pointer;
    color: var(--text-secondary);
    &:hover { color: var(--accent-color); }
  }
}

.input-area {
  margin: 20px;
  padding: 10px;
  border-radius: 15px;
  display: flex;
  align-items: flex-end;
  gap: 10px;
  :deep(.el-textarea__inner) {
    background: transparent !important;
    box-shadow: none !important;
    border: none !important;
    color: white;
  }
}

.typing-indicator span {
  animation: blink 1.4s infinite;
  &:nth-child(2) { animation-delay: 0.2s; }
  &:nth-child(3) { animation-delay: 0.4s; }
}
@keyframes blink { 0% { opacity: 0.2; } 20% { opacity: 1; } 100% { opacity: 0.2; } }
.history-list {
    flex: 1;
    overflow-y: auto;
    margin-top: 10px;
}

.history-item {
    display: flex;
    align-items: center;
    padding: 12px;
    margin-bottom: 8px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    color: var(--text-secondary);
    position: relative;
    border: 1px solid transparent;

    &:hover {
        background: rgba(255, 255, 255, 0.05);
        .del-btn { opacity: 1; }
    }

    &.active {
        background: rgba(99, 102, 241, 0.1);
        border-color: rgba(99, 102, 241, 0.3);
        color: var(--accent-color);
    }

    .title {
        flex: 1;
        margin-left: 10px;
        font-size: 14px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        padding-right: 20px;
    }

    .del-btn {
        position: absolute;
        right: 10px;
        opacity: 0;
        transition: opacity 0.2s;
        &:hover { color: #f56c6c; }
    }
}

.new-chat-btn {
    width: 100%;
    background: transparent !important;
    border: 1px dashed var(--glass-border) !important;
    color: var(--text-primary) !important;
    &:hover {
        border-color: var(--accent-color) !important;
        color: var(--accent-color) !important;
    }
}

.floating-btn {
    position: fixed;
    bottom: 40px;
    left: 40px;
    z-index: 999;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>