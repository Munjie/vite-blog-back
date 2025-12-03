import http from './http.ts';



export const getTaskList = (data?: object) => {
    return http.post(
        '/api/task/page-task',
        data
    );
};



export function deleteTask(taskId: number) {
    return http.delete<void>('/api/task/delete-task', { taskId: taskId });
}

export const uploadTask = (data?: object) => {
    debugger
    return http.post(
        '/api/score-manage/upload',
        data
    );
};


export function exportReport(taskId: number) {
    return http.get<Blob>('/api/task/export-report', { taskId: taskId });
}

