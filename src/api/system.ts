
import request from './http.ts';
import type {Menu, Role, UserForm} from '../types/system';
import http from "./http.ts";


export const getMenuTree  = async () => {
    try {
        return request.get<Menu[]>('/api/system/list-all-menu');
    } catch (error) {
        console.error('获取数据失败:', error);
        return [];
    }
};
export const addMenu = (data: Menu) => {
    return request.post('/api/system/save-menu', data);
};
export const updateMenu = (data: Menu) => {
    return request.put('/api/system/update-menu', data);
};
export const deleteMenu = (id: number) => {
    return request.delete(`/api/system/delete-menu/${id}`);
};

// ================= 角色管理 =================

export const getRoleList = (data?: object) => {
    return request.post(
        '/api/system/page-all-role',
        data
    );
};
export const addUpdateRole = (data: Role) => {
    return request.post('/api/system/add-update-role', data);
};

export const deleteRole = (id: number) => {
    return request.delete(`/api/system/delete-role/${id}`);
};

export const getRoleMenuIds = (roleId: number) => {
        return  request.get(`/api/system/role-menu-id/${roleId}`)  ;
};
// 分配权限
export const assignRolePermissions = (roleId: number, menuIds: number[]) => {
    return request.post('/api/system/assign-permission', { roleId, menuIds });
};

// ================= 用户管理 =================

export const getUserList = (data?: object) => {
    return request.post(
        '/api/system/page-all-user',
        data
    );
};

export const addUser = (data: UserForm) => {
    return request.post('/api/system/add-user', data);
};
export const updateUser = (data: UserForm) => {
    return request.put('/api/system/update-user', data);
};
export const deleteUser = (id: number) => {
    return request.delete(`/api/system/delete-user/${id}`);
};


export const getAllRoles = () => {
    return request.get<Role[]>('/api/system/list-all-role');
};

export const resetUserPassword = (userId: number) => {
    return request.put<null>(`/api/system/reset-pwd/${userId}`);
};

/*消息模板管理*/


export const listTemplate  = async () => {
    return await http.get(`/api/system/list-template`);
};

export const syncTemplate  = async () => {
    return await http.get(`/api/system/sync-template`);
};


export const updateTemplate = (data?: object) => {
    return http.post(
        '/api/system/update-template',
        data
    );
};