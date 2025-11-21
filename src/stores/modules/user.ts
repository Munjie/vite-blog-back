import { defineStore } from 'pinia';
import { ref } from 'vue';
import { login as loginApi, type LoginReqForm } from '../../api/login.ts'; // 引入之前的 API


// 定义 User 状态的接口
export const useUserStore = defineStore(
    'user',
    () => {
        // --- State ---
        const token = ref<string>('');
        const username = ref<string>('');

        // --- Actions ---

        // 登录动作
        const login = async (loginForm: LoginReqForm) => {
            try {
                const res = await loginApi(loginForm);
                if (res.code === 200) {
                    // 设置状态
                    token.value = res.data.token;
                    username.value = res.data.username;
                    return Promise.resolve(res);
                } else {
                    return Promise.reject(res);
                }
            } catch (error) {
                return Promise.reject(error);
            }
        };

        // 登出动作
        const logout = () => {
            token.value = '';
            username.value = '';
            // 这里可以添加清除路由、重置标签页等逻辑
            // localStorage 里的数据会被插件自动清除（如果配置了 storage）
        };

        // 重置 Token (用于 401 过期时)
        const resetToken = () => {
            token.value = '';
            username.value = '';
        };

        return {
            token,
            username,
            login,
            logout,
            resetToken
        };
    },
    {
        // --- Persistence 配置 ---
        persist: {
            key: 'admin-user-store', // 存缓在 localStorage 中的 key 名称
            storage: localStorage,   // 默认就是 localStorage，也可以换成 sessionStorage
        },
    }
);