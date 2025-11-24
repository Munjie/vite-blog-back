// 引入 request、post 和 get 函数
import http from './http.ts';



export const getMenu = async (data: any) => {
    try {
        debugger
         // 使用封装的 get 方法
        return await http.get('/api/user/list-menu/'+data)  ;
    } catch (error) {
        console.error('获取菜单数据失败:', error);
        return [];
    }
};