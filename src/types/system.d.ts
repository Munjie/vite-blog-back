

export interface Menu {
    id: number;
    pid: number;
    title: string;
    index: string;
    icon?: string;
    sort: number;
    createTime?: string;
    children?: Menu[];
}

export interface Role {
    id: number;
    roleName: string;
    status: number;
    createTime?: string;
}

export interface User {
    id: number;
    userName: string;
    avatar?: string;
    roleIds?: number[];
    roleNames?: string;
    roles?: Role[];
}


export interface UserForm {
    id?: number;
    userName: string;
    password?: string;
    avatar?: string;
    roleIds: number[];
}