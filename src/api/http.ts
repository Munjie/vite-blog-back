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



service.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const userStore = useUserStore()
        const token = userStore.getExpireToken()
        const whitelist = ['/auth/login', '/login',  '/logout','/wechat', '/qq', '/github', '/gitee']
        const isWhiteList = config.url && whitelist.some(path => config.url!.includes(path))
        if (isWhiteList) {
            return config
        }
        if (!token) {
            // 避免在登录页重复触发跳转
            if (router.currentRoute.value.name !== 'login') {
                ElMessage.closeAll()
                // 清除本地残留的失效用户信息/缓存
                userStore.logout?.()

                // 干净利落地直接跳转，带上回跳地址
                router.push({
                    name: 'login',
                    query: {
                        redirect: router.currentRoute.value.fullPath,
                    },
                })
            }
            return Promise.reject(new Error('登录已过期或未登录，请求已被前端成功拦截'))
        }
        if (token && token !== 'undefined' && token !== 'null') {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error: AxiosError) => {
        ElMessage.error('请求配置出错，请检查网络')
        return Promise.reject(error)
    }
)

/*// 4. 响应拦截器 (Response Interceptor)
service.interceptors.response.use(
    (response: AxiosResponse) => {
        debugger
        const code = response.data.code;
        const message = response.data.message;
        if (response.status === 200) {
            if (code === undefined) {
                return response;
            }else {
                if (code === 200) {
                    return response.data;
                } else {
                    ElMessage.error(message || '系统错误')
                    return Promise.reject();
                }
            }
        }else {
            ElMessage.error( message || '系统错误')
            return Promise.reject();
        }
    },
    (error: AxiosError) => {
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
);*/




const handleUnauthorized = (backendMessage: string) => {
    const userStore = useUserStore();
    if (router.currentRoute.value.name !== 'login') {
        ElMessage.closeAll();
        ElMessage.error(backendMessage || '登录状态已过期，请重新登录');
        userStore.logout?.();
        router.push({
            name: 'login',
            query: {
                redirect: router.currentRoute.value.fullPath
            }
        });
    }
};

// 4. 响应拦截器 (Response Interceptor)
service.interceptors.response.use(
    (response: AxiosResponse) => {
        const resData = response.data;
        const { code, message } = resData;
        // http.ts 响应拦截器内部
        if (code === 200) {
            return resData;
        } else if (code === 401){
            handleUnauthorized(message);
            return Promise.reject(new Error(message || '未授权'));
        }else {
            console.warn(`❌ 接口请求业务失败，路径: ${response.config.url}, 原因: ${message}`);
            ElMessage.error(message || '系统错误');
            return Promise.reject(resData);
        }
        ElMessage.error(message || '系统错误');
        return Promise.reject(resData);
    },
    (error: AxiosError) => {
        let message = '';
        if (error.response) {
            const status = error.response.status;
            const backendMessage = (error.response.data as any)?.message;
            switch (status) {
                case 400: message = backendMessage || '请求语法错误(400)'; break;
                case 401:
                    handleUnauthorized(backendMessage);
                    return Promise.reject(error);
                case 403: message = '由于权限原因，服务器拒绝访问(403)'; break;
                case 404: message = '接口地址未找到(404)'; break;
                case 408: message = '请求超时(408)'; break;
                case 500: message = '服务器内部发生错误(500)'; break;
                case 502: message = '网关错误/服务器正在重启(502)'; break;
                case 503: message = '服务不可用/服务器超载(503)'; break;
                case 504: message = '网关超时/外部服务调用断开(504)'; break;
                default: message = backendMessage || `系统连接出错(${status})!`;
            }
        }
        else if (error.request) {
            if (error.message.includes('timeout')) {
                message = '客户端请求超时，请检查您的网络带宽';
            } else {
                message = '无法连接到服务器，请检查网络连接或确认服务是否开启';
            }
        }
        else {
            message = `由于未知异常导致请求发送失败: ${error.message}`;
        }
        ElMessage.error(message);
        return Promise.reject(error);
    }
);


// 5. 导出封装好的请求方法
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