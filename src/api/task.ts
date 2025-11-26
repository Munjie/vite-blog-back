import http from './http.ts';


export type Result = {
    code: number;
    message: string;
    data: any;
};


export const getTaskList = (data?: object) => {
    return http.post<Result>('/api/task/page-task', data);
};