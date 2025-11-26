// src/types/user.ts
export interface ApiResponse<T> {
    code: number
    message: string
    data: T // 通用：data 字段类型为 T（如 MenuItem[]）
}
export interface UserInfo {
    id: number
    username: string
    password:string
    token: string;
    roles?: string[] // 角色数组
}

export interface MenuItem {
    index: string
    label: string
    path: string
    pid?: string;
    icon?: string // Element Plus 图标名称，如 'House'
    children?: MenuItem[]
}

export interface Permission {
    index: string
    label: string
    path: string
    permissions: string[]

}

export interface tabs {
    path: string;
    index: string;
    label: string;
    icon: string
}[];



export interface User {
    id: number;
    name: string;
    password: string;
    email: string;
    phone: string;
    role: string;
    date: string;
}

export interface Register {
    username: string;
    password: string;
    email: string;
}