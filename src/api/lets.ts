import http from './http.ts';




export const getLetsById  = async (id: any) => {
    return await http.get(`/api/lets/get/${id}`);
};

export const checkDns  = async (id: any) => {
    return await http.get(`/api/lets/check-dns/${id}`);
};

export const confirmData  = async (id: any) => {
    return await http.get(`/api/lets/confirm/${id}`);
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

export const toggleAutoRenew = async (id: any, autoRenew: number) => {
    return await http.put(`/api/lets/${id}/toggle-renew?autoRenew=${autoRenew}`);
};


export const previewTemplate  = async () => {
    try {
        return http.get('/api/lets/shell/preview_template')  ;
    } catch (error) {
        console.error(error);
    }
};


export const saveDeploy = (data?: object) => {
    return http.post(
        '/api/lets/save-deploy',
        data
    );
};
