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
import 'highlight.js/styles/atom-one-dark.css';
import 'github-markdown-css/github-markdown-dark.css';
import 'element-plus/theme-chalk/dark/css-vars.css'
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
app.component("v-chart", Echarts);
app.mount('#app')