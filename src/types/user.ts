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
    pid: number
    sort: number
    index: string
    label: string
    path: string
    icon?: string // Element Plus 图标名称，如 'House'
    children?: MenuItem[]
}

export interface Permission {
    id: number
    name: string // 如 'user:view'
    description?: string
}

export interface tabs {
    path: string;
    index: string;
    label: string;
    icon: string
}[];