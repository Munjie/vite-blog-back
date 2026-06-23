import http from "./http.ts";




export const getAllComment = (data?: object) => {
    return http.post(
        '/api/article/page-all-comment',
        data
    );
};


export function deleteComment(id: number) {
    return http.delete<void>('/api/article/delete-comment', { id: id });
}


export const updateCommentStatus = (data?: object) => {
    return http.post(
        '/api/article/update-comment-status',
        data
    );
};


