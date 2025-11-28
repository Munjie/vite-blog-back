import http from './http.ts';



export const getTaskList = (data?: object) => {
    return http.post(
        '/api/task/page-task',
        data
    );
};


export const uploadTask = (data?: object) => {
    debugger
    return http.post(
        '/api/score-manage/upload',
        data
    );
};
