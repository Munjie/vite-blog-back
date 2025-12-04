import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index'
import { setupStore } from './stores'
import ElementPlus from 'element-plus'
import {createPinia} from "pinia";
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import * as http from "./api/http.ts";
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'element-plus/dist/index.css';
import './assets/css/icon.css';
import * as echarts from 'echarts'
import Echarts from "vue-echarts";
import { usePermissStore } from './stores/permiss';
const pina = createPinia();
pina.use(piniaPluginPersistedstate);

const app = createApp(App)
app.config.globalProperties.$echarts = echarts

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}
// 挂载到全局属性
app.config.globalProperties.$http = http;
setupStore(app)
app.use(pina)
app.use(router)
app.use(ElementPlus)
// 自定义权限指令
const permiss = usePermissStore();
app.directive('permiss', {
    mounted(el, binding) {
        if (binding.value && !permiss.key.includes(String(binding.value))) {
            el['hidden'] = true;
        }
    },
});
app.component("v-chart", Echarts);
app.mount('#app')