<template>
    <div class="digital-twin-page">
        <div ref="containerRef" class="three-container"></div>

        <!-- 右侧设备控制面板 -->
        <transition name="slide">
            <div v-if="selectedDevice" class="device-panel">
                <div class="panel-header">
                    <h3>{{ selectedDevice.name }}</h3>
                    <el-button text @click="selectedDevice = null">
                        <el-icon><Close /></el-icon>
                    </el-button>
                </div>

                <div class="panel-body">
                    <div class="status-row">
                        <span>状态</span>
                        <el-switch v-model="selectedDevice.isOn" @change="onToggle" />
                    </div>

                    <div class="slider-row">
                        <span>亮度 {{ selectedDevice.brightness }}%</span>
                        <el-slider
                            v-model="selectedDevice.brightness"
                            :disabled="!selectedDevice.isOn"
                            @change="onBrightnessChange"
                        />
                    </div>

                    <div class="slider-row">
                        <span>色温 {{ selectedDevice.colorTemp }}K</span>
                        <el-slider
                            v-model="selectedDevice.colorTemp"
                            :min="2700"
                            :max="6500"
                            :step="100"
                            :disabled="!selectedDevice.isOn"
                        />
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { SceneManager } from '../../three/SceneManager.ts'
import { Close } from '@element-plus/icons-vue'

interface DeviceState {
    id: string
    name: string
    isOn: boolean
    brightness: number
    colorTemp: number
}

const containerRef = ref<HTMLElement>()
let sceneManager: SceneManager | null = null
const selectedDevice = ref<DeviceState | null>(null)

const devices = ref<Record<string, DeviceState>>({
    light_living: {
        id: 'light_living',
        name: '客厅主灯',
        isOn: true,
        brightness: 80,
        colorTemp: 3000
    },
    light_bedroom: {
        id: 'light_bedroom',
        name: '主卧灯',
        isOn: false,
        brightness: 60,
        colorTemp: 4000
    }
})

onMounted(async () => {
    await nextTick()
    if (!containerRef.value) return

    containerRef.value.style.height = `calc(100vh - 84px)`
    containerRef.value.style.width = '100%'

    sceneManager = new SceneManager(containerRef.value)

    try {
        // 加载模型
        await sceneManager.loadHouse('/models/house.glb');

        // 模型加载并正确缩放贴地后再放设备
        sceneManager.placeDevicesRelativeToHouse()

        // 同步设备状态
        Object.values(devices.value).forEach((d) => {
            sceneManager?.updateDeviceState(d.id, d.isOn, d.brightness / 100)
        })
    } catch (err) {
        console.error('模型加载失败:', err)
    }

    containerRef.value.addEventListener('device-click', onDeviceClick as EventListener)
})

onBeforeUnmount(() => {
    containerRef.value?.removeEventListener('device-click', onDeviceClick as EventListener)
    sceneManager?.dispose()
})

function onDeviceClick(e: CustomEvent) {
    const { id } = e.detail
    if (devices.value[id]) {
        selectedDevice.value = { ...devices.value[id] }
    }
}

function onToggle(val: boolean) {
    if (!selectedDevice.value || !sceneManager) return
    const id = selectedDevice.value.id
    devices.value[id].isOn = val
    selectedDevice.value.isOn = val
    sceneManager.updateDeviceState(id, val, selectedDevice.value.brightness / 100)
}

function onBrightnessChange(val: number) {
    if (!selectedDevice.value || !sceneManager) return
    const id = selectedDevice.value.id
    devices.value[id].brightness = val
    sceneManager.updateDeviceState(id, selectedDevice.value.isOn, val / 100)
}
</script>

<style scoped>
.digital-twin-page {
    position: relative;
    width: 100%;
    height: calc(100vh - 84px);
    min-height: 500px;
    overflow: hidden;
    background: #0f172a;
}

.three-container {
    width: 100%;
    height: 100%;
}

.device-panel {
    position: absolute;
    top: 20px;
    right: 20px;
    width: 300px;
    background: rgba(15, 23, 42, 0.92);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 16px 20px;
    color: #fff;
    z-index: 10;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45);
}

.panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

.panel-header h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
}

.status-row,
.slider-row {
    margin-bottom: 18px;
}

.status-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.slider-row span {
    display: block;
    margin-bottom: 6px;
    font-size: 13px;
    opacity: 0.85;
}

.slide-enter-active,
.slide-leave-active {
    transition: all 0.25s ease;
}
.slide-enter-from,
.slide-leave-to {
    opacity: 0;
    transform: translateX(20px);
}
</style>