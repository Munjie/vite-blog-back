import http from './http.ts';



export const getTaskList = (data?: object) => {
    return http.post(
        '/api/task/page-task',
        data
    );
};
