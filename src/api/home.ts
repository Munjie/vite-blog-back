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



export const getVisitMap  = async () => {
    try {
        return await http.get('/api/home/map-data')  ;
    } catch (error) {
        console.error('获取数据失败:', error);
        return [];
    }
};



export const getVisitCount  = async () => {
    try {
        return await http.get('/api/dashboard/visit')  ;
    } catch (error) {
        console.error('获取数据失败:', error);
        return [];
    }
};




