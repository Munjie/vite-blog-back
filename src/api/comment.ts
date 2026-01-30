import http from "./http.ts";




export const getAllComment = (data?: object) => {
    return http.post(
        '/api/back/page-all-comment',
        data
    );
};


export function deleteComment(id: number) {
    return http.delete<void>('/api/back/delete-comment', { id: id });
}


export const updateCommentStatus = (data?: object) => {
    return http.post(
        '/api/back/update-comment-status',
        data
    );
};


