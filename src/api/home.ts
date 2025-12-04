import http from './http.ts';


export const getHomeData = (data?: object) => {
    return http.post(
        '/api/home/home-data',
        data
    );
};






