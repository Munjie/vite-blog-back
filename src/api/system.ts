
import request from './http.ts';
import type {Menu, Role, UserForm} from '../types/system';


export const getMenuTree  = async () => {
    try {
        return request.get<Menu[]>('/api/system/list-all-menu');
    } catch (error) {
        console.error('获取数据失败:', error);
        return [];
    }
};
export const addMenu = (data: Menu) => {
    return request.post('/api/back/save-menu', data);
};
export const updateMenu = (data: Menu) => {
    return request.put('/api/back/update-menu', data);
};
export const deleteMenu = (id: number) => {
    return request.delete(`/api/back/delete-menu/${id}`);
};

// ================= 角色管理 =================

export const getRoleList = (data?: object) => {
    return request.post(
        '/api/back/page-all-role',
        data
    );
};
export const addUpdateRole = (data: Role) => {
    return request.post('/api/back/add-update-role', data);
};

export const deleteRole = (id: number) => {
    return request.delete(`/api/back/delete-role/${id}`);
};

export const getRoleMenuIds = (roleId: number) => {
        return  request.get(`/api/back/role-menu-id/${roleId}`)  ;
};
// 分配权限
export const assignRolePermissions = (roleId: number, menuIds: number[]) => {
    return request.post('/api/back/assign-permission', { roleId, menuIds });
};

// ================= 用户管理 =================

export const getUserList = (data?: object) => {
    return request.post(
        '/api/back/page-all-user',
        data
    );
};

export const addUser = (data: UserForm) => {
    return request.post('/api/back/add-user', data);
};
export const updateUser = (data: UserForm) => {
    return request.put('/api/back/update-user', data);
};
export const deleteUser = (id: number) => {
    return request.delete(`/api/back/delete-user/${id}`);
};


export const getAllRoles = () => {
    return request.get<Role[]>('/api/back/list-all-role');
};

export const resetUserPassword = (userId: number) => {
    return request.put<null>(`/api/back/reset-pwd/${userId}`);
};