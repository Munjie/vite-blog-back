import http from './http.ts';



export const getTaskList = (data?: object) => {
    return http.post(
        '/api/score-manage/page-task',
        data
    );
};

export function deleteTask(taskId: number) {
    return http.delete<void>('/api/score-manage/delete-task', { taskId: taskId });
}



