import http from './http.ts';




export const getLetsById  = async (id: any) => {
    return await http.get(`/api/lets/get/${id}`);
};


export const listCert  = async () => {
    try {
        return http.get('/api/lets/list')  ;
    } catch (error) {
        console.error(error);
    }
};

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



