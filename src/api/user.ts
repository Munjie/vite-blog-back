import http from './http.ts';





export const updateName = (data?: object) => {
    return http.put(
        '/api/system/update-name',
        data
    );
};


export const login = (data?: object) => {
    return http.post(
        '/api/user/login',
        data
    );
};

export const updatePwd = (data?: object) => {
    return http.put(
        '/api/user/update-pwd',
        data
    );
};