import http from './http.ts';


export const getHomeData = (data?: object) => {
    return http.post(
        '/api/home/home-data',
        data
    );
};

export const getHomeAllTask  = async () => {
    try {
        return await http.get('/api/home/all-task')  ;
    } catch (error) {
        console.error('获取数据失败:', error);
        return [];
    }
};





