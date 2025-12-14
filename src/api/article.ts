import http from "./http.ts";


export const addArticle = (data?: object) => {
    return http.post(
        '/api/article/add-article',
        data
    );
};


export const getArticleList = (data?: object) => {
    return http.post(
        '/api/article/page-all-article',
        data
    );
};


export function deleteArticle(id: number) {
    return http.delete<void>('/api/article/delete-article', { id: id });
}




export const updateArticleStatus = (data?: object) => {
    return http.post(
        '/api/article/update-article-status',
        data
    );
};



export function deleteCoverImage(coverUrl: string) {
    return http.delete<void>('/api/article/delete-cover-image', { coverUrl: coverUrl });
}


export const getAllTags  = async () => {
    try {
        return await http.get('/api/article/all-tags')  ;
    } catch (error) {
        console.error('获取数据失败:', error);
        return [];
    }
};


export const getAllCategory  = async () => {
    try {
        return await http.get('/api/article/all-category')  ;
    } catch (error) {
        console.error('获取数据失败:', error);
        return [];
    }
};