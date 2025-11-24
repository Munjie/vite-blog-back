import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index'
import { setupStore } from './stores'
import ElementPlus from 'element-plus'
import {createPinia} from "pinia";
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import * as http from "./api/http.ts";
import * as ElementPlusIconsVue from '@element-plus/icons-vue'



const pina = createPinia();
pina.use(piniaPluginPersistedstate);

const app = createApp(App)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}
// 挂载到全局属性
app.config.globalProperties.$http = http;
setupStore(app)
app.use(pina)
app.use(router)
app.use(ElementPlus)
app.mount('#app')