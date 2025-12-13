import http from './http.ts'
import type { UserInfo } from '../types/user.ts'
import type {UnwrapNestedRefs} from "vue";

// 用户登录
export const login = (params: UnwrapNestedRefs<{password: string; username: string }> & {}) => {
    // 返回的数据格式可以和服务端约定
    return http.post<UserInfo>('/api/user/login', params);
}

export const logout  = async () => {
    try {
        return await http.get('/api/user/logout')  ;
    } catch (error) {
        console.error(error);
    }
};