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



// export const getVisitCount  = async () => {
//     try {
//         return await http.get('/api/dashboard/stat-cards')  ;
//     } catch (error) {
//         console.error('获取数据失败:', error);
//         return [];
//     }
// };



export const getVisitCount = async () => {
    try {
        const response = await http.get('/api/dashboard/stat-cards')
        // 取出后端真正的 data（数组）
        const apiData = response.data
        if (!apiData) {
            return []
        }
        return apiData || []
    } catch (error) {
        console.error('获取数据失败:', error)
        return []
    }
}
