import http from './http.ts';



export const getScoreList = (data?: object) => {
    return http.post(
        '/api/score-manage/page-score',
        data
    );
};



