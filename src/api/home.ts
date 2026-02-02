import http from './http.ts';




export const getHomeData = (data?: object) => {
    return http.post(
        '/api/dashboard/home-data',
        data
    );
};

export const getHomeAllTask  = async () => {
    try {
        return await http.get('/api/dashboard/all-task')  ;
    } catch (error) {
        console.error('获取数据失败:', error);
        return [];
    }
};



export const getVisitMap  = async () => {
    try {
        return await http.get('/api/dashboard/map-data')  ;
    } catch (error) {
        console.error('获取数据失败:', error);
        return [];
    }
};

export const getVisitLine  = async () => {
    try {
        return await http.get('/api/dashboard/line-data')  ;
    } catch (error) {
        console.error('获取数据失败:', error);
        return [];
    }
};


export const getComments  = async () => {
    try {
        return await http.get('/api/dashboard/latest-comments')  ;
    } catch (error) {
        console.error('获取数据失败:', error);
        return [];
    }
};



export const sendEmail  = async () => {
    try {
        return await http.get('/api/back/send-email')  ;
    } catch (error) {
        console.error('失败:', error);
        return null;
    }
};


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
