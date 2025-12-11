import http from "./http.ts";


export const addArticle = (data?: object) => {
    return http.post(
        '/api/article/add-article',
        data
    );
};
