// 引入 request、post 和 get 函数
import http from './http.ts';
import type {MenuItem} from "../types/user.ts";



// 根据用户 ID 获取菜单
export const getUserMenu = async (userId: number): Promise<MenuItem[]> => {
    try {
        const response = await http.get(`/api/user/list-menu/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch user menu:', error);
        throw error;
    }
};