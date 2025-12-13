import axios, {
    type AxiosInstance,
    type AxiosError,
    type AxiosResponse,
    type InternalAxiosRequestConfig
} from 'axios';
import {ElMessage} from "element-plus";
import router from "../router";
import { useUserStore } from '../stores';


// 1. 定义后端返回的标准数据结构
// 这里的结构根据你们后端的实际返回修改，通常包含 code, data, message
export interface Result<T = any> {
    code: number;
    message: string;
    data: T;
}

const isDevelopment = import.meta.env.MODE === 'development'
// 2. 创建 axios 实例
const service: AxiosInstance = axios.create({
    baseURL: isDevelopment ? '' : import.meta.env.VITE_APP_API_URL,
    timeout: 10000, // 请求超时时间
    headers: {
        'Content-Type': 'application/json;charset=utf-8',
    },
});

// 3. 请求拦截器 (Request Interceptor)
// 请求拦截器（完美版）
service.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const userStore = useUserStore();
        // 优先从 Pinia 拿 token（推荐），没有再 fallback 到 localStorage
        let token = userStore.getToken || localStorage.getItem('token') || ''
        // 如果还是没有，说明真的没登录 → 拦截请求 + 跳转登录
        if (!token) {
            // 避免在登录页重复跳转
            if (router.currentRoute.value.name !== 'login') {
                ElMessage.closeAll()
                // 清除残留的无效状态
                userStore.logout?.()
                // 跳转登录并带上当前页面地址（登录成功后自动跳回来）
                Promise.reject().then(() =>   router.push({
                    name: 'login',
                    query: {
                        redirect: router.currentRoute.value.fullPath,
                    },
                }));
            }
        }
        // 有 token 就塞进 header（标准 Bearer 格式）
        config.headers.Authorization = `Bearer ${token}`
        return config
    },
    (error: AxiosError) => {
        // 请求配置出错（比如没网、timeout）
        ElMessage.error('请求出错，请检查网络')
        return Promise.reject(error)
    }
)

// 4. 响应拦截器 (Response Interceptor)
service.interceptors.response.use(
    (response: AxiosResponse) => {
        // 这里的 response.data 是后端返回的原始数据
        if (response.status === 200) {
            const code = response.data.code;
            const message = response.data.message;
            if (code === undefined) {
                return response;
            }else {
                if (code === 200) {
                    // 直接返回其中的 data，这样前端调用时就不用多解构一层
                    return response.data;
                } else {
                    ElMessage.error(message || '系统错误')
                    return Promise.reject(new Error(message || 'Error'));
                }
            }
        }else {
            ElMessage.error( '系统错误')
            return Promise.reject(new Error('Error'));
        }
    },
    (error: AxiosError) => {
        // 处理 HTTP 状态码错误 (如 404, 500, Network Error)
        let message = '';
        const status = error.response?.status;

        switch (status) {
            case 400:
                message = '请求错误(400)';
                break;
            case 401:
                message = '登录过期,请重新登录';
                router.push({ name: 'login' })
                break;
            case 403:
                message = '拒绝访问(403)';
                break;
            case 404:
                message = '请求出错(404)';
                break;
            case 408:
                message = '请求超时(408)';
                break;
            case 500:
                message = '服务器错误(500)';
                break;
            case 502:
                message = '网络错误(502)';
                break;
            case 503:
                message = '服务不可用(503)';
                break;
            case 504:
                message = '网络超时(504)';
                break;
            default:
                message = `连接出错(${status})!`;
        }
        ElMessage.error(message)
        return Promise.reject(error);
    }
);


// 5. 导出封装好的请求方法
// 这里我们通过泛型 T 指定返回数据的类型，Result<T> 对应上面定义的接口
const http = {
    get<T = any>(url: string, params?: object): Promise<Result<T>> {
        return service.get(url, {params});
    },

    post<T = any>(url: string, data?: object): Promise<Result<T>> {
        return service.post(url, data);
    },

    put<T = any>(url: string, data?: object): Promise<Result<T>> {
        return service.put(url, data);
    },

    delete<T = any>(url: string, params?: object): Promise<Result<T>> {
        return service.delete(url, {params});
    }
};

export default http;