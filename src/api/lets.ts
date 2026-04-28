import http from './http.ts';

export const create = (data?: object) => {
    return http.post(
        '/api/lets/create',
        data
    );
};

export const pageLets = (data?: object) => {
    return http.post(
        '/api/lets/page-lets',
        data
    );
};

export function deleteDomain(id: number) {
    return http.delete<void>('/api/lets/delete', { id: id });
}



